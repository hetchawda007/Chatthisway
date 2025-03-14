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
import { motion } from "framer-motion"

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

    const response = await axios.post(`${import.meta.env.VITE_SERVER_URL}/api/v1/verifyrecaptcha`, { token: token }, {
      headers: {
        'Content-Type': 'application/json'
      }
    })
    if (response.data.success === false) {
      window.location.href = 'https://www.google.com';
    }

    const res = await axios.post(`${import.meta.env.VITE_SERVER_URL}/api/v1/auth`, {
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
      const res = await axios.post(`${import.meta.env.VITE_SERVER_URL}/api/v1/getpass`, {
        usermail: usermail,
        secretkey: import.meta.env.VITE_COOKIE_SECRET
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

          await createcookie(usermail);

          const keys = await axios.post(`${import.meta.env.VITE_SERVER_URL}/api/v1/getcryptokeys`, { usermail: usermail }, {
            withCredentials: true,
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
      <div className="absolute top-0 left-0 z-[-2] h-screen w-screen bg-neutral-950 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(79,70,229,0.3),rgba(255,255,255,0))]">
      </div>

      <div className='w-[50vw] mx-auto min-h-[50vh] max-md:w-[90%] max-w-md'>
        <Commonheader />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-[#1a1a2e]/50 rounded-xl backdrop-blur-sm border border-indigo-500/20 shadow-xl p-6 mt-6"
        >
          <motion.h2
            className="text-2xl font-bold text-center text-white mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Welcome Back
          </motion.h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <motion.div
              className="mb-5"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <label htmlFor="usermail" className="block mb-2 text-sm font-medium text-indigo-200">Username or Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <svg className="w-5 h-5 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                </div>
                <input
                  onChange={(e) => setUsermail(e.target.value)}
                  name='usermail'
                  value={usermail || ''}
                  type="text"
                  id="usermail"
                  className="shadow-lg bg-[#252540] border border-indigo-500/30 text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 p-3 transition-all hover:border-indigo-400"
                  placeholder="username or name@chatthisway.com"
                  required
                />
              </div>
            </motion.div>

            <motion.div
              className="mb-5"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <label htmlFor="password" className="block mb-2 text-sm font-medium text-indigo-200">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <svg className="w-5 h-5 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                </div>
                <input
                  ref={ref}
                  onChange={(e) => setPassword(e.target.value)}
                  name='password'
                  value={password || ''}
                  type="password"
                  id="password"
                  className="shadow-lg bg-[#252540] border border-indigo-500/30 text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 p-3 pr-12 transition-all hover:border-indigo-400"
                  placeholder="••••••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={handlechange}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
                >
                  {visible.visible1
                    ? <MdOutlineRemoveRedEye className="size-5 text-indigo-400 hover:text-indigo-300" />
                    : <IoEyeOffOutline className="size-5 text-indigo-400 hover:text-indigo-300" />}
                </button>
              </div>
              <div className="flex justify-end mt-2">
                <Link to="/forgot-password" className="text-xs text-indigo-300 hover:text-indigo-200 transition-colors">Forgot password?</Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              {!load ? (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="w-full text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 focus:ring-4 focus:outline-none focus:ring-indigo-300 font-medium rounded-lg text-sm px-5 py-3 text-center shadow-lg shadow-indigo-900/20 transition-all"
                >
                  Login to your account
                </motion.button>
              ) : (
                <button disabled type="button" className="w-full text-white bg-gradient-to-r from-indigo-600 to-purple-600 font-medium rounded-lg text-sm px-5 py-3 text-center inline-flex justify-center items-center cursor-not-allowed shadow-lg shadow-indigo-900/20">
                  <svg aria-hidden="true" role="status" className="inline w-4 h-4 me-3 text-white animate-spin" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="#E5E7EB" />
                    <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentColor" />
                  </svg>
                  Logging in...
                </button>
              )}
            </motion.div>
          </form>

          <motion.div
            className="flex items-center my-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <div className="h-px w-full bg-indigo-800/30"></div>
            <div className="px-4 text-sm text-gray-400">OR</div>
            <div className="h-px w-full bg-indigo-800/30"></div>
          </motion.div>

          <motion.div
            className="text-center"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <p className="text-gray-300 mb-4">
              Don't have an account?
            </p>
            <Link
              to="/signup"
              className="inline-flex justify-center items-center text-indigo-300 hover:text-indigo-200 font-medium transition-colors border-b border-dashed border-indigo-500/50 pb-1"
            >
              Create an account
              <svg className="w-4 h-4 ml-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </>
  )
}

export default Login