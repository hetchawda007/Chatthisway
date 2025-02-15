import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login.tsx';
import './index.css';
import Signup from './pages/Signup.tsx';
import App from './App.tsx';
import Home from './pages/Home.tsx';
import Terms from './pages/Terms.tsx';
import Verifyotp from './pages/Verifyotp.tsx';
import SignupContext from './Context/Signupcontext.ts';
import LoginContext from './Context/Logincontext.ts';

const Main = () => {
  interface credentials {
    email: string,
    username: string,
    password: string,
    repeatPassword: string
  }

  const [Credentials, setCredentials] = useState<credentials>({ email: '', username: '', password: '', repeatPassword: '' });
  const [Usermail, setUsermail] = useState('');

  return (
    <StrictMode>
      <SignupContext.Provider value={{ credentials: Credentials, setCredentials }}>
        <LoginContext.Provider value={{ usermail: Usermail, setUsermail }}>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/verifyotp" element={<Verifyotp />} />
              <Route path="/terms&conditions" element={<Terms />} />
              <Route path="/dashboard" element={<App />} />
            </Routes>
          </BrowserRouter>
        </LoginContext.Provider>
      </SignupContext.Provider>
    </StrictMode>
  );
};

createRoot(document.getElementById('root')!).render(<Main />);