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

interface encryptedMessageProps {
  encryptedmessage: string,
  iv: string,
}

function App() {

  const Users = useContext(Userscontext)
  const [profiledata, setProfiledata] = useState({ fname: '', description: '', gender: '' })
  const keypair = useRef({ cryptokey: '', signinkey: '' })
  const signaturepublickey = useRef('')
  const userdata = useContext(Userdata)
  const { username } = useParams()
  const { receiver } = useParams()
  const Navigate = useNavigate()
  const chatuser = useContext(Chatusers)
  const [users, setUsers] = useState<user[]>([])
  const [dropdown, setDropdown] = useState(false)
  const [searchtext, setSearchtext] = useState('')
  const [search, setSearch] = useState(false)
  const [profilevisibility, setProfilevisibility] = useState(false)

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

  const processMessage = async (message: chatusersprops) => {

    const sharedKey = deriveSharedSecret(keypair.current.cryptokey, message.cryptopublickey);
    if (!sharedKey) {
      console.error('Failed to derive shared key');
      return;
    }
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
    const check = async () => {
      const res = await checkcookie()
      if (res.message !== 'Protected content') {
        console.log('Cookie not valid', res);
        // try {
        //   const dbRequest = indexedDB.open("Credentials", 1);

        //   dbRequest.onupgradeneeded = function () {
        //     const db = dbRequest.result;
        //     db.createObjectStore("users", { keyPath: "id" });
        //   };

        //   dbRequest.onsuccess = function () {
        //     const db = dbRequest.result;
        //     const tx = db.transaction("users", "readwrite");
        //     const store = tx.objectStore("users");
        //     store.put({ id: 1, cryptokey: '', signinkey: '' });
        //   };
        // }
        // catch (error) {
        //   console.error("Error storing data in IndexedDB:", (error as Error).message);
        // }
        // Navigate('/login')
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
        const response = await axios.get(`${import.meta.env.VITE_SERVER_URL}/api/getusers`)
        const resp = response.data.filter((user: user) => user.username !== res.username)
        Users?.setUsers(resp)
        setUsers(response.data)
        let user = await axios.post(`${import.meta.env.VITE_SERVER_URL}/api/userdata`, { username: res.username }, { headers: { 'Content-Type': 'application/json' } })
        setProfiledata({ fname: user.data.fname, description: user.data.description, gender: user.data.gender })
        await Navigate(`/dashboard/${res.username}`)
      }

    }
    check()

  }, [])

  useEffect(() => {
    if (!receiver) return
    socket?.on("receive_message", async (message: newMessageProps) => {
      if (message.sender !== receiver) return
      const sharedKey = deriveSharedSecret(keypair.current.cryptokey, message.cryptopublickey);
      const decryptedmessage = await decryptMessage(message.message.encryptedmessage, message.message.iv, sharedKey);
      const verifiedMessage = verifyMessage(decryptedmessage, message.signaturepublickey);
      if (!verifiedMessage) return console.log('unverified');
      if (message.sender === receiver) {
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
      }
    });
  }, [receiver])

  useEffect(() => {
    const func = async () => {
      let user = await axios.post(`${import.meta.env.VITE_SERVER_URL}/api/userdata`, { username: username }, { headers: { 'Content-Type': 'application/json' } })
      userdata?.setUser({
        ...userdata.user, email: user.data.email, username: user.data.username, fname: user.data.fname, description: user.data
          .description
      })
      signaturepublickey.current = user.data.signaturepublickey
      const users = await axios.post(`${import.meta.env.VITE_SERVER_URL}/api/getmessages`, { username: username })
      const setdata = async () => {
        for (const user of users.data) {
          const room = [username, user.username].sort().join('_')
          socket?.emit("join_room", room, username)
          processMessage(user)
        }
      }
      await setdata()
    }
    func()
  }, [username])

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
    const res = await axios.post(`${import.meta.env.VITE_SERVER_URL}/api/updateprofile`, { email: userdata?.user.email, fname: profiledata.fname, description: profiledata.description, gender: profiledata.gender }, { headers: { 'Content-Type': 'application/json' } })
    setProfilevisibility(false)
    userdata?.setUser({ ...userdata.user, fname: profiledata.fname, description: profiledata.description, gender: profiledata.gender })
    toast.success(res.data.message)
  }

  const handlechat = (user: ChatUser) => {
    setProfilevisibility(false)
    setSearch(false)
    Navigate(`/dashboard/${username}/${user.username}`)
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

        <div className='w-[25%] overflow-y-auto min-h-full bg-gradient-to-t from-[#1a1a1a] via-[#272727] to-[#313131]'>

          <div className='flex mb-4 items-center gap-4 justify-center pt-3 pl-3'>
            <div>
              <img onMouseOver={() => setDropdown(true)} onClick={() => setDropdown(!dropdown)} className='h-7 cursor-pointer' src="/hamburger.png" alt="menu" />
              {dropdown && <motion.div key="userDropdown" id="userDropdown" onMouseLeave={() => setDropdown(false)} className="z-10 absolute mt-3 divide-y divide-gray-100 rounded-xl shadow-sm w-44 bg-[#00000087] blr dark:divide-neutral-700"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="px-4 cursor-default py-3 text-sm text-gray-900 dark:text-white">
                  <div>{userdata?.user.username}</div>
                  <div className="font-medium truncate">{userdata?.user.email}</div>
                </div>
                <ul className="py-2 text-sm text-gray-700 dark:text-gray-200" aria-labelledby="avatarButton">
                  <li className='cursor-pointer' onClick={() => { setProfilevisibility(false); setDropdown(false); setSearch(false) }} >
                    <a className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-[#000000] dark:hover:text-white">Dashboard</a>
                  </li>
                  <li className='cursor-pointer' onClick={searchclick}>
                    <a className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-[#000000] dark:hover:text-white">Search</a>
                  </li>
                  <li className='cursor-pointer' onClick={() => { setProfilevisibility(true); setDropdown(false); setSearch(false) }} >
                    <a className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-[#000000] dark:hover:text-white">Profile</a>
                  </li>
                </ul>
                <div onClick={handlelogout} className="py-1 cursor-pointer dark:hover:bg-[#000000] rounded-b-xl">
                  <a className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 dark:hover:text-white">Log Out</a>
                </div>
              </motion.div>}
            </div>

            <form onSubmit={handlesearch} className="max-w-md flex items-center gap-2">
              <label htmlFor="default-search" className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white">Search</label>
              <div className="relative">
                <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
                  </svg>
                </div>
                <input autoComplete='off' onClick={searchclick} onChange={(e) => {
                  setSearchtext(e.target.value); setProfilevisibility(false)
                }} value={searchtext} name='search' type="search" id="default-search" className="block w-full py-2 ps-10 text-gray-900 border border-gray-300 rounded-full bg-gray-50 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-100 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Search" required />
              </div>
              <button type="submit" className="text-white bg-blue-600 border border-blue-600 focus:outline-none hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 font-medium rounded-full text-sm px-4 py-2 me-2 dark:bg-blue-500 dark:border-blue-500 dark:hover:bg-blue-600 dark:focus:ring-blue-800" disabled={searchtext.length < 2}>Search</button>
            </form>
          </div>


          {search && <motion.div className="max-w-md px-3 pt-3 m-4 bg-white border border-gray-200 rounded-xl shadow-sm sm:px-6 sm:pt-6 dark:bg-gray-800 dark:border-gray-700"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          >
            <div className="flex items-center justify-between px-2 mb-4">
              <div className='flex justify-center items-center'>
                <h5 className="text-xl self-center font-bold leading-none text-gray-900 dark:text-neutral-300">Search your friends</h5>
              </div>
            </div>
            <div className="flow-root">
              <ul role="list" className="divide-y divide-gray-200 dark:divide-gray-700">
                {users.map((user) => {
                  return (
                    <li key={user.username} className="py-3 sm:py-4">
                      <div className="flex items-center">
                        <div className="relative cursor-pointer">
                          <div className="relative inline-flex items-center justify-center w-12 h-12 overflow-hidden bg-gradient-to-t from-[#7345be] via-[#7d53bf] to-[#9667e3] rounded-full">
                            <span className="text-xl font-semibold text-gray-600 dark:text-gray-300">
                              {user.fname.split(' ').length > 1
                                ? `${user.fname.split(' ')[0][0].toUpperCase()}${user.fname.split(' ')[1][0].toUpperCase()}`
                                : user.fname[0].toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="flex-1 leading-none min-w-0 ms-4">
                          <p className="text-gray-900 truncate dark:text-white">
                            {user.fname}
                          </p>
                          <p className="text-sm text-gray-500 truncate dark:text-gray-400">
                            {user.username}
                          </p>
                        </div>
                        <div onClick={() => handlechat(user)} className="inline-flex items-center text-base font-semibold text-gray-900 dark:text-white">
                          <button type="button" className="text-white bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-purple-300 dark:focus:ring-purple-800 font-medium rounded-lg text-sm px-4 py-2 text-center me-2 mb-2">Chat</button>
                        </div>
                      </div>
                    </li>
                  )
                })}
                {users.length === 0 && <div className="flex items-center justify-center h-32">
                  <h5 className="text-xl self-center font-bold leading-none text-gray-900 dark:text-neutral-300">User Doesn't exists</h5>
                </div>}
              </ul>
            </div>
          </motion.div>}

          {(!search && !profilevisibility) && chatuser?.chatusers.map((name) => {
            return (
              <motion.div key={name.username} onClick={() => handlechat(name)} className='flex items-center hover:bg-[#383838] rounded-xl mx-3 cursor-pointer justify-between p-3'
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
              >
                <div className='flex items-center gap-3'>
                  <div className="relative cursor-pointer">
                    <div className="relative inline-flex items-center justify-center w-14 h-14 overflow-hidden bg-gradient-to-t from-[#7345be] via-[#7d53bf] to-[#9667e3] rounded-full">
                      <span className="text-2xl font-semibold text-gray-600 dark:text-gray-300">
                        {name.username.split(' ').length > 1
                          ? `${name.username.split(' ')[0][0].toUpperCase()}${name.username.split(' ')[1][0].toUpperCase()}`
                          : name.username[0].toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className='flex flex-col max-w-52 justify-center'>
                    <div className='text-white leading-none font-semibold text-lg'>{name.username}</div>
                    <div className='w-full text-neutral-400 truncate font-thin text-sm'>{name.lastmessage.encryptedmessage}</div>
                  </div>
                </div>
                <div className='flex flex-col items-end justify-around'>
                  <div className='text-neutral-300 text-sm font-thin leading-none'>{name.date}</div>
                  {name.messagecount !== 0 && <div className="relative inline-flex p-[11px] mt-2 items-center justify-center w-4 h-4 overflow-hidden bg-gradient-to-t from-[#7345be] via-[#7d53bf] to-[#9667e3] rounded-full">
                    <span className="text-gray-600 dark:text-gray-300 text-sm font-semibold">{name.messagecount}</span>
                  </div>}
                </div>
              </motion.div>
            )
          })}

          {(profilevisibility && !search) && <motion.div className='flex flex-col m-5 items-center justify-center'
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          >

            <div className="relative cursor-pointer">
              <div className="relative inline-flex items-center justify-center w-28 h-28 overflow-hidden bg-gradient-to-t from-[#7345be] via-[#7d53bf] to-[#9667e3] rounded-full">
                <span className="text-5xl font-bold text-gray-600 dark:text-gray-300">
                  {userdata?.user && userdata.user.fname.split(' ').length > 1
                    ? `${userdata.user.fname.split(' ')[0][0].toUpperCase()}${userdata.user.fname.split(' ')[1][0].toUpperCase()}`
                    : userdata?.user.fname[0].toUpperCase()}
                </span>
              </div>
              <span className={`top-0 left-20 absolute w-7 h-7 bg-green-400 border-2 border-white dark:border-gray-800 rounded-full`} ></span>
            </div>
            <div className='text-3xl text-neutral-300 font-bold mt-2'>{userdata?.user.username}</div>
            <div className='text-xl text-neutral-400 font-semibold'>{userdata?.user.email}</div>

            <form onSubmit={profilesubmit} className='w-full px-5 mt-10 flex flex-col gap-3'>

              <label htmlFor="helper-text" className="block text-sm font-medium text-gray-900 dark:text-white">Full Name</label>
              <input onChange={handlechange} name='fname' type="text" id="helper-text" value={profiledata.fname} aria-describedby="helper-text-explanation" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder={`${profiledata.fname}`} required />

              <label htmlFor="helper-text" className="block text-sm font-medium text-gray-900 dark:text-white">Description</label>
              <textarea id="message" rows={4} name='description' value={profiledata.description} onChange={handlechange} className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder={profiledata.description.length !== 0 ? `${profiledata.description} ` : 'Write your description here...'} required></textarea>

              <label htmlFor="countries" className="block text-sm font-medium text-gray-900 dark:text-white">Gender</label>
              <select
                id="countries"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
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
              </select>

              <button type='submit' className="relative w-fit self-center mt-5 inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-purple-600 to-blue-500 group-hover:from-purple-600 group-hover:to-blue-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800">
                <span className="relative px-5 py-2 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-transparent group-hover:dark:bg-transparent">
                  Save
                </span>
              </button>
            </form>

          </motion.div>
          }

        </div >
        <Chat />
      </div >
    </>
  )
}

export default App