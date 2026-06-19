import { useEffect, useState } from "react";
import "../App.css";
import WS from "../class/ws";
import defaultPfp from "../assets/default_pfp.jpg";
import { FiAlertTriangle, FiUserX } from "react-icons/fi";

interface ConfirmBlockComponent {
  setShowConfirmation: React.Dispatch<React.SetStateAction<boolean>>;
  setShowProfile: React.Dispatch<React.SetStateAction<boolean>>;
  setBlockErrorMessage: React.Dispatch<React.SetStateAction<string>>;
  profile_id: number;
}

const ConfirmBlockComponent: React.FC<ConfirmBlockComponent> = ({
  setShowConfirmation,
  setShowProfile,
  setBlockErrorMessage,
  profile_id,
}) => {

    useEffect(() => {
        WS.add_callback("blockProfileStatus", (data) => {
            if (data.status === "success") {
                setShowProfile(false);
            } else {
                setBlockErrorMessage(data.errorMessage);
            }
            setShowConfirmation(false);
        })
    }, [])

  function handleYes() {
    WS.send({ type: "block_profile", profile_id: profile_id });
  }

  return (
    <>
      <div className="fixed inset-0 flex flex-col items-center justify-center min-h-screen bg-black/50 backdrop-blur-sm">
        <div className="w-full max-w-sm rounded-xl border border-gray-200 bg-white p-6 flex flex-col items-center justify-center">
          <h1 className="text-center">Are you sure you want to block this user? (This action cannot be undone)</h1>
          <div className="flex gap-4 mt-4 w-full justify-center items-center">
            <button
              className="bg-green-500 text-white rounded w-15 p-1"
              onClick={() => handleYes()}
            >
              Yes
            </button>
            <button
              className="bg-red-500 text-white rounded w-15 p-1"
              onClick={() => setShowConfirmation(false)}
            >
              No
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ConfirmBlockComponent;
