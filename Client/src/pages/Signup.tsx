import React, { useState, useContext, useRef, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import SignupContext from '../Context/Signupcontext';
import LoginContext from '../Context/Logincontext';
import Code from '../Context/Logincode';
import axios from 'axios';
import { MdOutlineRemoveRedEye } from "react-icons/md";
import { IoEyeOffOutline } from "react-icons/io5";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3"
import Commonheader from '../Components/Commonheader';
import { checkcookie } from "../Api/useAuth"
import { motion } from "framer-motion"

const Signup = () => {
  const { executeRecaptcha } = useGoogleReCaptcha()
  const [load, setLoad] = useState(false)
  const creadentials = useContext(SignupContext);
  const Logincredentials = useContext(LoginContext)
  const code = useContext(Code)
  const [visible, setVisible] = useState({ visible1: false, visible2: false })
  const [formData, setFormData] = useState({ email: '', username: '', password: '', repeatPassword: '', fname: '' })
  const [passwordStrength, setPasswordStrength] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  });
  const Navigate = useNavigate()
  const ref1 = useRef<HTMLInputElement>(null)
  const ref2 = useRef<HTMLInputElement>(null)
  const sendotp = useMemo(() => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }, [])

  useEffect(() => {
    const checkuser = async () => {
      const res = await checkcookie();
      if (res.message === 'Protected content') {
        Navigate(`/dashboard/${res.username}`)
      }
    }
    checkuser()
  }, [])

  useEffect(() => {
    if (ref1.current) {
      ref1.current.type = visible.visible1 ? "text" : "password";
    }
    if (ref2.current) {
      ref2.current.type = visible.visible2 ? "text" : "password";
    }
  }, [visible])

  useEffect(() => {
    if (formData.password) {
      setPasswordStrength({
        length: formData.password.length >= 8,
        uppercase: /[A-Z]/.test(formData.password),
        lowercase: /[a-z]/.test(formData.password),
        number: /[0-9]/.test(formData.password),
        special: /[!@#$%^&*]/.test(formData.password)
      });
    }
  }, [formData.password]);

  const handlechange1 = () => {
    setVisible({ ...visible, visible1: !visible.visible1 });
  }

  const handlechange2 = () => {
    setVisible({ ...visible, visible2: !visible.visible2 });
  }

  const handlechange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'username') {
      setFormData({ ...formData, [name]: value.replace(/[^a-zA-Z0-9_]/g, '').toLowerCase() });
    } else if (name === 'fname') {
      setFormData({ ...formData, [name]: value.replace(/[^a-zA-Z\s]/g, '') });
    } else if (name === 'password' || name === 'repeatPassword') {
      setFormData({ ...formData, [name]: value.replace(/\s/g, '') });
    } else if (name === 'email') {
      setFormData({ ...formData, [name]: value.toLowerCase() });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  }

  const getPasswordStrengthClass = (isValid: boolean) => {
    return isValid ? "text-green-400" : "text-gray-500";
  };

  const allRequirementsMet = () => {
    return (
      passwordStrength.length &&
      passwordStrength.uppercase &&
      passwordStrength.lowercase &&
      passwordStrength.number &&
      passwordStrength.special
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!executeRecaptcha) { return }

    if (formData.password !== formData.repeatPassword) {
      toast.error('Passwords do not match', {
        position: "bottom-center",
        theme: "dark",
      });
      return;
    }

    if (formData.username === formData.email) {
      toast.error('Username and Email cannot be the same', {
        position: "bottom-center",
        theme: "dark",
      });
      return;
    }

    if (!allRequirementsMet()) {
      toast.error('Password must meet all requirements', {
        position: "bottom-center",
        theme: "dark",
      });
      return;
    }

    if (formData.username.length < 6) {
      toast.error('Username must be at least 6 characters', {
        position: "bottom-center",
        theme: "dark",
      });
      return;
    }

    setLoad(true);

    try {
      const token = await executeRecaptcha("submit");
      const recaptchaRes = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/api/v1/verifyrecaptcha`,
        { token },
        { withCredentials: true, headers: { 'Content-Type': 'application/json' } }
      );

      if (recaptchaRes.data.success === false) {
        window.location.href = 'https://www.google.com';
        return;
      }

      const res = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/api/v1/usermail`,
        { email: formData.email, username: formData.username },
        { withCredentials: true, headers: { 'Content-Type': 'application/json' } }
      );

      if (res.data.result === false) {
        toast.error('Username or Email already exists', {
          position: "bottom-center",
          theme: "dark",
        });
        setFormData({ ...formData, email: '', username: '' });
      } else {
        creadentials?.setCredentials(formData);
        Logincredentials?.setUsermail(formData.email);
        code?.setCode(sendotp);
        Navigate(`/verifyotp/${sendotp}`);
      }
    } catch (error) {
      console.error('Error during signup:', error);
      toast.error('An error occurred. Please try again.', {
        position: "bottom-center",
        theme: "dark",
      });
    } finally {
      setLoad(false);
    }
  }

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
      <div className="absolute top-0 left-0 z-[-2] min-h-[160vh] w-screen bg-neutral-950 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(79,70,229,0.3),rgba(255,255,255,0))]">
      </div>
      <div className='w-full max-w-md mx-auto min-h-screen pb-10 px-4 flex flex-col justify-center items-center'>
        <Commonheader />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-[#1a1a2e]/50 rounded-xl md:w-[40vw] backdrop-blur-sm border border-indigo-500/20 shadow-xl p-6 mt-6"
        >
          <motion.h2
            className="text-2xl font-bold text-center text-white mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            Create an Account
          </motion.h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <motion.div
              className="mb-5"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <label htmlFor="email" className="block mb-2 text-sm font-medium text-indigo-200">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <svg className="w-5 h-5 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                </div>
                <input
                  onChange={handlechange}
                  value={formData.email}
                  name='email'
                  type="email"
                  id="email"
                  className="shadow-lg bg-[#252540] border border-indigo-500/30 text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 p-3 transition-all hover:border-indigo-400"
                  placeholder="name@chatthisway.com"
                  required
                />
              </div>
            </motion.div>

            <motion.div
              className="mb-5"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <label htmlFor="username" className="block mb-2 text-sm font-medium text-indigo-200">Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <svg className="w-5 h-5 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                </div>
                <input
                  value={formData.username}
                  onChange={handlechange}
                  name='username'
                  type="text"
                  id="username"
                  className="shadow-lg bg-[#252540] border border-indigo-500/30 text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 p-3 transition-all hover:border-indigo-400"
                  placeholder="johnsmith007"
                  required
                />
              </div>
              <p className="mt-1 text-xs text-gray-400">Username must be at least 6 characters (letters, numbers, underscores)</p>
            </motion.div>

            <motion.div
              className="mb-5"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <label htmlFor="fname" className="block mb-2 text-sm font-medium text-indigo-200">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <svg className="w-5 h-5 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z" />
                  </svg>
                </div>
                <input
                  onChange={handlechange}
                  name='fname'
                  value={formData.fname}
                  type="text"
                  id="fname"
                  className="shadow-lg bg-[#252540] border border-indigo-500/30 text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 p-3 transition-all hover:border-indigo-400"
                  placeholder='David Smith'
                  required
                />
              </div>
            </motion.div>

            <motion.div
              className="mb-5"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <label htmlFor="password" className="block mb-2 text-sm font-medium text-indigo-200">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <svg className="w-5 h-5 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                </div>
                <input
                  ref={ref1}
                  onChange={handlechange}
                  name='password'
                  value={formData.password}
                  type="password"
                  id="password"
                  className="shadow-lg bg-[#252540] border border-indigo-500/30 text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 p-3 pr-12 transition-all hover:border-indigo-400"
                  placeholder="••••••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={handlechange1}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
                >
                  {visible.visible1
                    ? <MdOutlineRemoveRedEye className="size-5 text-indigo-400 hover:text-indigo-300" />
                    : <IoEyeOffOutline className="size-5 text-indigo-400 hover:text-indigo-300" />}
                </button>
              </div>

              <motion.div
                className="mt-2 space-y-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <p className="text-xs text-indigo-300 mb-1">Password requirements:</p>
                <ul className="grid grid-cols-2 gap-x-4 gap-y-1 px-4">
                  <li className={`text-xs flex items-center ${getPasswordStrengthClass(passwordStrength.length)}`}>
                    <svg className={`mr-1 w-3 h-3 ${passwordStrength.length ? "text-green-400" : "text-gray-500"}`} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    At least 8 characters
                  </li>
                  <li className={`text-xs flex items-center ${getPasswordStrengthClass(passwordStrength.uppercase)}`}>
                    <svg className={`mr-1 w-3 h-3 ${passwordStrength.uppercase ? "text-green-400" : "text-gray-500"}`} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    One uppercase letter
                  </li>
                  <li className={`text-xs flex items-center ${getPasswordStrengthClass(passwordStrength.lowercase)}`}>
                    <svg className={`mr-1 w-3 h-3 ${passwordStrength.lowercase ? "text-green-400" : "text-gray-500"}`} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    One lowercase letter
                  </li>
                  <li className={`text-xs flex items-center ${getPasswordStrengthClass(passwordStrength.number)}`}>
                    <svg className={`mr-1 w-3 h-3 ${passwordStrength.number ? "text-green-400" : "text-gray-500"}`} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    One number
                  </li>
                  <li className={`text-xs flex items-center ${getPasswordStrengthClass(passwordStrength.special)}`}>
                    <svg className={`mr-1 size-4 md:size-3 ${passwordStrength.special ? "text-green-400" : "text-gray-500"}`} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    One special character (!@#$%^&*)
                  </li>
                </ul>
              </motion.div>
            </motion.div>

            <motion.div
              className="mb-5"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <label htmlFor="repeat-password" className="block mb-2 text-sm font-medium text-indigo-200">Confirm Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <svg className="w-5 h-5 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
                <input
                  ref={ref2}
                  onChange={handlechange}
                  name='repeatPassword'
                  value={formData.repeatPassword}
                  type="password"
                  id="repeat-password"
                  className="shadow-lg bg-[#252540] border border-indigo-500/30 text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 p-3 pr-12 transition-all hover:border-indigo-400"
                  placeholder="••••••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={handlechange2}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
                >
                  {visible.visible2
                    ? <MdOutlineRemoveRedEye className="size-5 text-indigo-400 hover:text-indigo-300" />
                    : <IoEyeOffOutline className="size-5 text-indigo-400 hover:text-indigo-300" />}
                </button>
              </div>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-6"
            >
              {!load ? (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="w-full text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 focus:ring-4 focus:outline-none focus:ring-indigo-300 font-medium rounded-lg text-sm px-5 py-3 text-center shadow-lg shadow-indigo-900/20 transition-all"
                >
                  Create Account
                </motion.button>
              ) : (
                <button disabled type="button" className="w-full text-white bg-gradient-to-r from-indigo-600 to-purple-600 font-medium rounded-lg text-sm px-5 py-3 text-center inline-flex justify-center items-center cursor-not-allowed shadow-lg shadow-indigo-900/20">
                  <svg aria-hidden="true" role="status" className="inline w-4 h-4 me-3 text-white animate-spin" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="#E5E7EB" />
                    <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentColor" />
                  </svg>
                  Creating account...
                </button>
              )}
            </motion.div>
          </form>

          <motion.div
            className="flex items-center my-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            <div className="h-px w-full bg-indigo-800/30"></div>
            <div className="px-4 text-sm text-gray-400">OR</div>
            <div className="h-px w-full bg-indigo-800/30"></div>
          </motion.div>
          <motion.div
            className="text-center"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.0 }}
          >
            <p className="text-gray-300 mb-4">
              Already have an account?
            </p>
            <Link
              to="/login"
              className="inline-flex justify-center items-center text-indigo-300 hover:text-indigo-200 font-medium transition-colors border-b border-dashed border-indigo-500/50 pb-1"
            >
              Login to your account
              <svg className="w-4 h-4 ml-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </motion.div>
        </motion.div>

      </div>
    </>

  );
};

export default Signup;