import { useEffect, useState } from "react";
import "../App.css";
import { Outlet } from "react-router-dom";
import WS from "../class/ws";
import NotifComponent from "../components/NotifComponent";
import { FiLogOut, FiMail, FiX } from "react-icons/fi";
import ConfirmLogoutComponent from "../components/ConfirmLogoutComponent";
import UnreadNotifsComponent from "../components/UnreadNotifsComponent";

interface MainLayoutProps {
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
}

const MainLayout: React.FC<MainLayoutProps> = ({ setIsLoggedIn }) => {
  const [notif, setNotif] = useState<string>("");
  const [showNotif, setShowNotif] = useState<boolean>(false);
  const [showConfirmLogout, setShowConfirmLogout] = useState<boolean>(false);
  const [unreadNotifs, setUnreadNotifs] = useState<string[]>([]);

  const [showUnreadNotifs, setShowUnreadNotifs] = useState<boolean>(false);

  useEffect(() => {
    // WS.setup();

    WS.add_callback("notif", (data) => {
      if (WS.openChat !== data.senderUsername) {
        setNotif(data.message);
        setShowNotif(true);
      }
    });

    WS.add_callback("unreadNotifs", (data) => {
      setUnreadNotifs(data.unreadNotifs);
    });

    WS.send({ type: "get_unread_notifs" });
  }, []);

  return (
    <>
      <Outlet />
      {showNotif && (
        <NotifComponent message={notif} setShowNotif={setShowNotif} />
      )}

      <div className="fixed bottom-4 right-4 gap-3 flex flex-col items-end">

        {unreadNotifs && unreadNotifs.length > 0 && (
          <UnreadNotifsComponent
            unreadNotifs={unreadNotifs}
            setUnreadNotifs={setUnreadNotifs}
          />
        )}

        <button
          onClick={() => {
            setShowConfirmLogout(true);
          }}
          className="flex flex-col justify-center items-center w-10 h-10 p-2 rounded border text-red-500 hover:text-red-700"
        >
          <FiLogOut className="w-10 h-10" />
        </button>
      </div>

      {showConfirmLogout && (
        <ConfirmLogoutComponent
          setShowConfirmLogout={setShowConfirmLogout}
          setIsLoggedIn={setIsLoggedIn}
        />
      )}
    </>
  );
};

export default MainLayout;
