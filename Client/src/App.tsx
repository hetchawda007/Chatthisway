import './App.css'
import { useEffect, useState, useContext, useMemo, useRef } from 'react'
import { useParams, useNavigate } from 'react-router'
import { checkcookie, deletecookie } from './Api/useAuth'
import { motion } from 'framer-motion'
import Userscontext from './Context/Userscontext'
import Userdata from './Context/Userdata'
import axios from 'axios'
import { ToastContainer, toast } from 'react-toastify'
import Chat from './Components/Chat'
import { io } from "socket.io-client"
import nacl from "tweetnacl";
import naclUtil from "tweetnacl-util";
import Chatusers from './Context/Chatusers'
import inmobileContext from './Context/Inmobile'
import Hideelement from './Context/Hideelement'
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton'

interface encryptedMessageProps {
  encryptedmessage: string,
  iv: string,
}

interface user {
  username: string,
  fname: string
}

interface ChatUser {
  username: string;
}


interface messageprops {
  encryptedmessage: string,
  iv: string
}

interface chatusersprops {
  username: string,
  lastmessage: messageprops,
  date: string,
  cryptopublickey: string,
  signaturepublickey: string,
  messagecount: number
}


interface newMessageProps {
  message: encryptedMessageProps,
  sender: string,
  receiver: string,
  status: string,
  signaturepublickey: string,
  cryptopublickey: string
}

