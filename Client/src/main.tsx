import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import App from './App.tsx';
import Home from './pages/Home.tsx';
import Terms from './pages/Terms.tsx';
import Verifyotp from './pages/Verifyotp.tsx';
import SignupContext from './Context/Signupcontext.ts';
import LoginContext from './Context/Logincontext.ts';
import Code from './Context/Logincode.ts';
import Resetpass from './pages/Resetpass.tsx';
import Loginwithrecaptcha from './Components/Loginwithrecaptcha.tsx';
import Signupwithrecaptcha from './Components/Signupwithrecaptcha.tsx';
import Pagenotfound from './Components/Pagenotfound.tsx';
import Userscontext from './Context/Userscontext.ts';
import Userdata from './Context/Userdata.ts';

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

  const [Credentials, setCredentials] = useState<credentials>({ email: '', username: '', password: '', repeatPassword: '', fname: '' });
  const [Usermail, setUsermail] = useState('');
  const [code, setCode] = useState('564751');
  const [users, setUsers] = useState<users[]>([]);
  const [userdata, setUserdata] = useState({
    email: '', username: '', password: '', repeatPassword: '', fname: '', description: '', signatureprivatekey: '', signaturepublickey: '', cryptoprivatekey: '', cryptopublickey: '', gender: ''
  });

  return (
    <SignupContext.Provider value={{ credentials: Credentials, setCredentials }}>
      <LoginContext.Provider value={{ usermail: Usermail, setUsermail }}>
        <Userscontext.Provider value={{ users: users, setUsers }}>
          <Code.Provider value={{ code: code, setCode }}>
            <Userdata.Provider value={{ user: userdata, setUser: setUserdata }}>
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Loginwithrecaptcha />} />
                  <Route path="/signup" element={<Signupwithrecaptcha />} />
                  <Route path="/verifyotp/:codenumber" element={<Verifyotp />} />
                  <Route path="/terms&conditions" element={<Terms />} />
                  <Route path="/dashboard/:username/:receiver?" element={<App />} />
                  <Route path="/Resetpass/:usermail" element={<Resetpass />} />
                  <Route path="*" element={<Pagenotfound />} />
                </Routes>
              </BrowserRouter>
            </Userdata.Provider>
          </Code.Provider>
        </Userscontext.Provider>
      </LoginContext.Provider>
    </SignupContext.Provider>
  );
};

createRoot(document.getElementById('root')!).render(<Main />);