import { useEffect, useState } from "react";
import "../App.css";
import { Outlet } from "react-router-dom";
import WS from "../class/ws";
import NotifComponent from "../components/NotifComponent";

const MainLayout: React.FC = () => {
  const [notif, setNotif] = useState<string>("");
  const [showNotif, setShowNotif] = useState<boolean>(false);

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
    </>
  );
};

export default MainLayout;
