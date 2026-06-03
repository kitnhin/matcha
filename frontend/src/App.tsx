import { useEffect, useState } from 'react'
import './App.css'

function App() {

    const [message, setMessage] = useState<string>("")
  useEffect(() => {
    fetch("http://localhost:5050/api/test")
    .then((response : Response) => response.json())
    .then((data : {message: string}) => {
        setMessage(JSON.stringify(data));
        console.log(data)})
  }, [message])

  return (
    <>
    <h1>
        {message}
    </h1>
    </>
  )
}

export default App
