import { createContext } from "react";

interface user {
    username: string,
    fname: string
}

interface Userprops {
    users: user[];
    setUsers: React.Dispatch<React.SetStateAction<user[]>>;
}

const Usercontext = createContext<Userprops | undefined>(undefined);
export default Usercontext;