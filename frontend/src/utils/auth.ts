import { useNavigate } from "react-router-dom";

export function check_auth(setIsLoggedIn: (value: boolean) => void, navigate: ReturnType<typeof useNavigate>) {
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  fetch(`${BACKEND_URL}/auth/check`, {
    method: "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response: Response) => response.json())
    .then((data: { isLoggedIn: boolean, isComplete: boolean}) => {
      if (data.isLoggedIn === true) {
        setIsLoggedIn(true);
        if (data.isComplete){
        navigate("/home");}
        else {
            navigate("/setup");
        }
      }
    });
}

export function handleLogout(setIsLoggedIn: (value: boolean) => void) {
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  fetch(`${BACKEND_URL}/auth/logout`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response: Response) => response.json())
    .then((data: { logoutStatus: string }) => {
      if (data.logoutStatus === "success") {
        setIsLoggedIn(false);
      }
    });
}