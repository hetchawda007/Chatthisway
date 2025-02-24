import { useParams, useNavigate } from "react-router"
import { useRef, useState, useEffect, useMemo, useContext } from "react"
import axios from "axios";
import Message from "./Message";
import { io } from "socket.io-client"
import nacl from "tweetnacl";
import naclUtil from "tweetnacl-util";
import Userdata from "../Context/Userdata";

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

interface MessageProps {
    message: encryptedMessageProps,
    sender: string,
    receiver: string,
    status: string
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
    const userdetails = useContext(Userdata)
    const [message, setmessage] = useState<string>('')
    const [profilevisibility, setprofilevisibility] = useState<boolean>(false)
    const [isuser, setIsuser] = useState(false)
    const textareaRef = useRef<HTMLInputElement>(null);
    const [pendingMessages, setPendingMessages] = useState<MessageProps[]>([]);
    const [messages, setmessages] = useState<MessageProps[]>([])
    const cryptokey = useRef('empty')

    const socket = useMemo(() => {
        try {
            return io(`http://localhost:8080`);
        } catch (e) {
            console.log('error connection');
            return null;
        }
    }, []);

    const [userdata, setuserdata] = useState({
        email: '', username: '', password: '', repeatPassword: '', fname: '', description: '', signatureprivatekey: '', signaturepublickey: '', cryptoprivatekey: '', cryptopublickey: '', gender: '', isonline: false
    })

    useEffect(() => {
        try {
            const dbRequest = indexedDB.open("Credentials", 1);
            dbRequest.onsuccess = function () {
                const db = dbRequest.result;
                const tx = db.transaction("users", "readonly");
                const store = tx.objectStore("users");

                const getRequest = store.get(1);
                getRequest.onsuccess = async function () {
                    const key = await getRequest.result.cryptokey
                    cryptokey.current = key;
                };
            };

            dbRequest.onerror = function () {
                console.error("Error opening database:", dbRequest.error);
            };
        } catch (error) {
            console.error("Error accessing IndexedDB:", error);
        }
        socket?.on("connect", () => {
            console.log("connected", socket?.id);
        })
        socket?.on("receive_message", async (message: newMessageProps) => {
            const sharedKey = deriveSharedSecret(cryptokey.current, message.cryptopublickey);
            const decryptedmessage = await decryptMessage(message.message.encryptedmessage, message.message.iv, sharedKey);
            const verifiedMessage = verifyMessage(decryptedmessage, message.signaturepublickey);
            if (!verifiedMessage) return console.log('unverified');
            setmessages(prevMessages => [...prevMessages, { message: { encryptedmessage: verifiedMessage, iv: message.message.iv }, sender: message.sender, receiver: message.receiver, status: message.status }])
        })
        return () => {
            socket?.disconnect()
        }
    }, [])

    useEffect(() => {
        const checkuser = async () => {
            if (!receiver) return;
            const chechuser = await axios.post("http://localhost:8080/api/auth", { usermail: receiver })
            if (!chechuser.data.result) {
                Navigate("/404page")
                return
            }
            else {
                setIsuser(true)
            }
            const res = await axios.post("http://localhost:8080/api/userdata", { username: receiver })
            setuserdata(res.data)
            const roomname = [username, receiver].sort().join('_')
            const messages = await axios.post("http://localhost:8080/api/getmessages", { room: [username, receiver].sort().join('_') })
            console.log(messages.data);
            messages.data.forEach(async (message: MessageProps) => {
                await processMessage(message);
            })
            setmessages(messages.data)
            socket?.emit("join_room", roomname)
        }
        if (textareaRef.current) {
            textareaRef.current.focus();
        }
        checkuser()
    }, [receiver])

    useEffect(() => {
        if (userdetails?.user.cryptoprivatekey && pendingMessages.length > 0) {
            console.log("Processing stored messages...");
            pendingMessages.forEach((message) => processMessage(message));
            setPendingMessages([]); // Clear stored messages after processing
        }
    }, [userdetails]);

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
        if (!userdetails?.user.cryptoprivatekey) return;

        const sharedKey = deriveSharedSecret(cryptokey.current, userdata.cryptopublickey);
        const decryptedmessage = await decryptMessage(message.message.encryptedmessage, message.message.iv, sharedKey);
        const verifiedMessage = verifyMessage(decryptedmessage, userdata.signaturepublickey);

        if (!verifiedMessage) return console.log("Unverified message.");

