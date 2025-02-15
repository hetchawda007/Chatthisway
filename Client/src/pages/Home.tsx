import { useNavigate } from "react-router"
import { useEffect } from "react"
const Home = () => {
    const navigate = useNavigate()
    useEffect(()=>{
        navigate('/login')
    },[])
    return (null)
}

export default Home