import { createContext } from "react";

interface credentials {
    email: string,
    username: string,
    password: string,
    repeatPassword: string,
    fname: string
}

interface ContextType {
    credentials: credentials,
    setCredentials: React.Dispatch<React.SetStateAction<credentials>>
}

const SignupContext = createContext<ContextType | undefined>(undefined);
export default SignupContext; 