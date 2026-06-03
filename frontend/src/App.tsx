import { useEffect, useState } from "react";
import "./App.css";
import LoginComponent from "./login";
import "./App.css"

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  //     const [message, setMessage] = useState<string>("")
  //   useEffect(() => {
  //     fetch("http://localhost:5050/api/test")
  //     .then((response : Response) => response.json())
  //     .then((data : {message: string}) => {
  //         setMessage(JSON.stringify(data));
  //         console.log(data)})
  //   }, [message])

  return (
    <>
      {isLoggedIn ? (
        <h1> Welcome </h1>
      ) : (
        <LoginComponent setIsLoggedIn={setIsLoggedIn} />
      )}
    </>
  );
}

export default App;
