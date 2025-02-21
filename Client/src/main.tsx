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
import Usercontext from './Context/Usercontext.ts';

const Main = () => {
  interface credentials {
    email: string,
    username: string,
    password: string,
    repeatPassword: string,
    fname: string
  }
  interface user {
    username: string,
    fname: string
  }
  const [Credentials, setCredentials] = useState<credentials>({ email: '', username: '', password: '', repeatPassword: '', fname: '' });
  const [Usermail, setUsermail] = useState('');
  const [code, setCode] = useState('564751');
  const [users, setUsers] = useState<user[]>([]);
  return (
    <SignupContext.Provider value={{ credentials: Credentials, setCredentials }}>
      <LoginContext.Provider value={{ usermail: Usermail, setUsermail }}>
        <Usercontext.Provider value={{ users: users, setUsers }}>
          <Code.Provider value={{ code: code, setCode }}>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Loginwithrecaptcha />} />
                <Route path="/signup" element={<Signupwithrecaptcha />} />
                <Route path="/verifyotp/:codenumber" element={<Verifyotp />} />
                <Route path="/terms&conditions" element={<Terms />} />
                <Route path="/dashboard/:username" element={<App />} />
                <Route path="/Resetpass/:usermail" element={<Resetpass />} />
                <Route path="*" element={<Pagenotfound />} />
              </Routes>
            </BrowserRouter>
          </Code.Provider>
        </Usercontext.Provider>
      </LoginContext.Provider>
    </SignupContext.Provider>
  );
};

createRoot(document.getElementById('root')!).render(<Main />);