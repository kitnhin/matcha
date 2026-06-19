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
import SettingsComponent from "./components/SettingsComponent";
import ForgotPasswordComponent from "./components/ForgotPasswordComponent";
import BrowseComponent from "./components/BrowseComponent";
import ResearchComponent from "./components/ResearchComponent";
import MainLayout from "./layout/MainLayout";

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

        <Route path="/register" element={<RegisterComponent />} />

        <Route path="/verify-email" element={<VerifyEmailComponent />} />

        {/* <Route
          path="/setup"
          element={
            isLoggedIn ? (
              <ProfileSetupComponent setIsLoggedIn={setIsLoggedIn} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        /> */}

        <Route path="/reset-password" element={<ForgotPasswordComponent />} />

        {isLoggedIn && (
          <Route element={<MainLayout setIsLoggedIn={setIsLoggedIn}/>}>
            <Route
              path="/home"
              element={<HomeComponent setIsLoggedIn={setIsLoggedIn} />}
            />

            <Route
              path="/setup"
              element={<ProfileSetupComponent setIsLoggedIn={setIsLoggedIn} />}
            />

            <Route path="/settings" element={<SettingsComponent />} />

            <Route path="/browse" element={<BrowseComponent />} />

            <Route path="/research" element={<ResearchComponent />} />
          </Route>
        )}

        <Route path="*" element={<ErrorPageNotFoundComponent />} />
      </Routes>
    </>
  );
}

export default App;
