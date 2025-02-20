import { useState, useRef, useEffect, useContext } from "react"
import { ToastContainer, toast } from "react-toastify"
import { MdOutlineRemoveRedEye } from "react-icons/md";
import { IoEyeOffOutline } from "react-icons/io5";
import { useParams, useNavigate } from "react-router";
import axios from "axios";
import bcrypt from "bcryptjs"
import naclUtil from "tweetnacl-util";
import Code from "../Context/Logincode";
import Commonheader from "../Components/Commonheader";
import { deletecookie } from "../Api/useAuth";

const Resetpass = () => {
    const { usermail } = useParams()
    const code = useContext(Code)
    const Navigate = useNavigate()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [repeatPassword, setRepeatPassword] = useState('')
    const [visible, setVisible] = useState({ visible1: false, visible2: false })
    const [cryptokey, setCryptokey] = useState('')
    const [signkey, setSignkey] = useState('')
    const [load, setLoad] = useState(false)
    const ref1 = useRef<HTMLInputElement>(null)
    const ref2 = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (ref1.current) {
            ref1.current.type = visible.visible1 ? "text" : "password";
        }
        if (ref2.current) {
            ref2.current.type = visible.visible2 ? "text" : "password";
        }
    }, [visible])

    useEffect(() => {
        const mail = usermail?.slice(0, usermail.length - 6)
        const code2 = usermail?.slice(usermail?.length - 6, usermail?.length)
        if (code2 !== code?.code) {
            Navigate('/pagenotfound')
        }
        setEmail(mail || '')
    }, [])

    const handlechange1 = () => {
        setVisible({ ...visible, visible1: !visible.visible1 });
    }
    const handlechange2 = () => {
        setVisible({ ...visible, visible2: !visible.visible2 });
    }
    const handleSubmit = async (e: any) => {
        e.preventDefault()
        setLoad(true)
        if (password !== repeatPassword) {
            toast('Passwords do not match', {
                position: "bottom-center",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "dark",
            });
            return;
        }
        else if (password.length < 8 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password) || !/[!@#$%^&*]/.test(password)) {
            toast('Password must be at least 8 characters long and include uppercase, lowercase, number, and special character', {
                position: "bottom-center",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "dark",
            });
            return;
        }
        else {
            const res = await axios.post('http://localhost:8080/api/getpass', { usermail: email },
                {
                    headers: {
                        'Content-Type': 'application/json',
                    }
                }
            )
            const isMatch = await bcrypt.compare(password, res.data.password)

            if (isMatch) {
                toast('Password cannot be same as old password', {
                    position: "bottom-center",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: false,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "dark",
                });
                setLoad(false)
                return;
            }
            else {

                try {
                    const dbRequest = indexedDB.open("Credentials", 1);
                    dbRequest.onsuccess = function () {
                        const db = dbRequest.result;
                        const tx = db.transaction("users", "readonly");
                        const store = tx.objectStore("users");

                        const getRequest = store.get(1);
                        getRequest.onsuccess = function () {
                            setCryptokey(getRequest.result.cryptokey)
                            setSignkey(getRequest.result.signinkey)
                        };
                    };

                    dbRequest.onerror = function () {
                        console.error("Error opening database:", dbRequest.error);
                    };
                } catch (error) {
                    console.error("Error accessing IndexedDB:", error);
                }

                const encryptPrivateKey = async (privateKey: string, password: string) => {
                    const encoder = new TextEncoder();

                    // Generate a salt for PBKDF2
                    const salt = window.crypto.getRandomValues(new Uint8Array(16));

                    // Derive encryption key using PBKDF2
                    const keyMaterial = await window.crypto.subtle.importKey(
                        "raw",
                        encoder.encode(password),
                        { name: "PBKDF2" },
                        false,
                        ["deriveKey"]
                    );

                    const derivedKey = await window.crypto.subtle.deriveKey(
                        { name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256" },
                        keyMaterial,
                        { name: "AES-GCM", length: 256 },
                        false,
                        ["encrypt"]
                    );

                    const iv = window.crypto.getRandomValues(new Uint8Array(12)); // Random IV

                    // Encrypt the private key using AES-GCM
                    const encrypted = await window.crypto.subtle.encrypt(
                        { name: "AES-GCM", iv },
                        derivedKey,
                        encoder.encode(privateKey)
                    );

                    return {
                        encryptedKey: naclUtil.encodeBase64(new Uint8Array(encrypted)),
                        iv: naclUtil.encodeBase64(iv),
                        salt: naclUtil.encodeBase64(salt),
                    };
                };

                async function hashPassword(password: string) {
                    const salt = await bcrypt.genSalt(10);
                    const hashedPassword = await bcrypt.hash(password, salt);
                    return hashedPassword;
                }

                const encryptedCryptoKey = await encryptPrivateKey(cryptokey, password)
                const encryptedSignKey = await encryptPrivateKey(signkey, password)
                const hashedPassword = await hashPassword(password)
                const res = await axios.put('http://localhost:8080/api/updatepass', { usermail: email, password: hashedPassword, cryptokey: encryptedCryptoKey, signinkey: encryptedSignKey },
                    {
                        headers: {
                            'Content-Type': 'application/json',
                        }
                    }
                )

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
                await deletecookie()
                Navigate('/login?passwordchanged=true')
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
            <div className='w-[50vw] mx-auto min-h-[50vh]'>

                <Commonheader />

                <form onSubmit={handleSubmit} className="max-w-sm mx-auto">
                    <div className="mb-5">
                        <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Your new password</label>
                        <div className="flex items-center justify-evenly">
                            <input ref={ref1} onChange={(e) => setPassword(e.target.value)} name='password' value={password} type="password" id="password" className="shadow-xs bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-xs-light" placeholder="Tqs#F56@sfrw*$ds" required />
                            {visible.visible1 && <MdOutlineRemoveRedEye onClick={handlechange1} className="cursor-pointer size-6 relative right-8 text-gray-500 dark:text-gray-400" />}
                            {!visible.visible1 && <IoEyeOffOutline onClick={handlechange1} className="cursor-pointer size-6 relative right-8 text-gray-500 dark:text-gray-400" />}
                        </div>
                    </div>
                    <div className="mb-5">
                        <label htmlFor="repeat-password" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Repeat new password</label>
                        <div className="flex items-center justify-evenly">
                            <input ref={ref2} onChange={(e) => setRepeatPassword(e.target.value)} name='repeatpassword' value={repeatPassword} type="password" id="repeat-password" className="shadow-xs bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-xs-light" placeholder="Tqs#F56@sfrw*$ds" required />
                            {visible.visible2 && <MdOutlineRemoveRedEye onClick={handlechange2} className="cursor-pointer size-6 relative right-8 text-gray-500 dark:text-gray-400" />}
                            {!visible.visible2 && <IoEyeOffOutline onClick={handlechange2} className="cursor-pointer size-6 relative right-8 text-gray-500 dark:text-gray-400" />}
                        </div>
                    </div>
                    {!load && <button type="submit" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Change Password</button>}
                    {load && <button disabled type="button" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 inline-flex items-center">
                        <svg aria-hidden="true" role="status" className="inline w-4 h-4 me-3 text-white animate-spin" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="#E5E7EB" />
                            <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentColor" />
                        </svg>
                        Loading...
                    </button>}
                </form>
            </div>
        </>
    )
}

export default Resetpass
