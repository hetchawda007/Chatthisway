import './App.css'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import { useNavigate } from 'react-router'
import { checkcookie, deletecookie } from './Api/useAuth'

function App() {
  const { username } = useParams()
  const Navigate = useNavigate()
  const samplenames = [ 'Bonnie Green', 'Jese Tyler', 'Micheal Green', 'Jese Green', 'Bonnie Tyler']
  const [dropdown, setDropdown] = useState(false)

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
        catch (error: any) {
          console.error("Error storing data in IndexedDB:", error.message);
        }
        Navigate('/login')
      }
      else {
        Navigate(`/dashboard/${res.username}`)
      }
    }
    check()
  }, [])

  const handlelogout = async () => {
    const res = await deletecookie()
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
    catch (error: any) {
      console.error("Error storing data in IndexedDB:", error.message);
    }
    Navigate('/login')
  }

  return (
    <>
      {/* user online icone  */}
      {/* <div className="relative cursor-pointer">
              <div className="relative inline-flex items-center justify-center w-14 h-14 overflow-hidden bg-gradient-to-t from-[#7345be] via-[#7d53bf] to-[#9667e3] rounded-full">
                <span className="text-2xl font-semibold text-gray-600 dark:text-gray-300">H</span>
              </div>
              <span className="top-0 left-10 absolute w-[18px] h-[18px] bg-green-400 border-2 border-white dark:border-gray-800 rounded-full"></span>
            </div> */}
      <div className="container mx-auto flex h-screen">

        <div className='w-[27%] min-h-full bg-gradient-to-t from-[#1a1a1a] via-[#272727] to-[#313131]'>

          <div className='flex items-center pt-3 pl-3'>
            <div>
              <img onMouseOver={() => setDropdown(true)} onClick={() => setDropdown(!dropdown)} className='w-12 cursor-pointer' src="/avatar.png" alt="menu" />
              <div id="userDropdown" onMouseLeave={() => setDropdown(false)} className="z-10 absolute mt-3 bg-white divide-y divide-gray-100 rounded-lg shadow-sm w-44 dark:bg-gray-700 dark:divide-gray-600" style={{ display: dropdown ? 'block' : 'none' }}>
                <div className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                  <div>Bonnie Green</div>
                  <div className="font-medium truncate">name@flowbite.com</div>
                </div>
                <ul className="py-2 text-sm text-gray-700 dark:text-gray-200" aria-labelledby="avatarButton">
                  <li>
                    <a href="#" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Dashboard</a>
                  </li>
                  <li>
                    <a href="#" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Settings</a>
                  </li>
                  <li>
                    <a href="#" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Earnings</a>
                  </li>
                </ul>
                <div className="py-1">
                  <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white">Log Out</a>
                </div>
              </div>
            </div>
            <form className="max-w-md mx-auto flex items-center gap-2">
              <label htmlFor="default-search" className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white">Search</label>
              <div className="relative">
                <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
                  </svg>
                </div>
                <input type="search" id="default-search" className="block w-full py-2 ps-10 text-gray-900 border border-gray-300 rounded-full bg-gray-50 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-100 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Search" required />
              </div>
              <button type="button" className="text-white bg-blue-600 border border-blue-600 focus:outline-none hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 font-medium rounded-full text-sm px-4 py-2 me-2 dark:bg-blue-500 dark:border-blue-500 dark:hover:bg-blue-600 dark:focus:ring-blue-800">Search</button>
            </form>
          </div>
          <div>
            ebqwuifgwuyewyqu
          </div>

        </div>

        <div className='w-[73%] min-h-full bg-[url("/default.jpg")] bg-cover'>


            // dropdown ui



          // message ui

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

        </div>
      </div>
    </>
  )
}

export default App