import { createContext } from "react";

interface messageprops {
    encryptedmessage: string,
    iv : string
}

interface chatuser {
    username: string,
    lastmessage: messageprops,
    date: string,
    signaturepublickey: string,
    cryptopublickey: string,
    messagecount: number
}
interface chatusersprops {
    chatusers: chatuser[]
    setchatusers: React.Dispatch<React.SetStateAction<chatuser[]>>
}

const Chatusers = createContext<chatusersprops | undefined>(undefined)
export default Chatusers