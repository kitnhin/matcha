import { useState, useEffect, useRef } from "react";
import "../App.css";
import WS from "../class/ws";
import defaultPfp from "../assets/default_pfp.jpg";
import { FiSend } from "react-icons/fi";
import VisitProfileComponent from "./VisitProfileComponent";

interface ChatComponentProps {
  otherUsername: string;
  otherId: number;
  setShowChat: React.Dispatch<React.SetStateAction<boolean>>;
}

interface message {
  senderUsername: string;
  content: string;
}

const ChatComponent: React.FC<ChatComponentProps> = ({
  otherUsername,
  otherId,
  setShowChat,
}) => {
  const [messages, setMessages] = useState<message[]>([]);
  const [otherPfp, setOtherPfp] = useState<string>("");
  const [userPfp, setUserPfp] = useState<string>("");
  const [inputContent, setInputContent] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");

  const [showProfile, setShowProfile] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView();
  }, [messages]); //so that whenever someone send msg it auto scroll to bot

  useEffect(() => {
    WS.add_callback("getChatData", (message) => {
      if (message.status === "success") {
        setMessages(message.messages || []);
        setOtherPfp(message.otherPfp);
        setUserPfp(message.userPfp);
      } else {
        setErrorMsg(message.errorMessage);
      }
      WS.openChat = otherUsername;
    });

    WS.add_callback("newMessage", (message) => {
      if (message.status === "success") {
        setMessages((prev) => [...prev, message.newMessage]);
      } else {
        setErrorMsg(message.errorMessage);
      }
    });

    WS.send({ type: "get_chat_data", other_username: otherUsername });
  }, []);

  function sendMessage() {
    WS.send({
      type: "new_message",
      other_username: otherUsername,
      content: inputContent,
    });
    setInputContent("");
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex p-4 border-b border-green-600">
        <div
          className="flex items-center gap-3"
          onClick={() => setShowProfile(true)}
        >
          <img
            src={otherPfp ? `data:image/jpeg;base64,${otherPfp}` : defaultPfp}
            alt="profile"
            className="w-10 h-10 rounded-full object-cover"
          />
          <p className="text-lg font-bold text-green-800">{otherUsername}</p>
        </div>
        <button
          className="text-green-600 hover:text-green-800 ml-auto"
          onClick={() => {
            setShowChat(false);
            WS.openChat = null;
          }}
        >
          ✕
        </button>
      </div>

      {/* Messages */}
      <div className="flex flex-col w-full flex-1 overflow-y-auto p-4 gap-3">
        {messages && messages.length > 0 ? (
          messages.map((msg, i) =>
            msg.senderUsername === "You" ? (
              <div
                key={i}
                className="mr-auto flex gap-2"
                onClick={() => setShowProfile(true)}
              >
                <img
                  src={
                    userPfp ? `data:image/jpeg;base64,${userPfp}` : defaultPfp
                  }
                  alt="profile"
                  className="w-10 h-10 rounded-full object-cover"
                />
                <p className="text-white bg-green-700 rounded-xl p-2">
                  {msg.content}
                </p>
              </div>
            ) : (
              <div key={i} className="ml-auto flex gap-2">
                <p className="text-green-900 border-2 border-green-600 rounded-xl p-2">
                  {msg.content}
                </p>
                <img
                  src={
                    otherPfp ? `data:image/jpeg;base64,${otherPfp}` : defaultPfp
                  }
                  alt="profile"
                  className="w-10 h-10 rounded-full object-cover"
                />
              </div>
            ),
          )
        ) : (
          <p className="text-green-600">No messages yet</p>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      {errorMsg === "" ? (
        <div className="flex gap-2 p-3 border-t border-green-200">
          <input
            className="rounded-xl border-2 border-green-600 bg-green-50 w-full p-2 text-green-900 outline-none focus:border-green-500"
            value={inputContent}
            onChange={(e) => setInputContent(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") sendMessage();
            }}
          />
          <button
            className="text-green-700 hover:text-green-900"
            onClick={() => sendMessage()}
          >
            <FiSend />
          </button>
        </div>
      ) : (
        <p className="text-red-500 p-3">{errorMsg}</p>
      )}

      {showProfile && (
        <VisitProfileComponent
          profileId={otherId}
          setShowProfile={setShowProfile}
        />
      )}
    </div>
  );
};

export default ChatComponent;
