import { useParams, useNavigate } from "react-router"
import { useRef, useState, useEffect, useContext, useMemo } from "react"
import axios from "axios";
import Message from "./Message";
import { io } from "socket.io-client"
import nacl from "tweetnacl";
import naclUtil from "tweetnacl-util";
import Chatusers from "../Context/Chatusers";
import inmobileContext from "../Context/Inmobile";
import Hideelement from "../Context/Hideelement";

interface encryptedMessageProps {
    encryptedmessage: string,
    iv: string,
}

interface MessageProps {
    message: encryptedMessageProps,
    sender: string,
    receiver: string,
    status: string
}

interface user {
    isonline: boolean,
    email: string,
    username: string,
    password: string,
    repeatPassword: string,
    fname: string
    signatureprivatekey: string
    signaturepublickey: string,
    cryptoprivatekey: string
    cryptopublickey: string
    description: string
    gender: string
}

interface newMessageProps {
    message: encryptedMessageProps,
    sender: string,
    receiver: string,
    status: string,
    signaturepublickey: string,
    cryptopublickey: string
}

const Chat = () => {
    const { username = '' } = useParams();
    const { receiver = '' } = useParams();
    const Navigate = useNavigate()
    const receiverdata = useRef<user>({ email: '', username: '', password: '', repeatPassword: '', fname: '', description: '', signatureprivatekey: '', signaturepublickey: '', cryptoprivatekey: '', cryptopublickey: '', gender: '', isonline: false })
    const senderdata = useRef<user>({ email: '', username: '', password: '', repeatPassword: '', fname: '', description: '', signatureprivatekey: '', signaturepublickey: '', cryptoprivatekey: '', cryptopublickey: '', gender: '', isonline: false })
    const [receiverdetails, setreceiverdetails] = useState<user>({ email: '', username: '', password: '', repeatPassword: '', fname: '', description: '', signatureprivatekey: '', signaturepublickey: '', cryptoprivatekey: '', cryptopublickey: '', gender: '', isonline: false })
    const [message, setmessage] = useState<string>('')
    const chatuser = useContext(Chatusers)
    const inmobile = useContext(inmobileContext)
    const hideelement = useContext(Hideelement)
    const [profilevisibility, setprofilevisibility] = useState<boolean>(false)
    const [isuser, setIsuser] = useState(false)
    const textareaRef = useRef<HTMLInputElement>(null);
    const [messages, setmessages] = useState<MessageProps[]>([])
    const keypair = useRef({ cryptokey: '', signaturekey: '' })

    const socket = useMemo(() => {
        try {
            return io(`${import.meta.env.VITE_SERVER_URL}`);
        } catch (e) {
            console.log('error connection');
            return null;
        }
    }, []);


    useEffect(() => {

        try {
            const dbRequest = indexedDB.open("Credentials", 1);
            dbRequest.onsuccess = function () {
                const db = dbRequest.result;
                const tx = db.transaction("users", "readonly");
                const store = tx.objectStore("users");

                const getRequest = store.get(1);
                getRequest.onsuccess = async function () {
                    const cryptokey = await getRequest.result.cryptokey
                    const signaturekey = await getRequest.result.signinkey
                    keypair.current.cryptokey = cryptokey;
                    keypair.current.signaturekey = signaturekey;
                };
            };

            dbRequest.onerror = function () {
                console.error("Error opening database:", dbRequest.error);
            };
        } catch (error) {
            console.error("Error accessing IndexedDB:", error);
        }
        const getdata = async () => {
            await axios.post(`${import.meta.env.VITE_SERVER_URL}/api/setstatus`, { receiver: username, status: 'delivered' })
            socket?.emit("user_status", username, true)
            await axios.post(`${import.meta.env.VITE_SERVER_URL}/api/isonline`, { username: username, isonline: true });
            let user = await axios.post(`${import.meta.env.VITE_SERVER_URL}/api/userdata`, { username: username }, { headers: { 'Content-Type': 'application/json' } })
            receiverdata.current = user.data
        }
        getdata()

        socket?.on("isin_chat", async (room: string, receiver: string) => {
            if (!receiver) return console.log('no receiver');
            console.log(receiver, username);
            if (receiver === username) {
                setmessages(prevMessages =>
                    prevMessages.map(msg => ({ ...msg, status: 'seen' }))
                );
                await axios.post(`${import.meta.env.VITE_SERVER_URL}/api/setstatus`, { room: room, status: 'seen' })
            }
        })

        socket?.on("user_status", async (username: string, status: boolean) => {
            await axios.post(`${import.meta.env.VITE_SERVER_URL}/api/isonline`, { username: username, isonline: status });
            if (senderdata.current.username === username) {
                setreceiverdetails(prev => ({ ...prev, isonline: status }))
                setmessages(prevMessages => prevMessages.map(msg => ({ ...msg, status: msg.status === 'sent' ? 'delivered' : msg.status })))
            }
        })

        const handleTabClose = async (username: string) => {
            socket?.emit("user_status", username, false)
            await axios.post(`${import.meta.env.VITE_SERVER_URL}/api/isonline`, { username: username, isonline: false });
        };

        window.addEventListener("beforeunload", () => handleTabClose(username!));

        return () => {
            window.removeEventListener("beforeunload", () => handleTabClose(username!));
            socket?.disconnect()
        };

    }, [])

    useEffect(() => {
        const checkuser = async () => {
            const roomname = [username, receiver].sort().join('_')

            socket?.off("receive_message");

            socket?.on("receive_message", async (message: newMessageProps) => {
                console.log(message.receiver, username);
                if (message.receiver !== username) return
                const sharedKey = deriveSharedSecret(keypair.current.cryptokey, senderdata.current.cryptopublickey);
                const decryptedmessage = await decryptMessage(message.message.encryptedmessage, message.message.iv, sharedKey);
                const verifiedMessage = verifyMessage(decryptedmessage, senderdata.current.signaturepublickey);
                if (!verifiedMessage) return console.log('unverified');
                setmessages(prevMessages => [...prevMessages, { message: { encryptedmessage: verifiedMessage, iv: message.message.iv }, sender: message.sender, receiver: message.receiver, status: message.status }])
                console.log('current receiver', receiver);
                socket.emit("isinchat", roomname, receiver)
            })

            if (!receiver) {
                console.log('no receiver', receiver);
                return setIsuser(false)
            };
            const chechuser = await axios.post(`${import.meta.env.VITE_SERVER_URL}/api/auth`, { usermail: receiver })
            if (!chechuser.data.result) {
                console.log(chechuser.data);
                Navigate("/404page")
                return
            }
            else {
                setIsuser(true)
            }
            setmessages([])

            chatuser?.setchatusers((prevUsers: any) =>
                prevUsers.map((user: any) =>
                    user.username === receiver ? { ...user, messagecount: 0 } : user
                )
            );

            socket?.emit("seen_message", roomname, username)
            const res = await axios.post(`${import.meta.env.VITE_SERVER_URL}/api/userdata`, { username: receiver })
            senderdata.current = res.data
            setreceiverdetails(res.data)
            const messages = await axios.post(`${import.meta.env.VITE_SERVER_URL}/api/getmessages`, { room: roomname })
            if (messages.data.length === 0 && receiverdata.current.isonline) {
                console.log(receiverdata.current.isonline, receiver, messages.data.length);
                socket?.emit("new_chat", roomname, receiver)
            }
            messages.data.forEach(async (message: MessageProps) => {
                await processMessage(message);
            })

            socket?.emit("join_room", roomname, username)

            socket?.on("message_status", async (room: string, username: string) => {
                console.log(receiver, username);
                if (receiver === username) {
                    console.log(receiver, username);
                    setmessages(prevMessages =>
                        prevMessages.map(msg => ({ ...msg, status: 'seen' }))
                    );
                    await axios.post(`${import.meta.env.VITE_SERVER_URL}/api/setstatus`, { room: room, status: 'seen' })
                }
            })

        }
        if (textareaRef.current) {
            textareaRef.current.focus();
        }
        checkuser()
    }, [receiver])

    const deriveSharedSecret = (privateKey: any, recipientPublicKey: string) => {
        const privKeyUint8 = naclUtil.decodeBase64(privateKey);
        const pubKeyUint8 = naclUtil.decodeBase64(recipientPublicKey);
        return nacl.box.before(pubKeyUint8, privKeyUint8)
    };

    async function decryptMessage(encryptedData: string, iv: string, sharedKey: Uint8Array) {
        const key = await window.crypto.subtle.importKey(
            "raw",
            sharedKey,
            { name: "AES-GCM" },
            false,
            ["decrypt"]
        );

        const decrypted = await window.crypto.subtle.decrypt(
            { name: "AES-GCM", iv: naclUtil.decodeBase64(iv) },
            key,
            naclUtil.decodeBase64(encryptedData)
        );

        return new TextDecoder().decode(decrypted);
    }

    const verifyMessage = (signedMessage: string, publicKey: string) => {
        const signedMessageUint8 = naclUtil.decodeBase64(signedMessage);
        const publicKeyUint8 = naclUtil.decodeBase64(publicKey);
        const verifiedMessage = nacl.sign.open(signedMessageUint8, publicKeyUint8);
        return verifiedMessage ? naclUtil.encodeUTF8(verifiedMessage) : null;
    };

    const processMessage = async (message: MessageProps) => {
        if (!senderdata.current.cryptopublickey) return console.log('no public key');
        const sharedKey = deriveSharedSecret(keypair.current.cryptokey, senderdata.current.cryptopublickey);
        const decryptedmessage = await decryptMessage(message.message.encryptedmessage, message.message.iv, sharedKey);
        const verifiedMessage = verifyMessage(decryptedmessage, senderdata.current.signaturepublickey);
        if (!verifiedMessage) {
            const secondverifiedmessage = verifyMessage(decryptedmessage, receiverdata.current.signaturepublickey);
            if (!secondverifiedmessage) return
            setmessages((prevMessages) => [
                ...prevMessages,
                {
                    message: { encryptedmessage: secondverifiedmessage, iv: message.message.iv },
                    sender: message.sender,
                    receiver: message.receiver,
                    status: message.status
                }
            ]);
            return
        }
        setmessages((prevMessages) => [
            ...prevMessages,
            {
                message: { encryptedmessage: verifiedMessage, iv: message.message.iv },
                sender: message.sender,
                receiver: message.receiver,
                status: message.status
            }
        ]);
    };



    const handlesubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        const signMessage = (message: string, privateKey: string) => {
            const messageUint8 = naclUtil.decodeUTF8(message);
            const privateKeyUint8 = naclUtil.decodeBase64(privateKey);
            const signedMessage = nacl.sign(messageUint8, privateKeyUint8);
            return naclUtil.encodeBase64(signedMessage);
        };

        async function encryptMessage(message: string, sharedKey: Uint8Array) {
            const iv = window.crypto.getRandomValues(new Uint8Array(12))
            const encoder = new TextEncoder();
            const key = await window.crypto.subtle.importKey(
                "raw",
                sharedKey,
                { name: "AES-GCM" },
                false,
                ["encrypt"]
            );

            const ciphertext = await window.crypto.subtle.encrypt(
                { name: "AES-GCM", iv: iv },
                key,
                encoder.encode(message)
            );

            return {
                encryptedData: naclUtil.encodeBase64(new Uint8Array(ciphertext)),
                iv: naclUtil.encodeBase64(iv),
            };
        }

        const sharedKey = deriveSharedSecret(keypair.current.cryptokey, senderdata.current.cryptopublickey)
        const signedMessage = signMessage(message, keypair.current.signaturekey);
        const encryptedmessage = await encryptMessage(signedMessage, sharedKey)
        const room = [username, receiver].sort().join('_')
        socket?.emit("send_message", { message: { message: { encryptedmessage: encryptedmessage.encryptedData, iv: encryptedmessage.iv }, sender: username, receiver: receiver, status: 'sent', cryptopublickey: receiverdata.current.cryptopublickey, signaturepublickey: receiverdata.current.signaturepublickey }, room: room })
        setmessages([...messages, { message: { encryptedmessage: message, iv: encryptedmessage.iv }, sender: username, receiver: receiver, status: receiverdetails?.isonline ? 'delivered' : 'sent' }])
        setmessage('')
        const users = await axios.post(`${import.meta.env.VITE_SERVER_URL}/api/getmessages`, { room: room })
        if (users.data.length === 0) {
            chatuser?.setchatusers((prevMessages) => [
                ...prevMessages,
                {
                    username: receiverdetails.username,
                    lastmessage: { encryptedmessage: message, iv: encryptedmessage.iv },
                    date: new Date().toLocaleDateString('en-US', {
                        month: 'numeric',
                        day: 'numeric',
                        year: '2-digit'
                    }),
                    signaturepublickey: receiverdetails.signaturepublickey,
                    cryptopublickey: receiverdetails.cryptopublickey,
                    messagecount: 0
                }
            ]);
        }
        await axios.post(`${import.meta.env.VITE_SERVER_URL}/api/savemessage`, { message: { encryptedmessage: encryptedmessage.encryptedData, iv: encryptedmessage.iv }, sender: username, receiver: receiver, status: receiverdetails?.isonline ? 'delivered' : 'sent', room: room })
    }

    const handleback = () => {
        setIsuser(false)
        hideelement?.setHideelement(false)
        Navigate(`/dashboard/${username}`)
    }

    return (
        <>
            {isuser ? <div className={`w-[75%] ${inmobile ? 'flex' : 'hidden'} flex-col justify-between h-screen bg-[url("/default.png")] bg-cover bg-fixed max-md:w-full ${inmobile?.inmobile === true && hideelement?.hideelemenmt === false ? 'hidden size-0' : ''}`}>

                <div className="px-2 flex sticky top-0 z-20 items-center bg-gradient-to-r w-full p-3 from-[#1a1a1a] </div>via-[#252525] to-[#1a1a1a]">
                    <button onClick={handleback}>
                        <img className="size-8 mr-3 ml-1 max-md:size-6" src="/left-arrow.png" alt="arrow" />
                    </button>
                    <div onMouseOver={() => setprofilevisibility(true)} onClick={() => setprofilevisibility(!profilevisibility)} className="flex cursor-pointer gap-4 items-center">
                        <div className="relative">
                            <div className="relative inline-flex items-center justify-center w-10 h-10 overflow-hidden bg-gradient-to-t from-[#7345be] via-[#7d53bf] to-[#9667e3] rounded-full">
                                <span className="text-lg font-bold text-gray-600 dark:text-gray-300">
                                    {receiverdetails?.fname && receiverdetails?.fname.split(' ').length > 1
                                        ? `${receiverdetails?.fname.split(' ')[0][0]?.toUpperCase() ?? ''}${receiverdetails?.fname.split(' ')[1][0]?.toUpperCase() ?? ''}`
                                        : receiverdetails?.fname ? receiverdetails?.fname[0]?.toUpperCase() : ''}
                                </span>
                            </div>
                            {receiverdetails?.isonline ? <span className={`top-0 left-7 absolute w-4 h-4 bg-green-400 border-2 border-white dark:border-gray-800 rounded-full`} ></span>
                                : <span className={`top-0 left-7 absolute w-4 h-4 bg-red-600 border-2 border-white dark:border-gray-800 rounded-full`} ></span>
                            }
                        </div>
                        <div className="flex flex-col gap-1">
                            <div className="font-bold text-neutral-300  leading-none text-lg">{receiverdetails?.username}</div>
                            <div className=" leading-none text-neutral-500 text-sm">{receiverdetails?.fname}</div>
                        </div>
                    </div>
                </div>

                {profilevisibility && <div onMouseLeave={() => setprofilevisibility(false)} data-popover id="popover-bottom" role="tooltip" className="absolute ml-10 top-20 z-20 w-72 text-sm text-gray-200 transition-opacity duration-300 bg-gradient-to-r from-[#252525] via-[#1a1a1a] to-[#252525] border border-gray-700 rounded-lg shadow-lg dark:text-gray-400 dark:border-gray-600">
                    <div className="px-4 flex gap-5 py-3 border-b border-gray-700 rounded-t-lg dark:border-gray-600">
                        <div className="relative">
                            <div className="relative inline-flex items-center justify-center w-10 h-10 overflow-hidden bg-gradient-to-t from-[#7345be] via-[#7d53bf]</div> to-[#9667e3] rounded-full">
                                <span className="text-lg font-bold text-gray-600 dark:text-gray-300">
                                    {receiverdetails?.fname && receiverdetails?.fname.split(' ').length > 1
                                        ? `${receiverdetails?.fname.split(' ')[0][0]?.toUpperCase() ?? ''}${receiverdetails?.fname.split(' ')[1][0]?.toUpperCase() ?? ''}`
                                        : receiverdetails?.fname ? receiverdetails?.fname[0]?.toUpperCase() : ''}
                                </span>
                            </div>
                            {receiverdetails?.isonline ? <span className={`top-0 left-7 absolute w-4 h-4 bg-green-400 border-2 border-white dark:border-gray-800 rounded-full`} ></span>
                                : <span className={`top-0 left-7 absolute w-4 h-4 bg-red-600 border-2 border-white dark:border-gray-800 rounded-full`} ></span>
                            }
                        </div>
                        <div className="flex flex-col gap-1">
                            <div className="font-bold text-neutral-300  leading-none text-lg">{receiverdetails?.username}</div>
                            <div className=" leading-none text-neutral-500 text-sm">{receiverdetails?.fname}</div>
                        </div>
                    </div>
                    <div className="px-4 py-3 space-y-2">
                        <p className="text-base"><strong className="text-neutral-200">Name:</strong> {receiverdetails?.fname}</p>
                        <p className="text-base"><strong className="text-neutral-200">Description:</strong> {receiverdetails?.description ? receiverdetails?.description : 'Empty'}</p>
                        <p className="text-base"><strong className="text-neutral-200">Gender:</strong> {receiverdetails?.gender ? receiverdetails?.gender : 'Not prefer to say'}</p>
                    </div>
                    <div data-popper-arrow></div>
                </div>}

                <div className="pb-4 mx-auto w-full text-white flex flex-col-reverse gap-5 overflow-y-auto h-full items-center justify-start">
                    {messages.slice(0).reverse().map((message, index) => {
                        return <Message key={index} message={message} />
                    })}
                </div>

                <form onSubmit={handlesubmit} className="flex mb-8 justify-center">
                    <label htmlFor="chat" className="sr-only">Your message</label>
                    <div className="flex w-[70%] items-center px-3 py-2 rounded-lg bg-[#1a1a1a] border border-gray-700 max-md:w-[90%]">
                        <input type="text" autoComplete="off" ref={textareaRef} id="chat" value={message} name="message" onChange={(e) => setmessage(e.target.value)} className="block mx-4 p-2.5 w-full text-sm text-gray-200 bg-[#252525] rounded-lg border border-gray-600 focus:ring-purple-500 focus:border-purple-500 dark:placeholder-gray-400 dark:focus:ring-purple-500 dark:focus:border-purple-500" placeholder="Your message..." required />
                        <button type="submit" className="inline-flex justify-center p-2 text-purple-500 rounded-full cursor-pointer hover:bg-purple-100 dark:hover:bg-gray-600">
                            <svg className="w-5 h-5 rotate-90 rtl:-rotate-90" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="curren</svg>tColor" viewBox="0 0 18 20">
                                <path d="m17.914 18.594-8-18a1 1 0 0 0-1.828 0l-8 18a1 1 0 0 0 1.157 1.376L8 18.281V9a1 1 0 0 1 2 0v9.281l6.758 1.689a1 1 0 0 0 1.156-1.376Z" />
                            </svg>
                            <span className="sr-only">Send message</span>
                        </button>
                    </div>
                </form>
            </div>
                : <div className={`w-[75%] overflow-y-auto flex flex-col justify-between min-h-full bg-[url("/default.png")] bg-cover bg-fixed max-md:w-full ${inmobile?.inmobile === true && hideelement?.hideelemenmt === false ? 'hidden size-0' : ''}`}></div>
            }
        </>
    )
}

export default Chat