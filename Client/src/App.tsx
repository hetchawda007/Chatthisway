import './App.css'
import { useParams } from 'react-router'
function App() {
  const { username } = useParams()
  return (
    <>
      <div className='text-red-600'>dashboard of {username}</div>
    </>
  )
}

export default App