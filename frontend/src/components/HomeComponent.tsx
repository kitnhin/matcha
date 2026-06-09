import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";
import { handleLogout } from "../utils/auth";
import WS from "../class/ws";
import defaultPfp from "../assets/default_pfp.jpg";

interface HomeComponentProps {
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
}

const HomeComponent: React.FC<HomeComponentProps> = ({ setIsLoggedIn }) => {
    const [username, setUsername] = useState<string>("");
    const [fame, setFame] = useState<string>("");
    const [profilePic, setProfilePic] = useState<string>("");
  
    useEffect(() => {
      WS.setup();
      WS.add_callback("user_display_data", (message) => {
        setUsername(message.username);
        setFame(message.fame);
        setProfilePic(message.profile_pic);
        console.log(message.profile_pic);
      });
      WS.send({ page: "home", type: "get_user_display_data" });
    }, []);
  
    return (
      <div className="min-h-screen">
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <img
              src={profilePic ? `data:image/jpeg;base64,${profilePic}` : defaultPfp}
              alt="profile"
              className="w-12 h-12 rounded-full object-cover"
            />
            <span className="text-lg font-semibold">{username}</span>
            <div className="flex items-center gap-1 text-orange-500">
              <span>🔥</span>
              <span>{fame}</span>
            </div>
          </div>
          <button
            onClick={() => handleLogout(setIsLoggedIn)}
            className="px-4 py-2 text-sm bg-red-500 text-white rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>
  
        {/* Divider */}
        <hr className="border-gray-300" />
  
        {/* Center content */}
        <div className="flex flex-col items-center justify-center mt-40">
          <h1 className="text-5xl">Welcome to the home</h1>
          <button
            onClick={() => WS.send({ message: "HELLO FROM THE FRONT" })}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Send
          </button>
        </div>
      </div>
    );
  };

export default HomeComponent;
