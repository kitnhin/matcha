import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";
import { handleLogout } from "../utils/auth";

interface HomeComponentProps {
    setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
}

const HomeComponent: React.FC<HomeComponentProps> = ({setIsLoggedIn}) => {

  return (
    <>
    <h1 className="text-5xl"> Welcome to the home</h1>
    <button onClick={() => handleLogout(setIsLoggedIn)}>
        logout
    </button>
    </>
  );
}

export default HomeComponent;