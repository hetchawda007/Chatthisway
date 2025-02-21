import './App.css'
import { useEffect, useState, useContext } from 'react'
import { useParams } from 'react-router'
import { useNavigate } from 'react-router'
import { checkcookie, deletecookie } from './Api/useAuth'
import { motion } from 'framer-motion'
import Usercontext from './Context/Usercontext'
import axios from 'axios'

function App() {

  interface user {
    username: string,
    fname: string
  }

  interface ChatUser {
    username: string;
  }

  const Users = useContext(Usercontext)
  const { username } = useParams()
  const Navigate = useNavigate()
  const samplenames = [
    { name: 'Alice Johnson', username: 'alicej', lastmessage: 'Hey, how are you doing?', date: '01/10/2023', isonline: true, messagecount: 2 },
    { name: 'Bob Smith', username: 'bobsmith', lastmessage: 'Can we reschedule our meeting?', date: '30/09/2023', isonline: false, messagecount: 0 },
    { name: 'Charlie Brown', username: 'charlieb', lastmessage: 'I have sent the documents.', date: '29/09/2023', isonline: true, messagecount: 1 },
    { name: 'Diana Prince', username: 'dianap', lastmessage: 'Let’s catch up tomorrow.', date: '28/09/2023', isonline: false, messagecount: 5 },
    { name: 'Eve Adams', username: 'evea', lastmessage: 'Thank you for your help!', date: '27/09/2023', isonline: true, messagecount: 0 },
    { name: 'Frank Castle', username: 'frankc', lastmessage: 'I will get back to you soon.', date: '26/09/2023', isonline: false, messagecount: 3 },
    { name: 'Grace Hopper', username: 'graceh', lastmessage: 'Can you review this code?', date: '25/09/2023', isonline: true, messagecount: 0 },
    { name: 'Hank Pym', username: 'hankp', lastmessage: 'Meeting is confirmed for 3 PM.', date: '24/09/2023', isonline: false, messagecount: 1 },
    { name: 'Ivy League', username: 'ivyl', lastmessage: 'Looking forward to our collaboration.', date: '23/09/2023', isonline: true, messagecount: 0 }
  ]

  const [users, setUsers] = useState<user[]>([])
  const [dropdown, setDropdown] = useState(false)
  const [searchtext, setSearchtext] = useState('')
  const [search, setSearch] = useState(false)
  const [profilevisibility, setProfilevisibility] = useState(false)

  useEffect(() => {
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
        const response = await axios.get(`http://localhost:8080/api/getusers`)
        const resp = response.data.filter((user: user) => user.username !== res.username)
        Users?.setUsers(resp)
        setUsers(response.data)
        Navigate(`/dashboard/${res.username}`)
      }
    }
    check()
  }, [])

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

  const handlechat = (user: ChatUser) => {
    setSearch(false)
    Navigate(`/dashboard/${username}#${user.username}`)
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
      <div className="container mx-auto flex h-screen">

        <div className='w-[27%] overflow-y-auto min-h-full bg-gradient-to-t from-[#1a1a1a] via-[#272727] to-[#313131]'>

          <div className='flex mb-4 items-center gap-4 justify-center pt-3 pl-3'>
            <div>
              <img onMouseOver={() => setDropdown(true)} onClick={() => setDropdown(!dropdown)} className='h-7 cursor-pointer' src="/hamburger.png" alt="menu" />
              {dropdown && <motion.div key="userDropdown" id="userDropdown" onMouseLeave={() => setDropdown(false)} className="z-10 absolute mt-3 divide-y divide-gray-100 rounded-xl shadow-sm w-44 bg-[#00000087] blr dark:divide-neutral-700"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="px-4 cursor-default py-3 text-sm text-gray-900 dark:text-white">
                  <div>Bonnie Green</div>
                  <div className="font-medium truncate">name@flowbite.com</div>
                </div>
                <ul className="py-2 text-sm text-gray-700 dark:text-gray-200" aria-labelledby="avatarButton">
                  <li>
                    <a href="#profile" onClick={() => { setProfilevisibility(true); setDropdown(false) }} className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-[#000000] dark:hover:text-white">Profile</a>
                  </li>
                  <li>
                    <a href="#" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-[#000000] dark:hover:text-white">Settings</a>
                  </li>
                  <li>
                    <a href="#" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-[#000000] dark:hover:text-white">Earnings</a>
                  </li>
                </ul>
                <div onClick={handlelogout} className="py-1 dark:hover:bg-[#000000] rounded-b-xl">
                  <a href="#" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 dark:hover:text-white">Log Out</a>
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
                <input onChange={(e) => setSearchtext(e.target.value)} onClick={searchclick} value={searchtext} name='search' type="search" id="default-search" className="block w-full py-2 ps-10 text-gray-900 border border-gray-300 rounded-full bg-gray-50 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-100 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Search" required />
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
              <div className='flex gap-6 items-center'>
                <img className='h-5 cursor-pointer' onClick={() => setSearch(false)} src="/arrow.png" alt="arrow" />
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
                          <div className="relative inline-flex items-center justify-center w-14 h-14 overflow-hidden bg-gradient-to-t from-[#7345be] via-[#7d53bf] to-[#9667e3] rounded-full">
                            <span className="text-2xl font-semibold text-gray-600 dark:text-gray-300">
                              {user.fname.split(' ').length > 1
                                ? `${user.fname.split(' ')[0][0].toUpperCase()}${user.fname.split(' ')[1][0].toUpperCase()}`
                                : user.fname[0].toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="flex-1 leading-none min-w-0 ms-4">
                          <p className="text-lg font-medium text-gray-900 truncate dark:text-white">
                            {user.fname}
                          </p>
                          <p className="text-sm text-gray-500 truncate dark:text-gray-400">
                            {user.username}
                          </p>
                        </div>
                        <div onClick={() => handlechat(user)} className="inline-flex items-center text-base font-semibold text-gray-900 dark:text-white">
                          <button type="button" className="text-white bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-purple-300 dark:focus:ring-purple-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2">Chat</button>
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



          {(!search && !profilevisibility) && samplenames.map((name) => {
            return (
              <motion.div key={name.name} onClick={() => handlechat(name)} className='flex items-center hover:bg-[#383838] rounded-xl mx-3 cursor-pointer justify-between p-3'
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
              >
                <div className='flex items-center gap-3'>
                  <div className="relative cursor-pointer">
                    <div className="relative inline-flex items-center justify-center w-14 h-14 overflow-hidden bg-gradient-to-t from-[#7345be] via-[#7d53bf] to-[#9667e3] rounded-full">
                      <span className="text-2xl font-semibold text-gray-600 dark:text-gray-300">
                        {name.name.split(' ').length > 1
                          ? `${name.name.split(' ')[0][0].toUpperCase()}${name.name.split(' ')[1][0].toUpperCase()}`
                          : name.name[0].toUpperCase()}
                      </span>
                    </div>
                    <span className={`${name.isonline ? 'block' : 'hidden'} top-0 left-10 absolute w-[18px] h-[18px] bg-green-400 border-2 border-white dark:border-gray-800 rounded-full`} ></span>
                  </div>
                  <div className='flex flex-col max-w-56 justify-center'>
                    <div className='text-white leading-none font-semibold text-lg'>{name.name}</div>
                    <div className='w-full text-neutral-400 truncate font-thin text-sm'>{name.lastmessage}</div>
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

          {(profilevisibility && !search) && <div className='flex flex-col m-5 items-center justify-center'>

            <div className="relative cursor-pointer">
              <div className="relative inline-flex items-center justify-center w-28 h-28 overflow-hidden bg-gradient-to-t from-[#7345be] via-[#7d53bf] to-[#9667e3] rounded-full">
                <span className="text-5xl font-bold text-gray-600 dark:text-gray-300">
                  HC
                  {/* {name.name.split(' ').length > 1
                    ? `${name.name.split(' ')[0][0].toUpperCase()}${name.name.split(' ')[1][0].toUpperCase()}`
                    : name.name[0].toUpperCase()} */}
                </span>
              </div>
              <span className={`top-0 left-20 absolute w-7 h-7 bg-green-400 border-2 border-white dark:border-gray-800 rounded-full`} ></span>
            </div>
            <div className='text-3xl text-neutral-300 font-bold mt-2'>Het_duv645</div>
            <div className='text-xl text-neutral-400 font-semibold'>Het@mail.com</div>

            <form className='w-full px-5 mt-10 flex flex-col gap-3'>

              <label htmlFor="helper-text" className="block text-sm font-medium text-gray-900 dark:text-white">Full Name</label>
              <input type="email" id="helper-text" aria-describedby="helper-text-explanation" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder={`Het Chawda`} />

              <label htmlFor="helper-text" className="block text-sm font-medium text-gray-900 dark:text-white">Description</label>
              <textarea id="message" rows={4} className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder={`Write your description here...`}></textarea>

              <h3 className="font-semibold text-gray-900 dark:text-white">Gender</h3>
              <ul className="w-48 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                <li className="w-full border-b border-gray-200 rounded-t-lg dark:border-gray-600">
                  <div className="flex items-center ps-3">
                    <input id="male" type="radio" value="" name="male" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500" />
                    <label htmlFor="male" className="w-full py-3 ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">Male</label>
                  </div>
                </li>
                <li className="w-full border-b border-gray-200 rounded-t-lg dark:border-gray-600">
                  <div className="flex items-center ps-3">
                    <input id="female" type="radio" value="" name="female" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500" />
                    <label htmlFor="female" className="w-full py-3 ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">Female</label>
                  </div>
                </li>
                <li className="w-full border-b border-gray-200 rounded-t-lg dark:border-gray-600">
                  <div className="flex items-center ps-3">
                    <input id="others" type="radio" value="" name="others" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500" />
                    <label htmlFor="others" className="w-full py-3 ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">Others</label>
                  </div>
                </li>

              </ul>
              <button className="relative w-fit self-center mt-5 inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-purple-600 to-blue-500 group-hover:from-purple-600 group-hover:to-blue-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800">
                <span className="relative px-5 py-2 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-transparent group-hover:dark:bg-transparent">
                  Save
                </span>
              </button>
            </form>

          </div>
          }

        </div>

        <div className='w-[73%] min-h-full bg-[url("/default.jpg")] bg-cover'>



          {/* // message ui */}

          {/* <div className="flex items-start gap-2.5">
            <img className="w-8 h-8 rounded-full" src="/logo.webp" alt="Jese image" />
              <div className="flex flex-col gap-1 w-full max-w-[320px]">
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <span className ="text-sm font-semibold text-gray-900 dark:text-white">Bonnie Green</span>
                  <span className ="text-sm font-normal text-gray-500 dark:text-gray-400">11:46</span>
                </div>
                <div className="flex flex-col leading-1.5 p-4 border-gray-200 bg-gray-100 rounded-e-xl rounded-es-xl dark:bg-gray-700">
                  <p className="text-sm font-normal text-gray-900 dark:text-white"> That's awesome. I think our users will really appreciate the improvements.</p>
                </div>
                <span className ="text-sm font-normal text-gray-500 dark:text-gray-400">Delivered</span>
              </div>
              <button id="dropdownMenuIconButton" data-dropdown-toggle="dropdownDots" data-dropdown-placement="bottom-start" className="inline-flex self-center items-center p-2 text-sm font-medium text-center text-gray-900 bg-white rounded-lg hover:bg-gray-100 focus:ring-4 focus:outline-none dark:text-white focus:ring-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800 dark:focus:ring-gray-600" type="button">
                <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 4 15">
                  <path d="M3.5 1.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 6.041a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 5.959a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" />
                </svg>
              </button>
              <div id="dropdownDots" className="z-10 bg-white divide-y divide-gray-100 rounded-lg shadow-sm w-40 dark:bg-gray-700 dark:divide-gray-600">
                <ul className ="py-2 text-sm text-gray-700 dark:text-gray-200" aria-labelledby="dropdownMenuIconButton">
                  <li>
                    <a href="#" className ="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Reply</a>
                  </li>
                  <li>
                    <a href="#" className ="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Forward</a>
                  </li>
                  <li>
                    <a href="#" className ="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Copy</a>
                  </li>
                  <li>
                    <a href="#" className ="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Report</a>
                  </li>
                  <li>
                    <a href="#" className ="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Delete</a>
                  </li>
                </ul>
              </div>
          </div> */}

          {/* //messsage write ui */}

          {/* <form>
            <label htmlFor="chat" className="sr-only">Your message</label>
            <div className="flex items-center px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-700">
              <textarea id="chat" rows={1} className="block mx-4 p-2.5 w-full text-sm text-gray-900 bg-white rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Your message..."></textarea>
              <button type="submit" className="inline-flex justify-center p-2 text-blue-600 rounded-full cursor-pointer hover:bg-blue-100 dark:text-blue-500 dark:hover:bg-gray-600">
                <svg className="w-5 h-5 rotate-90 rtl:-rotate-90" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 18 20">
                  <path d="m17.914 18.594-8-18a1 1 0 0 0-1.828 0l-8 18a1 1 0 0 0 1.157 1.376L8 18.281V9a1 1 0 0 1 2 0v9.281l6.758 1.689a1 1 0 0 0 1.156-1.376Z" />
                </svg>
                <span className="sr-only">Send message</span>
              </button>
            </div>
          </form> */}

        </div>
      </div>
    </>
  )
}

export default App