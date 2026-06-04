import { useEffect, useState } from "react";
import "./App.css";
import LoginComponent from "./components/LoginComponent";
import { Routes, Route, Navigate } from "react-router-dom";
import HomeComponent from "./components/HomeComponent";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  return (
    <>
      <Routes>
      <Route
        path="/"
        element={<Navigate to="/login" replace />}
      />

      <Route
        path="/login"
        element={<LoginComponent setIsLoggedIn={setIsLoggedIn} />}
      />

      <Route
        path="/home"
        element={isLoggedIn ? <HomeComponent /> : <Navigate to="/login" replace />}
      />
      </Routes>
    </>
  );
}

export default App;
