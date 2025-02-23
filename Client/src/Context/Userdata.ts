import { createContext } from "react";


interface user {
    email: string,
    username: string,
    password: string,
    repeatPassword: string,
    fname: string
    signatureprivatekey: string
    signaturepublickey: string,
    cryptoprivatekey: string
    cryptopublickey: string
    description : string
    gender: string
}

interface Userprops {
    user: user;
    setUser: React.Dispatch<React.SetStateAction<user>>;
}

const Userdata = createContext<Userprops | undefined>(undefined);
export default Userdata;