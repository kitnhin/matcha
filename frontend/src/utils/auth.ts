import { useNavigate } from "react-router-dom";
import WS from "../class/ws";

export function check_auth(
  setIsLoggedIn: (value: boolean) => void,
  navigate: ReturnType<typeof useNavigate>
) {
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  fetch(`${BACKEND_URL}/auth/check`, {
    method: "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response: Response) => response.json())
    .then((data: { isLoggedIn: boolean; isComplete: boolean }) => {
      if (data.isLoggedIn === true) {
        setIsLoggedIn(true);
        if (data.isComplete === false) {
          navigate("/setup");
        } else if (
          window.location.pathname === "/login" ||
          window.location.pathname === "/register" ||
          window.location.pathname === "/"
        ) {
          navigate("/home");
        }
      } else if (window.location.pathname === "/") {
        navigate("/login");
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
        WS.close(); //got error here, fix ltr
      }
    });
}

export async function picToBase64(file : File): Promise<string> {
    const buffer = await file.arrayBuffer(); // get the binary data of the file (useless one cannot read or modify)
    const bytes = new Uint8Array(buffer); // convert this to Unicode (smth like ascii but more numbers) [255, 216, 255, 224, 0, 16, ...]
    
    let binaryString = '';
    for (const byte of bytes)
        binaryString += String.fromCharCode(byte); //convert this unicode to actual characters "ÿØÿà..." (mostly weird characters)

    const base64 = btoa(binaryString); // convert to base64 string
    return base64;
}
