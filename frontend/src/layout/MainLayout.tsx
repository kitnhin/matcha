import { useEffect, useState } from "react";
import "../App.css";
import { Outlet } from "react-router-dom";
import WS from "../class/ws";
import NotifComponent from "../components/NotifComponent";
import { FiLogOut } from "react-icons/fi";
import { handleLogout } from "../utils/auth";
import { useNavigate } from "react-router-dom";
import ConfirmLogoutComponent from "../components/ConfirmLogoutComponent";

interface MainLayoutProps {
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
}

const MainLayout: React.FC<MainLayoutProps> = ({ setIsLoggedIn }) => {
  const [notif, setNotif] = useState<string>("");
  const [showNotif, setShowNotif] = useState<boolean>(false);
  const [showConfirmLogout, setShowConfirmLogout] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    // WS.setup();

    WS.add_callback("notif", (data) => {
      if (WS.openChat !== data.senderUsername) {
        setNotif(data.message);
        setShowNotif(true);
      }
    });
  }, []);

  return (
    <>
      <Outlet />
      {showNotif && (
        <NotifComponent message={notif} setShowNotif={setShowNotif} />
      )}
      <button
        onClick={() => {
          setShowConfirmLogout(true);
        }}
        className="flex flex-col justify-center items-center fixed bottom-4 right-4 w-10 h-10 p-2 rounded border text-red-500 hover:text-red-700"
      >
        <FiLogOut className="w-10 h-10" />
      </button>
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
