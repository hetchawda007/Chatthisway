import { useEffect, useState, useContext, useMemo } from "react";
import SignupContext from '../Context/Signupcontext';
import axios from 'axios';
import { useNavigate, useParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import nacl from "tweetnacl";
import naclUtil from "tweetnacl-util";
import bcrypt from "bcryptjs";
import LoginContext from "../Context/Logincontext";
import Code from "../Context/Logincode";
import Commonheader from "../Components/Commonheader";
import { createcookie } from "../Api/useAuth"
import { motion } from "framer-motion"

const Verifyotp = () => {
    const { codenumber } = useParams();
    const [otp, setOtp] = useState(Array(6).fill(""));
    const [load, setLoad] = useState(false);
    const [resendDisabled, setResendDisabled] = useState(true);
    const [timer, setTimer] = useState(60);
    const creadentials = useContext(SignupContext);
    const logincontext = useContext(LoginContext);
    const code = useContext(Code);
    const Navigate = useNavigate();
    const sendotp = useMemo(() => {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }, []);

    // Handle OTP input change
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

    // Set up countdown timer for OTP resend
    useEffect(() => {
        let interval: ReturnType<typeof setInterval> | null = null;
        if (resendDisabled && timer > 0) {
            interval = setInterval(() => {
                setTimer((prevTimer) => {
                    if (prevTimer <= 1) {
                        setResendDisabled(false);
                        return 0;
                    }
                    return prevTimer - 1;
                });
            }, 1000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [resendDisabled, timer]);

    const sendOtpToEmail = async () => {
        try {
            const response = await axios.post(
                'https://api.brevo.com/v3/smtp/email',
                {
                    sender: { name: 'Chatthisway', email: 'deployment0007@gmail.com' },
                    to: [{ email: logincontext?.usermail }],
                    subject: `Chatthisway - Verification Code`,
                    htmlContent: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background: linear-gradient(to bottom, #1e1e2f, #252540);">
                        <div style="text-align: center; padding: 20px 0;">
                            <h1 style="color: #f3f4f6; margin: 0;">Chatthisway</h1>
                            <p style="color: #d1d5db; font-size: 16px;">Secure End-to-End Encrypted Messaging</p>
                        </div>
                        <div style="background-color: rgba(79, 70, 229, 0.1); border-left: 4px solid #6366f1; padding: 15px; margin: 20px 0; border-radius: 5px;">
                            <p style="color: #e5e7eb; font-size: 16px; margin-bottom: 15px;">Don't share this code with anyone. This code is used to verify your identity.</p>
                            <h2 style="color: #f9fafb; font-size: 32px; letter-spacing: 5px; text-align: center; margin: 10px 0; font-weight: bold;">${sendotp}</h2>
                            <p style="color: #9ca3af; font-size: 14px; text-align: center; margin-top: 15px;">This code will expire in 10 minutes</p>
                        </div>
                        <p style="color: #9ca3af; font-size: 14px; text-align: center; margin-top: 20px;">If you didn't request this code, please ignore this email.</p>
                    </div>
                    `,
                },
                {
                    headers: {
                        'api-key': import.meta.env.VITE_BREVO_API_KEY,
                        'Content-Type': 'application/json',
                    },
                }
            );
            return response.status === 201;
        } catch (error) {
            console.error('Error sending OTP:', error);
            return false;
        }
    };

    // Handle resend OTP
    const handleResendOtp = async () => {
        if (!resendDisabled) {
            const success = await sendOtpToEmail();
            if (success) {
                toast.success('New verification code sent!', {
                    position: "bottom-center",
                    theme: "dark",
                });
                setResendDisabled(true);
                setTimer(60);
            } else {
                toast.error('Failed to send code. Please try again.', {
                    position: "bottom-center",
                    theme: "dark",
                });
            }
        }
    };

    useEffect(() => {
        if (codenumber !== code?.code) {
            Navigate('/pagenotfound');
            return;
        }
        sendOtpToEmail();
    }, [sendotp, code?.code, codenumber, Navigate]);

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

        if (otp.join("") !== sendotp.toString()) {
            toast.error('Incorrect verification code', {
                position: "bottom-center",
                theme: "dark",
            });
            setOtp(Array(6).fill(""));
            setLoad(false);
            return;
        }

        if (creadentials?.credentials.username === "" && otp.join("") === sendotp.toString()) {
            code?.setCode(sendotp.toString());
            Navigate(`/resetpass/${logincontext?.usermail}${sendotp}`);
            return;
        }

        if (otp.join("") === sendotp.toString() && creadentials?.credentials.username !== "") {
            try {
                // Generate key pairs for encryption and signing
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

                const encryptPrivateKey = async (privateKey: string, password: string) => {
                    const encoder = new TextEncoder();
                    const salt = window.crypto.getRandomValues(new Uint8Array(16));
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

                    const iv = window.crypto.getRandomValues(new Uint8Array(12));
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

                const signingKeyPair = await generateSigningKeyPair();
                const cryptoKeyPair = await generatecryptoKeyPair();
                const hashedPassword = await hashPassword(creadentials?.credentials.password || "");
                const privatecryptokey = await encryptPrivateKey(
                    cryptoKeyPair.privateKey,
                    creadentials?.credentials.password || ""
                );
                const privatesigninkey = await encryptPrivateKey(
                    signingKeyPair.privateKey,
                    creadentials?.credentials.password || ""
                );

                // Store keys in IndexedDB
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
                        store.put({
                            id: 1,
                            cryptokey: cryptoKeyPair?.privateKey,
                            signinkey: signingKeyPair?.privateKey
                        });
                    };
                } catch (error: any) {
                    console.error("Error storing data in IndexedDB:", error.message);
                    toast.error('Failed to store security keys locally');
                    setLoad(false);
                    return;
                }

                // Create user on server
                await axios.post(
                    `${import.meta.env.VITE_SERVER_URL}/api/v1/createuser`,
                    {
                        username: creadentials?.credentials?.username || "",
                        email: creadentials?.credentials?.email || "",
                        publiccryptokey: cryptoKeyPair?.publicKey || "",
                        publicsigninkey: signingKeyPair?.publicKey || "",
                        privatecryptokey: privatecryptokey || "",
                        privatesigninkey: privatesigninkey || "",
                        password: hashedPassword || "",
                        fname: creadentials?.credentials?.fname || "",
                        secretkey: import.meta.env.VITE_COOKIE_SECRET,
                    },
                    {
                        withCredentials: true,
                        headers: { 'Content-Type': 'application/json' },
                    }
                );

                // Create cookie and navigate to dashboard
                if (creadentials?.credentials.username) {
                    await createcookie(creadentials.credentials.username);
                    Navigate(`/dashboard/${creadentials?.credentials.username}`);
                }
            } catch (error: any) {
                console.error("Error during signup:", error.response?.data || error.message);
                toast.error("Failed to create account. Please try again.", {
                    position: "bottom-center",
                    theme: "dark",
                });
                setLoad(false);
            }
        }
    };

    return (
        <>
            <ToastContainer
                position="bottom-center"
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
            <div className='w-full max-w-md mx-auto min-h-[100vh] px-4 flex flex-col justify-center items-center'>
                <Commonheader />

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="bg-[#1a1a2e]/50 rounded-xl backdrop-blur-sm border border-indigo-500/20 shadow-xl p-6 mt-6 w-full"
                >
                    <motion.h2
                        className="text-2xl font-bold text-center text-white mb-3"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        Verify Your Email
                    </motion.h2>

                    <motion.p
                        className="text-center text-gray-300 mb-6"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        Enter the verification code we sent to<br />
                        <span className="text-indigo-300 font-medium">
                            {logincontext?.usermail.replace(/(.{1}).+(.{1}@.+)/, "$1*******$2")}
                        </span>
                    </motion.p>

                    <form onSubmit={handleSubmit} className="flex flex-col items-center">
                        <motion.div
                            className="flex mb-6 space-x-3"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            {Array.from({ length: 6 }).map((_, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 + index * 0.1 }}
                                >
                                    <label htmlFor={`code-${index + 1}`} className="sr-only">{`Code ${index + 1}`}</label>
                                    <input
                                        type="text"
                                        maxLength={1}
                                        id={`code-${index + 1}`}
                                        className="block w-12 h-12 py-3 text-xl font-bold text-center text-white bg-[#252540] border border-indigo-500/30 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 hover:border-indigo-400 transition-all shadow-sm"
                                        required
                                        value={otp[index]}
                                        onChange={(e) => handlechange(e, index)}
                                        onKeyDown={(e) => handleKeyDown(e, index)}
                                        autoFocus={index === 0}
                                    />
                                </motion.div>
                            ))}
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.7 }}
                            className="w-full mb-6 text-center"
                        >
                            {resendDisabled ? (
                                <p className="text-gray-400 text-sm">
                                    Didn't receive code? Resend in <span className="font-bold text-indigo-400">{timer}s</span>
                                </p>
                            ) : (
                                <button
                                    type="button"
                                    onClick={handleResendOtp}
                                    className="text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors underline focus:outline-none"
                                >
                                    Resend verification code
                                </button>
                            )}
                        </motion.div>

                        <motion.div
                            className="w-full"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.7 }}
                        >
                            {!load ? (
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    type="submit"
                                    className="w-full text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 font-medium rounded-lg text-sm px-5 py-3 text-center shadow-lg shadow-indigo-900/20 transition-all"
                                >
                                    Verify and Continue
                                </motion.button>
                            ) : (
                                <button disabled type="button" className="w-full text-white bg-gradient-to-r from-indigo-600 to-purple-600 font-medium rounded-lg text-sm px-5 py-3 text-center inline-flex justify-center items-center cursor-not-allowed shadow-lg shadow-indigo-900/20">
                                    <svg aria-hidden="true" role="status" className="inline w-4 h-4 me-3 text-white animate-spin" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="#E5E7EB" />
                                        <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentColor" />
                                    </svg>
                                    Verifying...
                                </button>
                            )}
                        </motion.div>
                    </form>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.9 }}
                        className="mt-8 text-center"
                    >
                        <p className="text-gray-400 text-sm">
                            Check your spam folder if you don't see the email.
                        </p>
                    </motion.div>
                </motion.div>
            </div>
        </>
    );
};

export default Verifyotp;
