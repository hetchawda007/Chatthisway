import React, { useState, useContext, useRef, useEffect } from 'react';
import { Link } from 'react-router';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import SignupContext from '../Context/Signupcontext';
import LoginContext from '../Context/Logincontext';
import axios from 'axios';
import { MdOutlineRemoveRedEye } from "react-icons/md";
import { IoEyeOffOutline } from "react-icons/io5";

const Signup = () => {
  const creadentials = useContext(SignupContext);
  const [load, setLoad] = useState(false)
  const Logincredentials = useContext(LoginContext)
  const [visible, setVisible] = useState({ visible1: false, visible2: false })
  const [formData, setFormData] = useState({ email: '', username: '', password: '', repeatPassword: '', fname: '' })
  const Navigate = useNavigate()
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

  const handlechange1 = () => {
    setVisible({ ...visible, visible1: !visible.visible1 });
  }

  const handlechange = (e: any) => {
    const { name, value } = e.target;
    if (name === 'username' || name === 'password') {
      setFormData({ ...formData, [name]: value.replace(/\s/g, '') });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  }
  const handlechange2 = () => {
    setVisible({ ...visible, visible2: !visible.visible2 });
  }
  // const handlechange = (e: any) => {
  //   setFormData({ ...formData, [e.target.name]: e.target.value })
  // }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.repeatPassword) {
      toast('Passwords do not match', {
        position: "bottom-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
      return;
    }
    else if (formData.username === formData.email) {
      toast('Username and Email cannot be same', {
        position: "bottom-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
      return;
    }
    else if (formData.password.length < 8 || !/[A-Z]/.test(formData.password) || !/[a-z]/.test(formData.password) || !/[0-9]/.test(formData.password) || !/[!@#$%^&*]/.test(formData.password)) {
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
    if (formData.username.length < 6) {
      toast('Username must contain more than 5 letters', {
        position: "bottom-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
      return
    }
    else {
      setLoad(true)

      const res = await axios.post('http://localhost:8080/api/usermail', {
        email: formData.email,
        username: formData.username,
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      if (res.data.result === false) {
        toast('Username or Email already exists', {
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
        setFormData({ ...formData, email: '', username: '' });
      }
      else {
        creadentials?.setCredentials(formData);
        Logincredentials?.setUsermail(formData.email);
        Navigate('/verifyotp')
      }
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
        theme="light"
      />
      <div className="absolute top-0 left-0 z-[-2] overflow-x-hidden h-[120vh] w-screen bg-neutral-950 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]">
      </div>
      <div className='w-[50vw] mx-auto min-h-[50vh] overflow-x-hidden'>
        <div className='my-8 flex flex-col gap-5 items-center'>
          <img className='h-20 w-20 object-cover rounded-full shadow-lg' src="logo.webp" alt="ChatThisWay Logo" />
          <div className='text-gray-200 font-bold text-3xl tracking-wide'>ChatThisWay</div>
        </div>


        <form onSubmit={handleSubmit} className="max-w-sm mx-auto">
          <div className="mb-5">
            <label htmlFor="email-address-icon" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Your Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
                <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 16">
                  <path d="m10.036 8.278 9.258-7.79A1.979 1.979 0 0 0 18 0H2A1.987 1.987 0 0 0 .641.541l9.395 7.737Z" />
                  <path d="M11.241 9.817c-.36.275-.801.425-1.255.427-.428 0-.845-.138-1.187-.395L0 2.6V14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2.5l-8.759 7.317Z" />
                </svg>
              </div>
              <input onChange={handlechange} value={formData.email} name='email' type="email" id="email-address-icon" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="name@chatthisway.com" required />
            </div>
          </div>
          <div className="mb-5">
            <label htmlFor="website-admin" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Your Username</label>
            <div className="flex">
              <span className="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border rounded-e-0 border-gray-300 border-e-0 rounded-s-md dark:bg-gray-600 dark:text-gray-400 dark:border-gray-600">
                <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 0a10 10 0 1 0 10 10A10.011 10.011 0 0 0 10 0Zm0 5a3 3 0 1 1 0 6 3 3 0 0 1 0-6Zm0 13a8.949 8.949 0 0 1-4.951-1.488A3.987 3.987 0 0 1 9 13h2a3.987 3.987 0 0 1 3.951 3.512A8.949 8.949 0 0 1 10 18Z" />
                </svg>
              </span>
              <input value={formData.username} onChange={handlechange} name='username' type="text" id="website-admin" className="rounded-none rounded-e-lg bg-gray-50 border text-gray-900 focus:ring-blue-500 focus:border-blue-500 block flex-1 min-w-0 w-full text-sm border-gray-300 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Johnsmith007" required />
            </div>
          </div>
          <div className="mb-5">
            <label htmlFor="fname" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Your Full Name</label>
            <input onChange={handlechange} name='fname' value={formData.fname} type="text" id="fname" className="shadow-xs bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-xs-light" required placeholder='David Smith' />
          </div>
          <div className="mb-5">
            <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Your password</label>
            <div className="flex w-[107%] items-center justify-evenly">
              <input ref={ref1} onChange={handlechange} name='password' value={formData.password} type="password" id="password" className="shadow-xs bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-xs-light" placeholder="Tqs#F56@sfrw*$ds" required />
              {visible.visible1 && <MdOutlineRemoveRedEye onClick={handlechange1} className="cursor-pointer size-6 relative right-8 text-gray-500 dark:text-gray-400" />}
              {!visible.visible1 && <IoEyeOffOutline onClick={handlechange1} className="cursor-pointer size-6 relative right-8 text-gray-500 dark:text-gray-400" />}
            </div>
          </div>
          <div className="mb-5">
            <label htmlFor="repeat-password" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Repeat password</label>
            <div className="flex w-[107%] items-center justify-evenly">
              <input ref={ref2} onChange={handlechange} name='repeatPassword' value={formData.repeatPassword} type="password" id="repeat-password" className="shadow-xs bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-xs-light" placeholder="Tqs#F56@sfrw*$ds" required />
              {visible.visible2 && <MdOutlineRemoveRedEye onClick={handlechange2} className="cursor-pointer size-6 relative right-8 text-gray-500 dark:text-gray-400" />}
              {!visible.visible2 && <IoEyeOffOutline onClick={handlechange2} className="cursor-pointer size-6 relative right-8 text-gray-500 dark:text-gray-400" />}
            </div>
          </div>
          <div className="flex items-start mb-5">
            <div className="flex items-center h-5">
              <input id="terms" type="checkbox" value="" className="w-4 h-4 border cursor-pointer border-gray-300 rounded-sm bg-gray-50 focus:ring-3 focus:ring-blue-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800" required />
            </div>
            <label htmlFor="terms" className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">I agree with the <a href="/terms&conditions" className="text-blue-600 hover:underline dark:text-blue-500">terms and conditions</a></label>
          </div>
          {!load && <button type="submit" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Register new account</button>}
          {load && <button disabled type="button" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 inline-flex items-center">
            <svg aria-hidden="true" role="status" className="inline w-4 h-4 me-3 text-white animate-spin" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="#E5E7EB" />
              <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentColor" />
            </svg>
            Loading...
          </button>}
        </form>
        <div className="w-full items-center my-8 flex gap-2">
          <div className="h-[2px] w-full bg-[#414141]"></div>
          <div className="text-[#98989A]">OR</div>
          <div className="h-[2px] w-full bg-[#414141]"></div>
        </div>
        <div className="flex w-full text-[#98989A] items-stretch justify-center gap-2 my-5">
          <div>Already have an account?</div>
          <Link className="flex gap-2 items-center" to={'/login'}><div className="underline">Login</div></Link>
        </div>
      </div>
    </>
  );
};

export default Signup;