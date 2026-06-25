import { useEffect, useState } from "react";
import "../App.css";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import WS from "../class/ws";
import NotifComponent from "../components/NotifComponent";
import {
  FiLogOut,
  FiGlobe,
  FiSearch,
  FiSettings,
  FiHome,
} from "react-icons/fi";
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
  const [notifKey, setNotifKey] = useState<number>(0);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // WS.setup();

    WS.add_callback("notif", (data) => {
      if (WS.openChat !== data.senderUsername) {
        setNotif(data.message);
        setShowNotif(true);
        setNotifKey((prev) => prev + 1);
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
        <NotifComponent
          key={notifKey}
          message={notif}
          setShowNotif={setShowNotif}
        />
      )}

      <div className="fixed bottom-16 right-4 gap-3 flex flex-col items-end">
        {unreadNotifs && unreadNotifs.length > 0 && (
          <UnreadNotifsComponent
            unreadNotifs={unreadNotifs}
            setUnreadNotifs={setUnreadNotifs}
          />
        )}
      </div>

      {/* Bot nav bar */}
      {location.pathname !== "/setup" && (
        <div className="fixed bottom-0 left-0 right-0 flex items-center justify-between bg-white border-t-2 border-green-600">
          <div className="max-w-md flex mx-auto gap-10 p-1">
            <button
              onClick={() => navigate("/home")}
              className={`flex flex-col items-center text-green-700 hover:text-green-900 p-1 rounded ${
                location.pathname === "/home" ? "text-white bg-green-700" : ""
              }`}
            >
              <FiHome className="text-xl" />
              <div className="text-xs font-bold">Home</div>
            </button>
            <button
              onClick={() => navigate("/browse")}
              className={`flex flex-col items-center text-green-700 hover:text-green-900 p-1 rounded ${
                location.pathname === "/browse" ? "text-white bg-green-700" : ""
              }`}
            >
              <FiGlobe className="text-xl" />
              <div className="text-xs font-bold">Browse</div>
            </button>
            <button
              onClick={() => navigate("/research")}
              className={`flex flex-col items-center text-green-700 hover:text-green-900 p-1 rounded ${
                location.pathname === "/research"
                  ? "text-white bg-green-700"
                  : ""
              }`}
            >
              <FiSearch className="text-xl" />
              <div className="text-xs font-bold">Research</div>
            </button>
            <button
              onClick={() => navigate("/settings")}
              className={`flex flex-col items-center text-green-700 hover:text-green-900 p-1 rounded ${
                location.pathname === "/settings"
                  ? "text-white bg-green-700"
                  : ""
              }`}
            >
              <FiSettings className="text-xl" />
              <div className="text-xs font-bold">Settings</div>
            </button>
            <button
              onClick={() => setShowConfirmLogout(true)}
              className="flex flex-col items-center text-green-700 hover:text-green-900 p-1 rounded"
            >
              <FiLogOut className="text-xl" />
              <div className="text-xs font-bold">Logout</div>
            </button>
          </div>
        </div>
      )}

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