        console.log("Processed message:", verifiedMessage);
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
        if (!userdetails?.user.signatureprivatekey) return

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
        const signedMessage = signMessage(message, userdetails.user.signatureprivatekey);
        const sharedKey = deriveSharedSecret(userdetails.user.cryptoprivatekey, userdata.cryptopublickey)
        const encryptedmessage = await encryptMessage(signedMessage, sharedKey)
        const room = [username, receiver].sort().join('_')
        socket?.emit("send_message", { message: { message: { encryptedmessage: encryptedmessage.encryptedData, iv: encryptedmessage.iv }, sender: username, receiver: receiver, status: 'sent', signaturepublickey: userdetails.user.signaturepublickey, cryptopublickey: userdetails.user.cryptopublickey }, room: room })
        setmessages([...messages, { message: { encryptedmessage: message, iv: encryptedmessage.iv }, sender: username, receiver: receiver, status: 'sent' }])
        setmessage('')
        const res = await axios.post("http://localhost:8080/api/savemessage", { message: { encryptedmessage: encryptedmessage.encryptedData, iv: encryptedmessage.iv }, sender: username, receiver: receiver, status: 'sent', room: room })
    }

    return (
        <>
            {isuser ? <div className='w-[75%] flex flex-col justify-between h-screen bg-[url("/default.jpg")] bg-cover bg-fixed'>

                <div className="px-2 flex sticky top-0 z-20 items-center bg-gradient-to-r w-full p-3 from-[#1a1a1a] via-[#252525] to-[#1a1a1a]">

                    <div onMouseOver={() => setprofilevisibility(true)} onClick={() => setprofilevisibility(!profilevisibility)} className="flex cursor-pointer gap-4 items-center">
                        <div className="relative">
                            <div className="relative inline-flex items-center justify-center w-10 h-10 overflow-hidden bg-gradient-to-t from-[#7345be] via-[#7d53bf] to-[#9667e3] rounded-full">
                                <span className="text-lg font-bold text-gray-600 dark:text-gray-300">
                                    {userdata.fname && userdata.fname.split(' ').length > 1
                                        ? `${userdata.fname.split(' ')[0][0]?.toUpperCase() ?? ''}${userdata.fname.split(' ')[1][0]?.toUpperCase() ?? ''}`
                                        : userdata.fname ? userdata.fname[0]?.toUpperCase() : ''}
                                </span>
                            </div>
                            {userdata.isonline ? <span className={`top-0 left-7 absolute w-4 h-4 bg-green-400 border-2 border-white dark:border-gray-800 rounded-full`} ></span>
                                : <span className={`top-0 left-7 absolute w-4 h-4 bg-red-600 border-2 border-white dark:border-gray-800 rounded-full`} ></span>
                            }
                        </div>
                        <div className="flex flex-col gap-1">
                            <div className="font-bold text-neutral-300  leading-none text-lg">{userdata.username}</div>
                            <div className=" leading-none text-neutral-500 text-sm">{userdata.fname}</div>
                        </div>
                    </div>
                </div>

                {profilevisibility && <div onMouseLeave={() => setprofilevisibility(false)} data-popover id="popover-bottom" role="tooltip" className="absolute ml-10 top-20 z-20 w-72 text-sm text-gray-200 transition-opacity duration-300 bg-gradient-to-r from-[#252525] via-[#1a1a1a] to-[#252525] border border-gray-700 rounded-lg shadow-lg dark:text-gray-400 dark:border-gray-600">
                    <div className="px-4 flex gap-5 py-3 border-b border-gray-700 rounded-t-lg dark:border-gray-600">
                        <div className="relative">
                            <div className="relative inline-flex items-center justify-center w-10 h-10 overflow-hidden bg-gradient-to-t from-[#7345be] via-[#7d53bf] to-[#9667e3] rounded-full">
                                <span className="text-lg font-bold text-gray-600 dark:text-gray-300">
                                    {userdata.fname && userdata.fname.split(' ').length > 1
                                        ? `${userdata.fname.split(' ')[0][0]?.toUpperCase() ?? ''}${userdata.fname.split(' ')[1][0]?.toUpperCase() ?? ''}`
                                        : userdata.fname ? userdata.fname[0]?.toUpperCase() : ''}
                                </span>
                            </div>
                            {userdata.isonline ? <span className={`top-0 left-7 absolute w-4 h-4 bg-green-400 border-2 border-white dark:border-gray-800 rounded-full`} ></span>
                                : <span className={`top-0 left-7 absolute w-4 h-4 bg-red-600 border-2 border-white dark:border-gray-800 rounded-full`} ></span>
                            }
                        </div>
                        <div className="flex flex-col gap-1">
                            <div className="font-bold text-neutral-300  leading-none text-lg">{userdata.username}</div>
                            <div className=" leading-none text-neutral-500 text-sm">{userdata.fname}</div>
                        </div>
                    </div>
                    <div className="px-4 py-3 space-y-2">
                        <p className="text-base"><strong className="text-neutral-200">Name:</strong> {userdata.fname}</p>
                        <p className="text-base"><strong className="text-neutral-200">Description:</strong> {userdata.description ? userdata.description : 'Empty'}</p>
                        <p className="text-base"><strong className="text-neutral-200">Gender:</strong> {userdata.gender ? userdata.gender : 'Not prefer to say'}</p>
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
                    <div className="flex w-[70%] items-center px-3 py-2 rounded-lg bg-[#1a1a1a] border border-gray-700">
                        <input type="text" autoComplete="off" ref={textareaRef} id="chat" value={message} name="message" onChange={(e) => setmessage(e.target.value)} className="block mx-4 p-2.5 w-full text-sm text-gray-200 bg-[#252525] rounded-lg border border-gray-600 focus:ring-purple-500 focus:border-purple-500 dark:placeholder-gray-400 dark:focus:ring-purple-500 dark:focus:border-purple-500" placeholder="Your message..." required />
                        <button type="submit" className="inline-flex justify-center p-2 text-purple-500 rounded-full cursor-pointer hover:bg-purple-100 dark:hover:bg-gray-600">
                            <svg className="w-5 h-5 rotate-90 rtl:-rotate-90" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 18 20">
                                <path d="m17.914 18.594-8-18a1 1 0 0 0-1.828 0l-8 18a1 1 0 0 0 1.157 1.376L8 18.281V9a1 1 0 0 1 2 0v9.281l6.758 1.689a1 1 0 0 0 1.156-1.376Z" />
                            </svg>
                            <span className="sr-only">Send message</span>
                        </button>
                    </div>
                </form>
            </div>
                : <div className='w-[75%] overflow-y-auto flex flex-col justify-between min-h-full bg-[url("/default.jpg")] bg-cover bg-fixed'></div>
            }
        </>
    )
}

export default Chat