import { createContext } from "react";

interface Inmobileprops {
    inmobile: boolean;
    setInmobile: (inmobile: boolean) => void;
}

const inmobileContext = createContext<Inmobileprops | undefined>(undefined)
export default inmobileContext