function App() {

  const Users = useContext(Userscontext)
  const [profiledata, setProfiledata] = useState({ fname: '', description: '', gender: '' })
  const keypair = useRef({ cryptokey: '', signinkey: '' })
  const signaturepublickey = useRef('')
  const inmobile = useContext(inmobileContext)
  const userdata = useContext(Userdata)
  const hideelement = useContext(Hideelement)
  const { username } = useParams()
  const { receiver } = useParams()
  const Navigate = useNavigate()
  const chatuser = useContext(Chatusers)
  const [users, setUsers] = useState<user[]>([])
  const [dropdown, setDropdown] = useState(false)
  const [searchtext, setSearchtext] = useState('')
  const [search, setSearch] = useState(false)
  const [profilevisibility, setProfilevisibility] = useState(false)
  const [initialLoadingComplete, setInitialLoadingComplete] = useState(false)

  const socket = useMemo(() => {
    try {
      return io(`${import.meta.env.VITE_SERVER_URL}`);
    } catch (e) {
      console.log('error connection');
      return null;
    }
  }, []);

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
    )
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

  const processMessage = async (message: chatusersprops) => {

    const sharedKey = deriveSharedSecret(keypair.current.cryptokey, message.cryptopublickey);
    const decryptedmessage = await decryptMessage(message.lastmessage.encryptedmessage, message.lastmessage.iv, sharedKey);
    const verifiedMessage = verifyMessage(decryptedmessage, message.signaturepublickey);
    if (!verifiedMessage) {
      if (!signaturepublickey.current) return console.log('No signature public key');
      const secondverifiedmessage = verifyMessage(decryptedmessage, signaturepublickey.current);
      if (!secondverifiedmessage) return console.log('Message not verified');
      chatuser?.setchatusers((prevMessages) => [
        ...prevMessages,
        {
          username: message.username,
          lastmessage: { encryptedmessage: secondverifiedmessage, iv: message.lastmessage.iv },
          date: message.date,
          signaturepublickey: message.signaturepublickey,
          cryptopublickey: message.cryptopublickey,
          messagecount: message.messagecount
        }
      ]);
      return
    }
    chatuser?.setchatusers((prevMessages) => [
      ...prevMessages,
      {
        username: message.username,
        lastmessage: { encryptedmessage: verifiedMessage, iv: message.lastmessage.iv },
        date: message.date,
        signaturepublickey: message.signaturepublickey,
        cryptopublickey: message.cryptopublickey,
        messagecount: message.messagecount
      }
    ]);
  }

  useEffect(() => {

    if (window.innerWidth < 768) {
      inmobile?.setInmobile(true);
    }

    const check = async () => {
      const res = await checkcookie()
      if (res.message !== 'Protected content') {

        try {
          const dbRequest = indexedDB.open("Credentials", 1);

          dbRequest.onupgradeneeded = function () {
            const db = dbRequest.result;
            db.createObjectStore("users", { keyPath: "id" });
          };

          dbRequest.onsuccess = function () {
            const db = dbRequest.result;
            const tx = db.transaction("users", "readwrite");
            const store = tx.objectStore("users");
            store.put({ id: 1, cryptokey: '', signinkey: '' });
          };
        }
        catch (error) {
          console.error("Error storing data in IndexedDB:", (error as Error).message);
        }
        Navigate('/login')
        return
      }
      else {
        try {
          const dbRequest = indexedDB.open("Credentials", 1);
          dbRequest.onsuccess = function () {
            const db = dbRequest.result;
            const tx = db.transaction("users", "readonly");
            const store = tx.objectStore("users");
            const getRequest = store.get(1);
            getRequest.onsuccess = async function () {
              keypair.current.cryptokey = await getRequest.result.cryptokey;
              keypair.current.signinkey = await getRequest.result.signinkey;
            };
          };

          dbRequest.onerror = function () {
            console.error("Error opening database:", dbRequest.error);
          };
        } catch (error) {
          console.error("Error accessing IndexedDB:", error);
        }
        const response = await axios.get(`${import.meta.env.VITE_SERVER_URL}/api/v1/getusers`, { withCredentials: true })
        const resp = response.data.filter((user: user) => user.username !== res.username)
        Users?.setUsers(resp)
        setUsers(response.data)
        let user = await axios.post(`${import.meta.env.VITE_SERVER_URL}/api/v1/userdata`, { username: res.username }, { withCredentials: true, headers: { 'Content-Type': 'application/json' } })
        setProfiledata({ fname: user.data.fname, description: user.data.description, gender: user.data.gender })
        await Navigate(`/dashboard/${res.username}`)
      }
      setTimeout(() => {
        setInitialLoadingComplete(true);
      }, 2000); 
    }
    check()

  }, [])

  useEffect(() => {

    const handleReceiveMessage = async (message: newMessageProps) => {
      const sharedKey = deriveSharedSecret(keypair.current.cryptokey, message.cryptopublickey);
      const decryptedmessage = await decryptMessage(message.message.encryptedmessage, message.message.iv, sharedKey);
      const verifiedMessage = verifyMessage(decryptedmessage, message.signaturepublickey);
      if (!verifiedMessage) return console.log('unverified');
      const senderExists = chatuser?.chatusers.some(chatUser => chatUser.username === message.sender);

      if (!senderExists || chatuser?.chatusers.length === 0) {
        chatuser?.setchatusers((prevMessages) => [
          ...prevMessages,
          {
            username: username === message.sender ? message.receiver : message.sender,
            lastmessage: { encryptedmessage: verifiedMessage, iv: message.message.iv },
            date: new Date().toLocaleDateString('en-US', {
              month: 'numeric',
              day: 'numeric',
              year: '2-digit'
            }),
            signaturepublickey: message.signaturepublickey,
            cryptopublickey: message.cryptopublickey,
            messagecount: 1
          }
        ]);
        return;
      }
      if (receiver) {
        if (message.sender === username || message.sender === receiver) return;
      }
      if (!receiver) {
        hideelement?.setHideelement(false)
      }
      chatuser?.setchatusers((prevMessages) =>
        prevMessages.map((chatUser) =>
          chatUser.username === message.sender
            ? {
              ...chatUser,
              lastmessage: { encryptedmessage: verifiedMessage, iv: message.message.iv },
              messagecount: chatUser.messagecount + 1,
            }
            : chatUser
        )
      );
    };

    socket?.on("receive_message", handleReceiveMessage);

    return () => {
      socket?.off("receive_message", handleReceiveMessage);
    };
  }, [username, socket, receiver, chatuser])

  useEffect(() => {
    const func = async () => {
      let user = await axios.post(`${import.meta.env.VITE_SERVER_URL}/api/v1/userdata`, { username: username }, { withCredentials: true, headers: { 'Content-Type': 'application/json' } })
      userdata?.setUser({
        ...userdata.user, email: user.data.email, username: user.data.username, fname: user.data.fname, description: user.data
          .description
      })
      signaturepublickey.current = user.data.signaturepublickey
      const users = await axios.post(`${import.meta.env.VITE_SERVER_URL}/api/v1/getmessages`, { username: username }, { withCredentials: true, headers: { 'Content-Type': 'application/json' } })

      const setdata = async () => {
        if (users.data.length > 0) {
          for (const user of users.data) {
            const room = [username, user.username].sort().join('_')
            socket?.emit("join_room", room, username)
            processMessage(user)
          }
        }
      }
      await setdata()
    }
    func()

  }, [username])

  useEffect(() => {
    if (!socket) return;

    const handleNewChat = (room: string, receiver: string) => {
      if (receiver === username) {
        socket.emit("join_room", room, username);
      }
    };

    socket.on("new_chat", handleNewChat);

    return () => {
      socket.off("new_chat", handleNewChat);
    };

  }, [socket, username]);

  const handlechange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>): void => {
    const { name, value } = e.target;
    if (name === 'fname' && value.length > 20) {
      setProfiledata({ ...profiledata, [name]: value.slice(0, 20) });
    } else {
      setProfiledata({ ...profiledata, [name]: value });
    }
  }

  const handlesearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const filteredUsers = Users?.users.filter(user => {
      const fullName = user.fname.toLowerCase();
      const userName = user.username.toLowerCase();
      const search = searchtext.toLowerCase();
      return fullName.includes(search) || userName.includes(search);
    });
    if (filteredUsers) {
      setUsers(filteredUsers);
    }
    setSearchtext('')
    setSearch(true)
  }

  const searchclick = () => {
    setSearch(true)
    setDropdown(false)
    if (Users?.users) {
      setUsers(Users.users)
    }
  }

  const profilesubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (profiledata.fname.length < 7 || profiledata.fname.length > 20) {
      toast.error('Full name should be between 7 and 20 characters long')
      return
    }
    if (profiledata.description.length < 10 || profiledata.description.length > 100) {
      toast.error('Description should be between 10 and 100 characters long')
      return
    }
    const res = await axios.post(`${import.meta.env.VITE_SERVER_URL}/api/v1/updateprofile`, { email: userdata?.user.email, fname: profiledata.fname, description: profiledata.description, gender: profiledata.gender }, { withCredentials: true, headers: { 'Content-Type': 'application/json' } })
    setProfilevisibility(false)
    userdata?.setUser({ ...userdata.user, fname: profiledata.fname, description: profiledata.description, gender: profiledata.gender })
    toast.success(res.data.message)
  }

  const handlechat = (user: ChatUser) => {
    setProfilevisibility(false)
    setSearch(false)
    Navigate(`/dashboard/${username}/${user.username}`)
    if (inmobile?.inmobile) {
      hideelement?.setHideelement(true)
    }
  }

  const handlelogout = async () => {
    await deletecookie()
    try {
      const dbRequest = indexedDB.open("Credentials", 1);

      dbRequest.onupgradeneeded = function () {
        const db = dbRequest.result;
        db.createObjectStore("users", { keyPath: "id" });
      };

      dbRequest.onsuccess = function () {
        const db = dbRequest.result;
        const tx = db.transaction("users", "readwrite");
        const store = tx.objectStore("users");
        store.put({ id: 1, cryptokey: '', signinkey: '' });
      };
    }
    catch (error) {
      console.error("Error storing data in IndexedDB:", (error as Error).message);
    }
    Navigate('/login')
    socket?.emit("user_status", username, false)
    await axios.post(`${import.meta.env.VITE_SERVER_URL}/api/v1/isonline`, { username: username, isonline: false }, { withCredentials: true });
  }

  return (
    <>
      <ToastContainer
        position="bottom-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
      <div className="container mx-auto flex h-screen">

        <div className={`w-[25%] overflow-y-auto min-h-full bg-gradient-to-t from-[#14141f] via-[#1e1e2d] to-[#252536] max-md:w-full ${hideelement?.hideelemenmt ? 'hidden size-0' : ''}`}>

          <div className='flex mb-6 items-center gap-4 justify-center pt-4 pl-4 pr-3'>
            <div>
              <motion.img
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onMouseOver={() => setDropdown(true)}
                onClick={() => setDropdown(!dropdown)}
                className='h-8 cursor-pointer hover:opacity-80 transition-all'
                src="/hamburger.png"
                alt="menu"
              />
              {dropdown && (
                <motion.div
                  key="userDropdown"
                  id="userDropdown"
                  onMouseLeave={() => setDropdown(false)}
                  className="z-10 absolute mt-3 divide-gray-600 rounded-xl shadow-lg w-48 bg-[#1a1a2e] border border-indigo-500/20 dark:divide-neutral-700"
                  initial={{ opacity: 0, scale: 0.8, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="px-5 cursor-default py-3 text-sm text-gray-100">
                    <div className="font-bold truncate max-w-[160px]">{userdata?.user.username}</div>
                    <div className="font-medium text-indigo-300 truncate">{userdata?.user.email}</div>
                  </div>
                  <ul className="py-2 text-sm text-gray-200" aria-labelledby="avatarButton">
                    <motion.li
                      whileHover={{ backgroundColor: "#2d2d44" }}
                      className='cursor-pointer'
                      onClick={() => { setProfilevisibility(false); setDropdown(false); setSearch(false) }}
                    >
                      <a className="block px-5 py-2.5 ">Dashboard</a>
                    </motion.li>
                    <motion.li
                      whileHover={{ backgroundColor: "#2d2d44" }}
                      className='cursor-pointer'
                      onClick={searchclick}
                    >
                      <a className="block px-5 py-2.5">Search</a>
                    </motion.li>
                    <motion.li
                      whileHover={{ backgroundColor: "#2d2d44" }}
                      className='cursor-pointer'
                      onClick={() => { setProfilevisibility(true); setDropdown(false); setSearch(false) }}
                    >
                      <a className="block px-5 py-2.5">Profile</a>
                    </motion.li>
                  </ul>
                  <motion.div
                    whileHover={{ backgroundColor: "#2d2d44" }}
                    onClick={handlelogout}
                    className="py-1 cursor-pointer rounded-b-xl"
                  >
                    <a className="block px-5 py-2.5 text-sm text-red-300 hover:text-red-400 transition-colors">Log Out</a>
                  </motion.div>
                </motion.div>
              )}
            </div>

            <form onSubmit={handlesearch} className="max-w-md flex items-center gap-2">
              <label htmlFor="default-search" className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white">Search</label>
              <div className="relative">
                <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                  <svg className="w-4 h-4 text-indigo-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
                  </svg>
                </div>
                <motion.input
                  whileFocus={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 400 }}
                  autoComplete='off'
                  onClick={searchclick}
                  onChange={(e) => {
                    setSearchtext(e.target.value); setProfilevisibility(false)
                  }}
                  value={searchtext}
                  name='search'
                  type="search"
                  id="default-search"
                  className="block w-full py-2 ps-10 text-gray-100 border border-indigo-600/40 rounded-full bg-[#252540] focus:ring-indigo-500 focus:border-indigo-500 hover:border-indigo-400 transition-all"
                  placeholder="Search friends..."
                  required
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                className="text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 focus:outline-none focus:ring-2 focus:ring-indigo-400 font-medium rounded-full text-sm px-4 py-2.5 transition-all shadow-md hover:shadow-indigo-500/20"
                disabled={searchtext.length < 2}
              >
                Search
              </motion.button>
            </form>
          </div>

          {!search && !profilevisibility && chatuser?.chatusers.length === 0 && !initialLoadingComplete && (
            <div className="px-4">
              <SkeletonTheme baseColor="#202020" highlightColor="#444">
                {[...Array(5)].map((_, index) => (
                  <motion.div
                    key={index}
                    className="mb-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <div className='flex items-center rounded-xl p-3 bg-[#252540]/30'>
                      <div className='flex items-center gap-3 w-full'>
                        <Skeleton circle width={56} height={56} />
                        <div className='flex-1'>
                          <Skeleton width="60%" height={20} />
                          <Skeleton width="90%" height={16} style={{ marginTop: 8 }} />
                        </div>
                        <div className='flex flex-col items-end'>
                          <Skeleton width={40} height={14} />
                          <Skeleton circle width={24} height={24} style={{ marginTop: 8 }} />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </SkeletonTheme>
            </div>
          )}

          {!search && !profilevisibility && chatuser?.chatusers.length === 0 && initialLoadingComplete && (
            <motion.div
              className="flex flex-col items-center justify-center p-6 mt-6 mx-4 bg-[#252540]/30 rounded-xl border border-[#404060]/30"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div
                className="w-20 h-20 mb-5 text-purple-400"
                initial={{ scale: 0.8, rotate: -5 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M4.913 2.658c2.075-.27 4.19-.408 6.337-.408 2.147 0 4.262.139 6.337.408 1.922.25 3.291 1.861 3.405 3.727a4.403 4.403 0 00-1.032-.211 50.89 50.89 0 00-8.42 0c-2.358.196-4.04 2.19-4.04 4.434v4.286a4.47 4.47 0 002.433 3.984L7.28 21.53A.75.75 0 016 21v-4.03a48.527 48.527 0 01-1.087-.128C2.905 16.58 1.5 14.833 1.5 12.862V6.638c0-1.97 1.405-3.718 3.413-3.979z" />
                  <path d="M15.75 7.5c-1.376 0-2.739.057-4.086.169C10.124 7.797 9 9.103 9 10.609v4.285c0 1.507 1.128 2.814 2.67 2.94 1.243.102 2.5.157 3.768.165l2.782 2.781a.75.75 0 001.28-.53v-2.39l.33-.026c1.542-.125 2.67-1.433 2.67-2.94v-4.286c0-1.505-1.125-2.811-2.664-2.94A49.392 49.392 0 0015.75 7.5z" />
                </svg>
              </motion.div>
              <h3 className="mb-2 text-xl font-semibold text-gray-100">No conversations yet</h3>
              <p className="text-center text-gray-400 max-w-xs mb-4">
                Start a new conversation by searching for users and connecting with friends.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={searchclick}
                className="mt-2 px-5 py-2.5 bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 text-white rounded-lg font-medium text-sm shadow-lg"
              >
                Find Friends
              </motion.button>
            </motion.div>
          )}

          {search && (
            <motion.div
              className="max-w-md px-4 pt-4 m-4 bg-[#1e1e2f] border border-indigo-500/20 rounded-xl shadow-lg shadow-indigo-900/10 mx-4 max-md:w-[90%]"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ duration: 0.4, type: "spring", stiffness: 100 }}
            >
              <div className="flex items-center justify-between px-2 mb-5">
                <div className='flex justify-center items-center'>
                  <h5 className="text-xl self-center font-bold leading-none text-indigo-100">Find Friends</h5>
                </div>
              </div>
              <div className="flow-root">
                {users.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-40 text-center">
                    <motion.div
                      initial={{ scale: 0.8 }}
                      animate={{ scale: [0.8, 1.1, 1] }}
                      transition={{ duration: 0.5 }}
                    >
                      <svg className="w-16 h-16 text-indigo-400 mb-3 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                      </svg>
                    </motion.div>
                    <h5 className="text-xl font-bold text-gray-300 mb-1">No users found</h5>
                    <p className="text-sm text-gray-400">Try different search terms</p>
                  </div>
                ) : (
                  <ul role="list" className="divide-y divide-indigo-800/20 flex flex-col">
                    {users.map((user, index) => (
                      <motion.li
                        key={user.username}
                        className="py-3.5 hover:bg-indigo-900/10 rounded-lg px-2 transition-colors"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <div className="flex items-center">
                          <div className="relative cursor-pointer">
                            <div className="relative inline-flex items-center justify-center w-12 h-12 overflow-hidden bg-gradient-to-br from-indigo-600 to-purple-700 rounded-full shadow-inner shadow-purple-900/30">
                              <span className="text-lg font-bold text-gray-100">
                                {user.fname.split(' ').length > 1
                                  ? `${user.fname.split(' ')[0][0].toUpperCase()}${user.fname.split(' ')[1][0].toUpperCase()}`
                                  : user.fname[0].toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="flex-1 leading-none min-w-0 ms-4">
                            <p className="text-gray-100 truncate font-medium">
                              {user.fname}
                            </p>
                            <p className="text-sm text-indigo-300 truncate mt-0.5">
                              @{user.username}
                            </p>
                          </div>
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handlechat(user)}
                            className="inline-flex items-center"
                          >
                            <button type="button" className="text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 font-medium rounded-lg text-sm px-5 py-2.5 shadow-md shadow-purple-900/20">Chat</button>
                          </motion.div>
                        </div>
                      </motion.li>
                    ))}
                  </ul>
                )}
              </div>
            </motion.div>
          )}

          {(!search && !profilevisibility) && chatuser?.chatusers.map((name, index) => (
            <motion.div
              key={name.username}
              onClick={() => handlechat(name)}
              className={`flex ${name.username === receiver ? 'border-indigo-500 bg-[#252543]' : ''} items-center hover:bg-[#252543] rounded-xl mx-3 cursor-pointer justify-between p-3.5 mb-2 border-l-4 border-transparent hover:border-indigo-500 transition-all`}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: index * 0.05, ease: "easeInOut" }}
            >
              <div className='flex items-center gap-4'>
                <div className="relative cursor-pointer">
                  <div className="relative inline-flex items-center justify-center w-14 h-14 overflow-hidden bg-gradient-to-br from-indigo-600 to-purple-700 rounded-full shadow-md shadow-purple-900/30">
                    <span className="text-xl font-bold text-gray-100">
                      {name.username.split(' ').length > 1
                        ? `${name.username.split(' ')[0][0].toUpperCase()}${name.username.split(' ')[1][0].toUpperCase()}`
                        : name.username[0].toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className='flex flex-col max-w-52 justify-center'>
                  <div className='text-gray-100 leading-none font-bold text-lg'>{name.username}</div>
                  <div className='w-full text-indigo-300 truncate text-sm mt-1'>{name.lastmessage.encryptedmessage}</div>
                </div>
              </div>
              <div className='flex flex-col items-end justify-center'>
                <div className='text-gray-300 text-sm font-medium py-1 rounded-full'>{name.date}</div>
                {name.messagecount !== 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 10 }}
                    className="relative inline-flex items-center justify-center size-6 mt-1 overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full shadow-md shadow-purple-900/30"
                  >
                    <span className="text-gray-100 text-xs font-bold">{name.messagecount}</span>
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))}

          {(profilevisibility && !search) && (
            <motion.div
              className='flex flex-col m-5 items-center justify-center bg-[#1e1e2f] p-6 rounded-xl border border-indigo-500/20 shadow-lg shadow-indigo-900/10'
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, type: "spring", stiffness: 100 }}
            >
              <motion.div
                className="relative cursor-pointer"
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="relative inline-flex items-center justify-center w-28 h-28 overflow-hidden bg-gradient-to-br from-indigo-600 to-purple-700 rounded-full border-4 border-indigo-900/40 shadow-xl shadow-purple-900/30">
                  <span className="text-5xl font-bold text-gray-100">
                    {userdata?.user && userdata.user.fname.split(' ').length > 1
                      ? `${userdata.user.fname.split(' ')[0][0].toUpperCase()}${userdata.user.fname.split(' ')[1][0].toUpperCase()}`
                      : userdata?.user.fname[0].toUpperCase()}
                  </span>
                </div>
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 500 }}
                  className={`top-0 left-20 absolute w-7 h-7 bg-green-500 border-2 border-indigo-900 dark:border-gray-800 rounded-full`}
                ></motion.span>
              </motion.div>

                <motion.div 
                className='text-center w-full mt-4 px-2'
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                >
                <h2 className='text-2xl sm:text-3xl text-indigo-100 font-bold overflow-hidden text-ellipsis'>
                  {userdata?.user.username}
                </h2>
                </motion.div>

                <motion.div
                className='text-center w-full mb-6 px-3'
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                >
                <p className='text-base sm:text-lg text-indigo-300 font-medium overflow-hidden text-ellipsis'>
                  {userdata?.user.email}
                </p>
                </motion.div>

              <motion.form
                onSubmit={profilesubmit}
                className='w-full px-2 mt-2 flex flex-col gap-4'
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <div>
                  <label htmlFor="helper-text" className="block text-sm font-medium text-indigo-200 mb-1.5">Full Name</label>
                  <motion.input
                    whileFocus={{ scale: 1.01 }}
                    transition={{ type: "spring", stiffness: 400 }}
                    onChange={handlechange}
                    name='fname'
                    type="text"
                    id="helper-text"
                    value={profiledata.fname}
                    className="bg-[#252540] border border-indigo-500/30 text-gray-100 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-3 hover:border-indigo-400 transition-all"
                    placeholder={`${profiledata.fname}`}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-indigo-200 mb-1.5">Description</label>
                  <motion.textarea
                    whileFocus={{ scale: 1.01 }}
                    transition={{ type: "spring", stiffness: 400 }}
                    id="message"
                    rows={4}
                    name='description'
                    value={profiledata.description}
                    onChange={handlechange}
                    className="block p-3 w-full text-sm text-gray-100 bg-[#252540] rounded-lg border border-indigo-500/30 focus:ring-indigo-500 focus:border-indigo-500 hover:border-indigo-400 transition-all"
                    placeholder={profiledata.description.length !== 0 ? `${profiledata.description} ` : 'Write your description here...'}
                    required
                  ></motion.textarea>
                </div>

                <div>
                  <label htmlFor="countries" className="block text-sm font-medium text-indigo-200 mb-1.5">Gender</label>
                  <motion.select
                    whileFocus={{ scale: 1.01 }}
                    transition={{ type: "spring", stiffness: 400 }}
                    id="countries"
                    className="bg-[#252540] border border-indigo-500/30 text-gray-100 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-3 hover:border-indigo-400 transition-all"
                    value={profiledata.gender}
                    onChange={(e) => setProfiledata({ ...profiledata, gender: e.target.value })}
                  >
                    <option value={profiledata.gender}>
                      {profiledata.gender || "Prefer not to say"}
                    </option>
                    {profiledata.gender !== "Male" && <option value="Male">Male</option>}
                    {profiledata.gender !== "Female" && <option value="Female">Female</option>}
                    {profiledata.gender !== "Others" && <option value="Others">Others</option>}
                    {profiledata.gender && <option value="">Prefer not to say</option>}
                  </motion.select>
                </div>

                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  type='submit'
                  className="relative w-fit self-center mt-4 inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium rounded-lg group bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-lg shadow-purple-900/20"
                >
                  <span className="relative px-6 py-2.5 transition-all ease-in duration-75 rounded-md">
                    Save Profile
                  </span>
                </motion.button>
              </motion.form>
            </motion.div>
          )}

        </div>
        <Chat />
      </div>
    </>
  )
}

export default App