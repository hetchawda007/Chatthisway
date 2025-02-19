import { createContext } from "react";

interface ContextType {
    code: string,
    setCode: React.Dispatch<React.SetStateAction<string>>
}

const Code = createContext<ContextType | undefined>(undefined);
export default Code;