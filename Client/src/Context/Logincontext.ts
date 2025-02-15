import { createContext } from "react";

interface ContextType {
    usermail: string,
    setUsermail: React.Dispatch<React.SetStateAction<string>>
}

const LoginContext = createContext<ContextType | undefined>(undefined);
export default LoginContext; 