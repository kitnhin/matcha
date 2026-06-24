import "../App.css";
import { handleLogout } from "../utils/auth";
import { useNavigate } from "react-router-dom";

interface ConfirmLogoutComponent {
  setShowConfirmLogout: React.Dispatch<React.SetStateAction<boolean>>;
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
}

const ConfirmLogoutComponent: React.FC<ConfirmLogoutComponent> = ({
  setShowConfirmLogout,
  setIsLoggedIn,
}) => {
  const navigate = useNavigate();

  function handleYes() {
    handleLogout(setIsLoggedIn);
    navigate("/login");
  }

  return (
    <>
      <div
        className="fixed inset-0 flex flex-col items-center justify-center min-h-screen backdrop-blur-sm"
        onClick={() => setShowConfirmLogout(false)}
      >
        <div className="w-full max-w-sm rounded-xl border-3 border-green-600 bg-white p-6 flex flex-col items-center justify-center">
          <h1 className="text-center text-green-800 font-semibold">Are you sure you want to logout?</h1>
          <div className="flex gap-4 mt-4 w-full justify-center items-center">
            <button
              className="bg-green-600 text-white rounded w-15 p-1"
              onClick={() => handleYes()}
            >
              Yes
            </button>
            <button
              className="bg-red-500 text-white rounded w-15 p-1"
              onClick={() => setShowConfirmLogout(false)}
            >
              No
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ConfirmLogoutComponent;
