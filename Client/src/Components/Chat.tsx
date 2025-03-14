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
import { motion } from 'framer-motion'
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

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
    const [loading, setLoading] = useState<boolean>(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);

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
            await axios.post(`${import.meta.env.VITE_SERVER_URL}/api/v1/setstatus`, { receiver: username, status: 'delivered' }, { withCredentials: true })
            socket?.emit("user_status", username, true)
            await axios.post(`${import.meta.env.VITE_SERVER_URL}/api/v1/isonline`, { username: username, isonline: true }, { withCredentials: true });
            let user = await axios.post(`${import.meta.env.VITE_SERVER_URL}/api/v1/userdata`, { username: username }, { withCredentials: true, headers: { 'Content-Type': 'application/json' } })
            receiverdata.current = user.data
        }
        getdata()

        socket?.on("isin_chat", async (room: string, receiver: string) => {
            if (!receiver) return
            if (receiver === username) {
                setmessages(prevMessages =>
                    prevMessages.map(msg => ({ ...msg, status: 'seen' }))
                );
                await axios.post(`${import.meta.env.VITE_SERVER_URL}/api/v1/setstatus`, { room: room, status: 'seen' }, { withCredentials: true })
            }
        })

        socket?.on("user_status", async (username: string, status: boolean) => {
            await axios.post(`${import.meta.env.VITE_SERVER_URL}/api/v1/isonline`, { username: username, isonline: status }, { withCredentials: true });
            if (senderdata.current.username === username) {
                setreceiverdetails(prev => ({ ...prev, isonline: status }))
                setmessages(prevMessages => prevMessages.map(msg => ({ ...msg, status: msg.status === 'sent' ? 'delivered' : msg.status })))
            }
        })

        const handleTabClose = async (username: string) => {
            socket?.emit("user_status", username, false)
            await axios.post(`${import.meta.env.VITE_SERVER_URL}/api/v1/isonline`, { username: username, isonline: false }, { withCredentials: true });
        };

        window.addEventListener("beforeunload", () => handleTabClose(username!));

        return () => {
            window.removeEventListener("beforeunload", () => handleTabClose(username!));
            socket?.disconnect()
        };

    }, [])

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        const checkuser = async () => {
            const roomname = [username, receiver].sort().join('_')

            socket?.off("receive_message");

            socket?.on("receive_message", async (message: newMessageProps) => {
                if (message.receiver !== username) return
                const sharedKey = deriveSharedSecret(keypair.current.cryptokey, senderdata.current.cryptopublickey);
                const decryptedmessage = await decryptMessage(message.message.encryptedmessage, message.message.iv, sharedKey);
                const verifiedMessage = verifyMessage(decryptedmessage, senderdata.current.signaturepublickey);
                if (!verifiedMessage) return console.log('unverified');
                setmessages(prevMessages => [...prevMessages, { message: { encryptedmessage: verifiedMessage, iv: message.message.iv }, sender: message.sender, receiver: message.receiver, status: message.status }])
                socket.emit("isinchat", roomname, receiver)
            })

            if (!receiver) {
                setIsuser(false)
                return
            };

            setLoading(true); // Start loading

            const chechuser = await axios.post(`${import.meta.env.VITE_SERVER_URL}/api/v1/auth`, { usermail: receiver }, { withCredentials: true })
            if (!chechuser.data.result) {
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
            const res = await axios.post(`${import.meta.env.VITE_SERVER_URL}/api/v1/userdata`, { username: receiver }, { withCredentials: true })
            senderdata.current = res.data
            setreceiverdetails(res.data)
            const messages = await axios.post(`${import.meta.env.VITE_SERVER_URL}/api/v1/getmessages`, { room: roomname }, { withCredentials: true })
            if (messages.data.length === 0 && receiverdata.current.isonline) {
                socket?.emit("new_chat", roomname, receiver)
            }

            // Process messages with a small delay to show skeleton loading
            setTimeout(() => {
                messages.data.forEach(async (message: MessageProps) => {
                    await processMessage(message);
                });
                setLoading(false); // End loading
            }, 800);

            socket?.emit("join_room", roomname, username)

            socket?.on("message_status", async (room: string, username: string) => {
                if (receiver === username) {
                    setmessages(prevMessages =>
                        prevMessages.map(msg => ({ ...msg, status: 'seen' }))
                    );
                    await axios.post(`${import.meta.env.VITE_SERVER_URL}/api/v1/setstatus`, { room: room, status: 'seen' }, { withCredentials: true })
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
        const users = await axios.post(`${import.meta.env.VITE_SERVER_URL}/api/v1/getmessages`, { room: room }, { withCredentials: true })
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
        await axios.post(`${import.meta.env.VITE_SERVER_URL}/api/v1/savemessage`, { message: { encryptedmessage: encryptedmessage.encryptedData, iv: encryptedmessage.iv }, sender: username, receiver: receiver, status: receiverdetails?.isonline ? 'delivered' : 'sent', room: room }, { withCredentials: true })
    }

    const handleback = () => {
        setIsuser(false)
        hideelement?.setHideelement(false)
        Navigate(`/dashboard/${username}`)
    }

    return (
        <>
            {isuser ? (
                <motion.div
                    className={`w-[75%] ${inmobile ? 'flex' : 'hidden'} flex-col justify-between h-screen bg-gradient-to-b from-[#16162a] to-[#1d1d35] bg-fixed max-md:w-full ${inmobile?.inmobile === true && hideelement?.hideelemenmt === false ? 'hidden size-0' : ''}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                >
                    <div className="px-2 flex sticky top-0 z-20 items-center bg-gradient-to-r w-full p-3 from-[#1a1a2a] via-[#252540] to-[#1a1a2a] shadow-md">
                        <motion.button
                            onClick={handleback}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="rounded-full p-1.5 hover:bg-indigo-600/20 transition-all"
                        >
                            <img className="size-7 mr-2 ml-1 max-md:size-6" src="/left-arrow.png" alt="arrow" />
                        </motion.button>
                        <div
                            onMouseOver={() => setprofilevisibility(true)}
                            onClick={() => setprofilevisibility(!profilevisibility)}
                            className="flex cursor-pointer gap-4 items-center p-2 rounded-lg hover:bg-indigo-600/10 transition-all"
                        >
                            <div className="relative">
                                <div className="relative inline-flex items-center justify-center w-12 h-12 overflow-hidden bg-gradient-to-br from-indigo-600 to-purple-700 rounded-full shadow-md shadow-purple-900/30">
                                    <span className="text-lg font-bold text-gray-100">
                                        {receiverdetails?.fname && receiverdetails?.fname.split(' ').length > 1
                                            ? `${receiverdetails?.fname.split(' ')[0][0]?.toUpperCase() ?? ''}${receiverdetails?.fname.split(' ')[1][0]?.toUpperCase() ?? ''}`
                                            : receiverdetails?.fname ? receiverdetails?.fname[0]?.toUpperCase() : ''}
                                    </span>
                                </div>
                                {receiverdetails?.isonline ? (
                                    <motion.span
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="top-0 left-8 absolute w-4 h-4 bg-green-500 border-2 border-[#1a1a2a] rounded-full"
                                    ></motion.span>
                                ) : (
                                    <motion.span
                                        initial={{ scale: 0 }}  
                                        animate={{ scale: 1 }}
                                        className="top-0 left-8 absolute w-4 h-4 bg-red-500 border-2 border-[#1a1a2a] rounded-full"
                                    ></motion.span>
                                )}
                            </div>
                            <div className="flex flex-col">
                                <div className="font-bold text-gray-100 leading-none text-lg">{receiverdetails?.username}</div>
                                <div className="leading-none text-indigo-300 text-sm mt-1">
                                    {receiverdetails?.isonline ? 'Online' : 'Offline'}
                                </div>
                            </div>
                        </div>
                    </div>

                    {profilevisibility && (
                        <motion.div
                            onMouseLeave={() => setprofilevisibility(false)}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2 }}
                            className="absolute ml-10 top-20 z-20 w-80 text-sm transition-opacity duration-300 bg-[#1e1e2f] border border-indigo-500/20 rounded-lg shadow-lg shadow-indigo-900/10"
                        >
                            <div className="px-5 flex gap-5 py-4 border-b border-indigo-500/20 rounded-t-lg">
                                <div className="relative">
                                    <div className="relative inline-flex items-center justify-center w-16 h-16 overflow-hidden bg-gradient-to-br from-indigo-600 to-purple-700 rounded-full shadow-md shadow-purple-900/30">
                                        <span className="text-2xl font-bold text-gray-100">
                                            {receiverdetails?.fname && receiverdetails?.fname.split(' ').length > 1
                                                ? `${receiverdetails?.fname.split(' ')[0][0]?.toUpperCase() ?? ''}${receiverdetails?.fname.split(' ')[1][0]?.toUpperCase() ?? ''}`
                                                : receiverdetails?.fname ? receiverdetails?.fname[0]?.toUpperCase() : ''}
                                        </span>
                                    </div>
                                    {receiverdetails?.isonline ? (
                                        <span className="top-0 left-12 absolute w-5 h-5 bg-green-500 border-2 border-[#1e1e2f] rounded-full"></span>
                                    ) : (
                                        <span className="top-0 left-12 absolute w-5 h-5 bg-red-500 border-2 border-[#1e1e2f] rounded-full"></span>
                                    )}
                                </div>
                                <div className="flex flex-col justify-center">
                                    <div className="font-bold text-gray-100 leading-none text-xl mb-1">{receiverdetails?.username}</div>
                                    <div className="leading-none text-indigo-300 text-sm">{receiverdetails?.fname}</div>
                                </div>
                            </div>
                            <div className="px-5 py-4 space-y-3">
                                <p className="text-base text-gray-200">
                                    <span className="text-indigo-400 font-semibold">Name:</span> {receiverdetails?.fname}
                                </p>
                                <p className="text-base text-gray-200">
                                    <span className="text-indigo-400 font-semibold">Description:</span> {receiverdetails?.description ? receiverdetails?.description : 'Empty'}
                                </p>
                                <p className="text-base text-gray-200">
                                    <span className="text-indigo-400 font-semibold">Gender:</span> {receiverdetails?.gender ? receiverdetails?.gender : 'Not prefer to say'}
                                </p>
                            </div>
                            <div data-popper-arrow></div>
                        </motion.div>
                    )}

                    <div className={`flex-1 w-full text-white flex flex-col-reverse gap-5 overflow-y-auto p-4`}>
                        <div ref={messagesEndRef} className="h-1"></div>

                        {loading ? (
                            <SkeletonTheme baseColor="#202020" highlightColor="#444">
                                {[...Array(5)].map((_, index) => (
                                    <div key={index} className={`flex ${index % 2 === 0 ? 'justify-end' : 'justify-start'} w-full`}>
                                        <motion.div
                                            className={`max-w-[75%] rounded-xl px-2 ${index % 2 === 0 ? 'bg-[#252540]/60 rounded-tr-none ml-auto' : 'bg-[#2d2d44]/60 rounded-tl-none'}`}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.3, delay: index * 0.1 }}
                                        >
                                            <div className="flex flex-col p-1.5">   
                                                <Skeleton width={200 + Math.random() * 100} height={16} />
                                                <div className="flex justify-end mt-1">
                                                    <Skeleton width={40} height={12} />
                                                </div>
                                            </div>
                                        </motion.div>
                                    </div>
                                ))}
                            </SkeletonTheme>
                        ) : (
                            messages.slice(0).reverse().map((message, index) => (
                                <Message key={index} message={message} />
                            ))
                        )}

                        {messages.length === 0 && !loading && (
                            <motion.div
                                className="flex justify-center items-center h-32 w-full"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                            >
                                <div className="bg-indigo-900/20 rounded-lg p-5 text-center">
                                    <div className="text-indigo-300 text-lg font-medium mb-2">No messages yet</div>
                                    <p className="text-gray-300">Start a conversation with {receiverdetails.username}</p>
                                </div>
                            </motion.div>
                        )}
                    </div>

                    <form onSubmit={handlesubmit} className="flex p-4 mb-2 justify-center">
                        <div className="flex w-[90%] items-center px-4 py-2 rounded-xl bg-[#252540] border border-indigo-500/30 shadow-lg">
                            <input
                                type="text"
                                autoComplete="off"
                                ref={textareaRef}
                                id="chat"
                                value={message}
                                name="message"
                                onChange={(e) => setmessage(e.target.value)}
                                className="block p-3 w-full text-gray-200 bg-transparent rounded-lg border-none focus:ring-0 placeholder-gray-400 text-base"
                                placeholder="Type your message..."
                                required
                            />
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                type="submit"
                                className="inline-flex justify-center p-3 text-indigo-300 hover:text-indigo-100 rounded-full cursor-pointer hover:bg-indigo-600/20 transition-colors"
                            >
                                <svg className="w-6 h-6 rotate-90 rtl:-rotate-90" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 18 20">
                                    <path d="m17.914 18.594-8-18a1 1 0 0 0-1.828 0l-8 18a1 1 0 0 0 1.157 1.376L8 18.281V9a1 1 0 0 1 2 0v9.281l6.758 1.689a1 1 0 0 0 1.156-1.376Z" />
                                </svg>
                                <span className="sr-only">Send message</span>
                            </motion.button>
                        </div>
                    </form>
                </motion.div>
            ) : (
                <motion.div
                    className={`w-[75%] flex flex-col justify-center items-center min-h-full bg-gradient-to-b from-[#16162a] to-[#1d1d35] bg-fixed max-md:w-full ${inmobile?.inmobile === true && hideelement?.hideelemenmt === false ? 'hidden size-0' : ''}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <motion.div
                        className="max-w-xl text-center px-6 py-8"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                    >
                        <motion.div
                            className="mx-auto mb-6 w-24 h-24 flex items-center justify-center"
                            initial={{ rotate: -10, scale: 0.8 }}
                            animate={{ rotate: 0, scale: 1 }}
                            transition={{ delay: 0.3, type: "spring", stiffness: 100 }}
                        >
                            <div className="relative">
                                <svg className="w-32 h-32 text-indigo-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path 
                                        d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" 
                                        stroke="currentColor" 
                                        strokeWidth="1.5" 
                                        strokeLinecap="round" 
                                        strokeLinejoin="round"
                                        fill="rgba(79, 70, 229, 0.1)" 
                                    />
                                     
                                    <rect 
                                        x="8" 
                                        y="11" 
                                        width="8" 
                                        height="6" 
                                        rx="1" 
                                        fill="currentColor" 
                                        fillOpacity="0.4" 
                                        stroke="currentColor" 
                                        strokeWidth="1.5" 
                                    />
                                    
                                
                                    <path 
                                        d="M9.5 11V8C9.5 6.89543 10.3954 6 11.5 6H12.5C13.6046 6 14.5 6.89543 14.5 8V11" 
                                        stroke="currentColor" 
                                        strokeWidth="1.5" 
                                        strokeLinecap="round" 
                                    />
                                    
                               
                                    <path d="M9 14.5H15" stroke="white" strokeOpacity="0.6" strokeWidth="0.75" strokeLinecap="round" />
                                    <path d="M9 16H15" stroke="white" strokeOpacity="0.6" strokeWidth="0.75" strokeLinecap="round" />
                                    
                                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.2" />
                                </svg>
                                
                             
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full animate-ping opacity-75 duration-1000"></div>
                                <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-indigo-500 rounded-full animate-pulse"></div>
                            </div>
                        </motion.div>

                        <motion.h2
                            className="mb-3 text-3xl font-bold text-gray-100"
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.4 }}
                        >
                            End-to-End Encrypted
                        </motion.h2>

                        <motion.p
                            className="mb-6 text-gray-300 text-lg"
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.5 }}
                        >
                            Your personal messages and calls are secured with end-to-end encryption. This means that no one, not even ChatThisWay, can read or listen to them.
                        </motion.p>

                        <motion.div
                            className="flex flex-col space-y-4 text-left bg-indigo-900/20 p-5 rounded-xl border border-indigo-500/20 shadow-lg"
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.6 }}
                        >
                            <div className="flex items-start">
                                <div className="flex-shrink-0 pt-1">
                                    <svg className="w-5 h-5 text-indigo-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                                    </svg>
                                </div>
                                <div className="ml-3 text-sm text-gray-200">
                                    <h3 className="font-medium text-indigo-300 mb-1">Private Messages</h3>
                                    <p>Your messages stay between you and the people you choose to talk to. Not even ChatThisWay can read them.</p>
                                </div>
                            </div>
                            <div className="flex items-start">
                                <div className="flex-shrink-0 pt-1">
                                    <svg className="w-5 h-5 text-indigo-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                                    </svg>
                                </div>
                                <div className="ml-3 text-sm text-gray-200">
                                    <h3 className="font-medium text-indigo-300 mb-1">Advanced Security</h3>
                                    <p>Your chats are secured with unique keys that are only stored on your device.</p>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            className="mt-8 text-gray-400 text-sm"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.8 }}
                        >
                            Select a chat from the sidebar to start a secure conversation.
                        </motion.div>
                    </motion.div>
                </motion.div>
            )}
        </>
    )
}

export default Chat