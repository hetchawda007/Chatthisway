import { useState, useEffect, useRef } from "react"
import Commonheader from "../Components/Commonheader"
import { Link } from "react-router"
import { useNavigate } from "react-router"
import { ToastContainer, toast } from "react-toastify"
import axios from "axios"
import bcrypt from "bcryptjs"
import naclUtil from "tweetnacl-util";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import { IoEyeOffOutline } from "react-icons/io5";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3"
import { useLocation } from "react-router"
import { createcookie, checkcookie } from "../Api/useAuth"

const Login = () => {
  const { executeRecaptcha } = useGoogleReCaptcha()
  const location = useLocation().search
  const islocaation = new URLSearchParams(location).get("passwordchanged")
  const [usermail, setUsermail] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [visible, setVisible] = useState({ visible1: false, visible2: false })
  const [load, setLoad] = useState(false)
  const Navigate = useNavigate()

  const ref = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (ref.current) {
      ref.current.type = visible.visible1 ? "text" : "password";
    }
  }, [visible])

  useEffect(() => {
    const checkuser = async () => {
      const res = await checkcookie();
      if (res.message === 'Protected content') {
        Navigate(`/dashboard/${res.username}`)
      }
    }
    checkuser()
    if (islocaation === 'true') {
      toast.success('Password updated Successfully', {
        position: "bottom-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
      Navigate('/login')
    }
  }, [])

  const handlechange = () => {
    setVisible({ ...visible, visible1: !visible.visible1 });
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoad(true)

    if (!executeRecaptcha) { return }
    const token = await executeRecaptcha("submit");

    const response = await axios.post(`${ import.meta.env.VITE_SERVER_URL }/api/verifyrecaptcha`, { token: token }, {
      headers: {
        'Content-Type': 'application/json'
      }
    })
    if (response.data.success === false) {
      window.location.href = 'https://www.google.com';
    }

    const res = await axios.post(`${ import.meta.env.VITE_SERVER_URL }/api/auth`, {
      usermail: usermail,
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (res.data.result === false) {
      toast.error('Incorrect username or Email', {
        position: "bottom-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
      setLoad(false)
      setUsermail('')
    }
    else if (res.data.result === true) {
      const res = await axios.post(`${ import.meta.env.VITE_SERVER_URL }/api/getpass`, {
        usermail: usermail,
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      })
      if (res.data.password) {
        const isMatch = await bcrypt.compare(password, res.data.password);

        if (!isMatch) {
          toast.error('Incorrect Password', {
            position: "bottom-center",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: false,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "dark",
          });
          setLoad(false);
          setPassword('');
        } else {

          const keys = await axios.post(`${ import.meta.env.VITE_SERVER_URL }/api/getcryptokeys`, { usermail: usermail }, {
            headers: {
              'Content-Type': 'application/json'
            }
          })

          const decryptPrivateKey = async (encryptedKey: string, password: string, iv: string, salt: string) => {
            const encoder = new TextEncoder();

            const keyMaterial = await window.crypto.subtle.importKey(
              "raw",
              encoder.encode(password),
              { name: "PBKDF2" },
              false,
              ["deriveKey"]
            );

            const derivedKey = await window.crypto.subtle.deriveKey(
              { name: "PBKDF2", salt: naclUtil.decodeBase64(salt), iterations: 100000, hash: "SHA-256" },
              keyMaterial,
              { name: "AES-GCM", length: 256 },
              false,
              ["decrypt"]
            );

            const decrypted = await window.crypto.subtle.decrypt(
              { name: "AES-GCM", iv: naclUtil.decodeBase64(iv) },
              derivedKey,
              naclUtil.decodeBase64(encryptedKey)
            );

            return new TextDecoder().decode(decrypted);
          };
          const cryptoprivatekey = await decryptPrivateKey(keys.data.cryptoprivatekey.encryptedKey, password, keys.data.cryptoprivatekey.iv, keys.data.cryptoprivatekey.salt);
          const signinprivatekey = await decryptPrivateKey(keys.data.signatureprivatekey.encryptedKey, password, keys.data.signatureprivatekey.iv, keys.data.signatureprivatekey.salt);
          console.log(cryptoprivatekey, signinprivatekey);
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
              store.put({ id: 1, cryptokey: cryptoprivatekey, signinkey: signinprivatekey });
            };
          }
          catch (error: any) {
            console.error("Error storing data in IndexedDB:", error.message);
          }
          await createcookie(usermail);
          Navigate(`/dashboard/${res.data.username}`);
        }
      }
    }
  }
  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
      <div className="absolute top-0 left-0 z-[-2] h-screen w-screen bg-neutral-950 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]">
      </div>
      <div className='w-[50vw] mx-auto min-h-[50vh] max-md:w-[90%]'>

        <Commonheader />

        <form onSubmit={handleSubmit} className="max-w-sm mx-auto">

          <div className="mb-5">
            <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Username or Email</label>
            <input onChange={(e) => setUsermail(e.target.value)} name='usermail' value={usermail || ''} type="text" id="usermail" className="shadow-xs bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-xs-light" placeholder="Johnsmith007 or name@chatthisway.com" required />
          </div>
          <div className="mb-5">
            <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Your password</label>
            <div className="flex w-[107%] items-center justify-evenly">
              <input ref={ref} onChange={(e) => setPassword(e.target.value)} name='password' value={password || ''} type="password" id="password" className="shadow-xs bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-xs-light" placeholder="Tqs#F56@sfrw*$ds" required />
              {visible.visible1 && <MdOutlineRemoveRedEye onClick={handlechange} className="cursor-pointer size-6 relative right-8 text-gray-500 dark:text-gray-400" />}
              {!visible.visible1 && <IoEyeOffOutline onClick={handlechange} className="cursor-pointer size-6 relative right-8 text-gray-500 dark:text-gray-400" />}
            </div>
          </div>

          {!load && <button type="submit" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Login your account</button>}
          {load && <button disabled type="button" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 inline-flex items-center">
            <svg aria-hidden="true" role="status" className="inline w-4 h-4 me-3 text-white animate-spin" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="#E5E7EB" />
              <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentColor" />
            </svg>
            Loading...
          </button>}
          <div className="w-full items-center my-8 flex gap-2">
            <div className="h-[2px] w-full bg-[#414141]"></div>
            <div className="text-[#98989A]">OR</div>
            <div className="h-[2px] w-full bg-[#414141]"></div>
          </div>
          <div className="flex w-full text-[#98989A] items-stretch justify-center gap-2 my-5">
            <div>Don’t have an account?</div>
            <Link className="flex gap-2 items-center" to={'/signup'}><div className="underline">Sign Up</div></Link>
          </div>
        </form>
      </div>
    </>
  )
}

export default Login