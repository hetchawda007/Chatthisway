import { useEffect, useState, useContext, useMemo } from "react";
import SignupContext from '../Context/Signupcontext';
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import nacl from "tweetnacl";
import naclUtil from "tweetnacl-util";
import bcrypt from "bcryptjs";
import LoginContext from "../Context/Logincontext";

const Verifyotp = () => {
    const [otp, setOtp] = useState(Array(6).fill(""));
    const [load, setLoad] = useState(false);
    const creadentials = useContext(SignupContext);
    const logincontext = useContext(LoginContext);
    const Navigate = useNavigate();
    const sendotp = useMemo(() => {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }, [])

    const handlechange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const value = e.target.value;
        if (/^[0-9]$/.test(value) || value === "") {
            const newOtp = [...otp];
            newOtp[index] = value;
            setOtp(newOtp);
            if (value !== "") {
                const nextInput = document.getElementById(`code-${index + 2}`);
                if (nextInput) {
                    nextInput.focus();
                }
            }
        }
    };

    useEffect(() => {

        const otpsender = async () => {
            try {
                const response = await axios.post(
                    'https://api.brevo.com/v3/smtp/email',
                    {
                        sender: { name: 'Chatthisway', email: 'deployment0007@gmail.com' },
                        to: [{ email: logincontext?.usermail }],
                        subject: `Chatthisway - OTP Code`,
                        htmlContent: `
                    <p>Don't share this code with anyone.</p> 
                    <p>Your OTP code is: <strong>${sendotp}</strong></p>
                    `,
                    },
                    {
                        headers: {
                            'api-key': import.meta.env.VITE_BREVO_API_KEY,
                            'Content-Type': 'application/json',
                        },
                    }
                );
                if (response.status === 201) {
                    return response;
                }
            } catch (error) {
                console.error('Error sending OTP:', error);
            }
        };
        otpsender();
    }, []);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === "Backspace" && otp[index] === "") {
            const prevInput = document.getElementById(`code-${index}`);
            if (prevInput) {
                prevInput.focus();
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoad(true);
        setOtp(Array(6).fill(""));
        if (otp.join("") !== sendotp.toString()) {
            toast('Incorrect Otp', {
                position: "bottom-center",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "dark",
            });
            setLoad(false);
        }
        if (creadentials?.credentials.username === "" && otp.join("") === sendotp.toString()) {
            Navigate(`/resetpass/${logincontext?.usermail}`);
        } else {
            if (otp.join("") === sendotp.toString() && creadentials?.credentials.username !== "") {
                const generateSigningKeyPair = async () => {
                    const keyPair = nacl.sign.keyPair();
                    return {
                        publicKey: naclUtil.encodeBase64(keyPair.publicKey),
                        privateKey: naclUtil.encodeBase64(keyPair.secretKey),
                    };
                };
                const generatecryptoKeyPair = async () => {
                    const keyPair = nacl.box.keyPair();
                    return {
                        publicKey: naclUtil.encodeBase64(keyPair.publicKey),
                        privateKey: naclUtil.encodeBase64(keyPair.secretKey),
                    };
                };
                async function hashPassword(password: string) {
                    const salt = await bcrypt.genSalt(10);
                    const hashedPassword = await bcrypt.hash(password, salt);
                    return hashedPassword;
                }

                const hashedPassword = await hashPassword(creadentials?.credentials.password ? creadentials?.credentials.password : "")
                const signingKeyPair = await generateSigningKeyPair();
                const cryptoKeyPair = await generatecryptoKeyPair();

                const dbRequest = indexedDB.open("Credentials", 1);

                dbRequest.onupgradeneeded = function () {
                    const db = dbRequest.result;
                    db.createObjectStore("users", { keyPath: "id" });
                };  

                dbRequest.onsuccess = function () {
                    const db = dbRequest.result;
                    const tx = db.transaction("users", "readwrite");
                    const store = tx.objectStore("users");
                    store.put({ id: 1, cryptokey: cryptoKeyPair?.privateKey, signinkey: signingKeyPair?.privateKey });
                };

                try {
                    await axios.post('http://localhost:8080/api/createuser', {
                        username: creadentials?.credentials?.username || "",
                        email: creadentials?.credentials?.email || "",
                        cryptokey: cryptoKeyPair?.publicKey || "",
                        signinkey: signingKeyPair?.publicKey || "",
                        password: hashedPassword || "",
                        fname: creadentials?.credentials?.fname || "",

                    }, {
                        headers: {
                            'Content-Type': 'application/json',
                        }
                    });
                } catch (error: any) {
                    console.error("Error creating user:", error.response?.data || error.message);
                }

                Navigate(`/dashboard/${creadentials?.credentials.username}`);
            }
        }
    };

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
                theme="light"
            />
            <div className="absolute top-0 left-0 z-[-2] h-screen w-screen bg-neutral-950 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]">
            </div>
            <div className='w-[50vw] mx-auto min-h-[50vh]'>
                <div className='my-8 flex flex-col gap-5 items-center'>
                    <img className='h-20 w-20 object-cover rounded-full shadow-lg' src="logo.webp" alt="ChatThisWay Logo" />
                    <div className='text-gray-200 font-bold text-3xl tracking-wide'>ChatThisWay</div>
                </div>

                <form onSubmit={handleSubmit} className="max-w-sm mx-auto flex flex-col items-center">
                    <div className="flex mb-2 space-x-2 rtl:space-x-reverse">
                        {Array.from({ length: 6 }).map((_, index) => (
                            <div key={index}>
                                <label htmlFor={`code-${index + 1}`} className="sr-only">{`Code ${index + 1}`}</label>
                                <input
                                    type="text"
                                    maxLength={1}
                                    id={`code-${index + 1}`}
                                    className="block w-9 h-9 py-3 text-sm font-extrabold text-center text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500 no-arrows"
                                    required
                                    value={otp[index]}
                                    onChange={(e) => handlechange(e, index)}
                                    onKeyDown={(e) => handleKeyDown(e, index)}
                                    autoFocus={index === 0}
                                />
                            </div>
                        ))}
                    </div>
                    <p id="helper-text-explanation" className="mt-2 mb-5 text-sm text-gray-500 dark:text-gray-400">Please enter the 6 digit code we sent via email.</p>
                    {!load && <button type="submit" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Confirm</button>}

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
    );
};

export default Verifyotp;
