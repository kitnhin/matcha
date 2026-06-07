import { useEffect, useState } from "react";
import "./App.css";
import LoginComponent from "./components/LoginComponent";
import { Routes, Route, Navigate } from "react-router-dom";
import HomeComponent from "./components/HomeComponent";
import ErrorPageNotFoundComponent from "./components/ErrorPageNotFoundComponent";
import RegisterComponent from "./components/RegisterComponent";
import { check_auth } from "./utils/auth";
import { useNavigate } from "react-router-dom";
import VerifyEmailComponent from "./components/VerifyEmailComponent";
import ProfileSetupComponent from "./components/ProfileSetupComponent";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  const navigate = useNavigate();

  //checks if the user is already logged in immediately when the page loads
  useEffect(() => {
    check_auth(setIsLoggedIn, navigate);
  }, []);

  return (
    <>
      <Routes>
        <Route
          path="/login"
          element={<LoginComponent setIsLoggedIn={setIsLoggedIn} />}
        />

        <Route
          path="/home"
          element={
            isLoggedIn ? (
              <HomeComponent setIsLoggedIn={setIsLoggedIn} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route path="/register" element={<RegisterComponent />} />

        <Route path="/auth/verify" element={<VerifyEmailComponent />} />

        <Route path="/setup" element={isLoggedIn ? (<ProfileSetupComponent setIsLoggedIn={setIsLoggedIn} />) : <Navigate to="/login" replace />} />

        <Route path="*" element={<ErrorPageNotFoundComponent />} />
      </Routes>
    </>
  );
}

export default App;
