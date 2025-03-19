import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import App from './App.tsx';
import Home from './pages/Home.tsx';
import Verifyotp from './pages/Verifyotp.tsx';
import SignupContext from './Context/Signupcontext.ts';
import LoginContext from './Context/Logincontext.ts';
import Code from './Context/Logincode.ts';
import Loginwithrecaptcha from './Components/Loginwithrecaptcha.tsx';
import Signupwithrecaptcha from './Components/Signupwithrecaptcha.tsx';
import Pagenotfound from './Components/Pagenotfound.tsx';
import Userscontext from './Context/Userscontext.ts';
import inmobileContext from './Context/Inmobile.ts';
import Userdata from './Context/Userdata.ts';
import Chatusers from './Context/Chatusers.ts';
import Hideelement from './Context/Hideelement.ts';
import 'react-loading-skeleton/dist/skeleton.css'
import { HelmetProvider } from 'react-helmet-async';

const Main = () => {
  interface credentials {
    email: string,
    username: string,
    password: string,
    repeatPassword: string,
    fname: string
  }
  interface users {
    username: string,
    fname: string
  }


  interface messageprops {
    encryptedmessage: string,
    iv: string
  }

  interface chatuser {
    username: string,
    lastmessage: messageprops,
    date: string,
    signaturepublickey: string,
    cryptopublickey: string,
    messagecount: number
  }

  const [Credentials, setCredentials] = useState<credentials>({ email: '', username: '', password: '', repeatPassword: '', fname: '' });
  const [Usermail, setUsermail] = useState('');
  const [code, setCode] = useState('564751');
  const [inmobile, setInmobile] = useState(false);
  const [hideelement, setHideelement] = useState(false);
  const [users, setUsers] = useState<users[]>([]);
  const [userdata, setUserdata] = useState({
    email: '', username: '', password: '', repeatPassword: '', fname: '', description: '', signatureprivatekey: '', signaturepublickey: '', cryptoprivatekey: '', cryptopublickey: '', gender: ''
  });
  const [chatusers, setchatusers] = useState<chatuser[]>([]);

  return (
    <SignupContext.Provider value={{ credentials: Credentials, setCredentials }}>
      <LoginContext.Provider value={{ usermail: Usermail, setUsermail }}>
        <Userscontext.Provider value={{ users: users, setUsers }}>
          <Code.Provider value={{ code: code, setCode }}>
            <Userdata.Provider value={{ user: userdata, setUser: setUserdata }}>
              <Chatusers.Provider value={{ chatusers: chatusers, setchatusers: setchatusers }}>
                <inmobileContext.Provider value={{ inmobile, setInmobile }}>
                  <Hideelement.Provider value={{ hideelemenmt: hideelement, setHideelement }}>
                    <HelmetProvider>
                      <BrowserRouter>
                        <Routes>
                          <Route path="/" element={<Home />} />
                          <Route path="/login" element={<Loginwithrecaptcha />} />
                          <Route path="/signup" element={<Signupwithrecaptcha />} />
                          <Route path="/verifyotp/:codenumber" element={<Verifyotp />} />
                          <Route path="/dashboard/:username/:receiver?" element={<App />} />
                          <Route path="*" element={<Pagenotfound />} />
                        </Routes>
                      </BrowserRouter>
                    </HelmetProvider>
                  </Hideelement.Provider>
                </inmobileContext.Provider>
              </Chatusers.Provider>
            </Userdata.Provider>
          </Code.Provider>
        </Userscontext.Provider>
      </LoginContext.Provider>
    </SignupContext.Provider>
  );
};

createRoot(document.getElementById('root')!).render(<Main />);