import { createContext } from "react";

interface Hideelementeprops {
    hideelemenmt: boolean;
    setHideelement: (hideelemenmt: boolean) => void;
}

const Hideelement = createContext<Hideelementeprops | undefined>(undefined)
export default Hideelement