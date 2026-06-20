import { useRef, useState, useEffect } from "react";
import "../App.css";
import WS from "../class/ws";
import { FiX, FiMail } from "react-icons/fi";

interface UnreadNotifsComponentProps {
  unreadNotifs: string[];
  setUnreadNotifs: React.Dispatch<React.SetStateAction<string[]>>;
}

const UnreadNotifsComponent: React.FC<UnreadNotifsComponentProps> = ({
  unreadNotifs,
  setUnreadNotifs,
}) => {
  const [showUnreadNotifs, setShowUnreadNotifs] = useState<boolean>(false);

  useEffect(() => {
    WS.add_callback("clearNotifsStatus", (data) => {
      if (data.status === "success") {
        setUnreadNotifs([]);
        setShowUnreadNotifs(false);
      }
    });
  }, []);

  return (
    <>
      {showUnreadNotifs && (
        <div className="right-4 w-60 max-h-50 overflow-y-auto bg-white border rounded shadow p-2">
          <button
            onClick={() => setShowUnreadNotifs(false)}
            className="float-right text-gray-400 hover:text-gray-600"
          >
            <FiX />
          </button>
          <button
            onClick={() => WS.send({ type: "clear_unread_notifs" })}
            className="rounded border p-1"
          >
            Clear
          </button>
          {unreadNotifs.map((notif, i) => (
            <p key={i} className="text-sm text-gray-700 border-b p-1">
              {notif}
            </p>
          ))}
        </div>
      )}

      <button
        onClick={() => {
          setShowUnreadNotifs(true);
        }}
        className="flex flex-col justify-center items-center w-10 h-10 p-2 rounded border hover:text-gray-400"
      >
        <FiMail className="w-10 h-10" />
      </button>
    </>
  );
};

export default UnreadNotifsComponent;
