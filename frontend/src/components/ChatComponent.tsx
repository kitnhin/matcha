import { useState, useEffect, useRef } from "react";
import "../App.css";
import WS from "../class/ws";
import defaultPfp from "../assets/default_pfp.jpg";
import { FiSend } from "react-icons/fi";

interface ChatComponentProps {
  otherUsername: string;
  setShowChat: React.Dispatch<React.SetStateAction<boolean>>;
}

interface message {
  senderUsername: string;
  content: string;
}

const ChatComponent: React.FC<ChatComponentProps> = ({
  otherUsername,
  setShowChat,
}) => {
  const [messages, setMessages] = useState<message[]>([]);
  const [otherPfp, setOtherPfp] = useState<string>("");
  const [userPfp, setUserPfp] = useState<string>("");
  const [inputContent, setInputContent] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView();
  }, [messages]); //so that whenever someone send msg it auto scroll to bot

  useEffect(() => {
    WS.add_callback("getChatData", (message) => {
      if(message.status === "success") {
        setMessages(message.messages || []);
        setOtherPfp(message.otherPfp);
        setUserPfp(message.userPfp);
      }
      else {
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
    // Blur bg
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center"
      onClick={() => {
        setShowChat(false);
        WS.openChat = null;
      }}
    >
      {/* Main popup */}
      <div
        className="bg-white rounded-lg shadow-lg w-96 h-150 flex flex-col"
        onClick={(e) => e.stopPropagation()} //so when i click the chat parts it doesnt close
      >
        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b">
          <img
            src={otherPfp ? `data:image/jpeg;base64,${otherPfp}` : defaultPfp}
            alt="profile"
            className="w-10 h-10 rounded-full object-cover"
          />
          <p className="text-lg font-semibold flex-1">{otherUsername}</p>
          <button
            className="text-gray-500 hover:text-gray-700"
            onClick={() => {
              setShowChat(false);
              WS.openChat = null;
            }}
          >
            ✕
          </button>
        </div>

        {/* Messages */}
        <div className="flex flex-col w-full h-full overflow-y-auto p-4 gap-3">
          {messages && messages.length > 0 ? (
            messages.map((msg, i) =>
              msg.senderUsername === "You" ? (
                <div key={i} className="mr-auto flex gap-2">
                  <img
                    src={
                      userPfp ? `data:image/jpeg;base64,${userPfp}` : defaultPfp
                    }
                    alt="profile"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <p className="text-white bg-blue-500 rounded p-2">
                    {msg.content}
                  </p>
                </div>
              ) : (
                <div key={i} className="ml-auto flex gap-2">
                  <p className="text-black border rounded p-2">{msg.content}</p>
                  <img
                    src={
                      otherPfp
                        ? `data:image/jpeg;base64,${otherPfp}`
                        : defaultPfp
                    }
                    alt="profile"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                </div>
              )
            )
          ) : (
            <p>No messages yet</p>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        {errorMsg === "" ? (
          <div className="flex gap-2 p-3">
            <input
              className="border w-full p-2 rounded"
              value={inputContent}
              onChange={(e) => setInputContent(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") sendMessage();
              }}
            ></input>
            <button onClick={() => sendMessage()}>
              <FiSend />
            </button>
          </div>
        ) : (
          <p className="text-red-500">{errorMsg}</p>
        )}
      </div>
    </div>
  );
};
export default ChatComponent;
