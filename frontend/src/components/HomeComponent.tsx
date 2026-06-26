import { useState, useEffect } from "react";
import "../App.css";
import WS from "../class/ws";
import defaultPfp from "../assets/default_pfp.jpg";
import VisitProfileComponent from "./VisitProfileComponent";
import ChatComponent from "./ChatComponent";

interface HomeComponentProps {
}

interface convo {
  otherUsername: string;
  otherPfp: string;
  otherId: number;
  lastMessage: string;
  lastSender: string;
}

const HomeComponent: React.FC<HomeComponentProps> = () => {

  const [username, setUsername] = useState<string>("");
  const [fame, setFame] = useState<string>("");
  const [profilePic, setProfilePic] = useState<string>("");
  const [convos, setConvos] = useState<convo[]>([]);

  const [showProfile, setShowProfile] = useState<boolean>(false);

  const [showChat, setShowChat] = useState<boolean>(false);
  const [chatOtherUsername, setChatOtherUsername] = useState<string>("");
  const [chatOtherId, setChatOtherId] = useState<number>(-1);

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
    <div className="h-screen flex flex-col bg-green-100">
      {/* Top header */}
      <div className="flex items-center justify-between px-6 py-3 bg-white border-b-2 border-green-600">
        <div
          className="flex items-center gap-4"
          onClick={() => setShowProfile(true)}
        >
          <img
            src={
              profilePic ? `data:image/jpeg;base64,${profilePic}` : defaultPfp
            }
            alt="profile"
            className="w-10 h-10 rounded-full object-cover border-2 border-green-600"
          />
          <div className="text-lg font-bold text-green-800">{username}</div>
          <p className="text-sm text-orange-500 font-bold">🔥 {fame}</p>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left chat list */}
        <div className="w-80 border-r-2 border-green-600 bg-white flex flex-col">
          <p className="text-lg font-bold text-green-800 p-4">Chats</p>
          <div className="flex flex-col overflow-y-auto border-t border-green-600">
            {convos.length === 0 ? (
              <p className="text-green-600 p-4">No chats yet</p>
            ) : (
              convos.map((convo, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-3 p-4 border-b border-green-600 hover:bg-green-50 ${
                    chatOtherUsername === convo.otherUsername && showChat
                      ? "bg-green-50"
                      : ""
                  }`}
                  onClick={() => {
                    setShowChat(true);
                    setChatOtherUsername(convo.otherUsername);
                    setChatOtherId(convo.otherId);
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
                    <p className="font-bold text-green-800">
                      {convo.otherUsername}
                    </p>
                    <p className="text-sm text-green-600">
                      {convo.lastMessage
                        ? `${convo.lastSender}: ${convo.lastMessage}`
                        : "No messages yet"}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* selected chat area */}
        <div className="flex-1 flex flex-col bg-white pb-15">
          {showChat ? (
            <ChatComponent
              setShowChat={setShowChat}
              otherUsername={chatOtherUsername}
              otherId={chatOtherId}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-green-600 text-lg">
                Select a chat to start messaging
              </p>
            </div>
          )}
        </div>
      </div>

      {showProfile && (
        <VisitProfileComponent setShowProfile={setShowProfile} profileId={-1} />
      )}
    </div>
  );
};

export default HomeComponent;
