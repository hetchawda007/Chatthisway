import { useParams, useNavigate } from "react-router"
import { useEffect } from "react"
import axios from "axios";
const Chat = () => {
    const { receiver } = useParams();
    const Navigate = useNavigate()
    useEffect(() => {
        const checkuser = async () => {
            if (!receiver) return;
            const res = await axios.post("http://localhost:8080/api/auth", { usermail: receiver })
            if (!res.data.result) {
                Navigate("/404page")
                return
            }
        }
        checkuser()
    }, [receiver])

    return (
        <>
            {receiver}
        </>
    )
}

export default Chat