import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";
import { handleLogout } from "../utils/auth";
import WS from "../class/ws";
import defaultPfp from "../assets/default_pfp.jpg";
import VisitProfileComponent from "./VisitProfileComponent";
import ChatComponent from "./ChatComponent";

interface HomeComponentProps {
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
}

interface convo {
  otherUsername: string;
  otherPfp: string;
  lastMessage: string;
  lastSender: string;
}

const HomeComponent: React.FC<HomeComponentProps> = ({ setIsLoggedIn }) => {
  const navigate = useNavigate();

  const [username, setUsername] = useState<string>("");
  const [fame, setFame] = useState<string>("");
  const [profilePic, setProfilePic] = useState<string>("");
  const [convos, setConvos] = useState<convo[]>([]);

  const [showProfile, setShowProfile] = useState<boolean>(false);

  const [showChat, setShowChat] = useState<boolean>(false);
  const [chatOtherUsername, setChatOtherUsername] = useState<string>("");

  useEffect(() => {
    WS.add_callback("userHomeData", (message) => {
      setUsername(message.username);
      setFame(message.fame);
      setProfilePic(message.profile_pic);
      setConvos(message.convos);
    });
    WS.add_callback("updateConvoHome", (message) => {
      setConvos((prev) => {
        const updatedConvos = prev.map((convo) => {
          if (convo.otherUsername === message.otherUsername) {
            return {
              ...convo,
              lastMessage: message.newMessage.content,
              lastSender: message.newMessage.senderUsername,
            };
          }
          return convo;
        });
        return updatedConvos;
      });
    });

    WS.send({ type: "get_user_home_data" });
  }, []);

  return (
    <div className="h-screen flex flex-col">
      {/* top header area */}
      <div className="flex items-center justify-between px-6 py-4">
        <div
          className="flex items-center gap-4"
          onClick={() => setShowProfile(true)}
        >
          <img
            src={
              profilePic ? `data:image/jpeg;base64,${profilePic}` : defaultPfp
            }
            alt="profile"
            className="w-12 h-12 rounded-full object-cover"
          />
          <span className="text-lg font-semibold">{username}</span>
          <div className="flex items-center gap-1 text-orange-500">
            <span>🔥</span>
            <span>{fame}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate("/settings")}
            className="px-4 py-2 text-sm bg-red-500 text-white rounded hover:bg-red-600"
          >
            Settings
          </button>
          <button
            onClick={() => {
              handleLogout(setIsLoggedIn);
              navigate("/login");
            }}
            className="px-4 py-2 text-sm bg-red-500 text-white rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </div>

      <hr className="border-gray-300" />

      <div className="flex flex-1 overflow-hidden">
        {/* Main area */}
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center">
            <h1 className="text-5xl">Welcome to the home</h1>
            <div className="flex flex-col items-center gap-3 mt-4">
              <button
                onClick={() => navigate("/browse")}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Browse profiles
              </button>
              <button
                onClick={() => navigate("/research")}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Research profiles
              </button>
            </div>
          </div>
        </div>

        {/* Chats sect */}
        <div className="w-72 border-l border-gray-300 flex flex-col">
          <p className="text-lg font-bold p-3">Chats</p>
          <div className="flex overflow-y-auto border-t">
            {convos.map((convo, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-4 border-b w-full border-gray-400"
                onClick={() => {
                  setShowChat(true);
                  setChatOtherUsername(convo.otherUsername);
                }}
              >
                <img
                  src={
                    convo.otherPfp
                      ? `data:image/jpeg;base64,${convo.otherPfp}`
                      : defaultPfp
                  }
                  alt="profile"
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold">{convo.otherUsername}</p>
                  <p className="text-sm text-gray-500">
                    {convo.lastMessage
                      ? `${convo.lastSender}: ${convo.lastMessage}`
                      : "No messages yet"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showProfile && (
        <VisitProfileComponent setShowProfile={setShowProfile} profileId={-1} />
      )}

      {showChat && (
        <ChatComponent
          setShowChat={setShowChat}
          otherUsername={chatOtherUsername}
        />
      )}
    </div>
  );
};

export default HomeComponent;
