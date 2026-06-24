import { useState } from "react";
import "../../App.css";

interface NameInputComponentProps {
  setUsername: React.Dispatch<React.SetStateAction<string>>;
  setFirstName: React.Dispatch<React.SetStateAction<string>>;
  setLastName: React.Dispatch<React.SetStateAction<string>>;
  username: string;
  first_name: string;
  last_name: string;
}

const NameInputComponent: React.FC<NameInputComponentProps> = ({
  setUsername,
  setFirstName,
  setLastName,
  username,
  first_name,
  last_name,
}) => {
  return (
    <>
      <div className="flex flex-col gap-1">
        <label className="text-sm font-bold text-green-800">Username</label>
        <input
          type="text"
          onChange={(e) => {
            setUsername(e.target.value);
          }}
          className="rounded-xl border-2 border-green-600 bg-green-50 px-3 py-2 text-green-900 outline-none focus:border-green-500"
          value={username}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-bold text-green-800">First name</label>
        <input
          type="text"
          onChange={(e) => {
            setFirstName(e.target.value);
          }}
          className="rounded-xl border-2 border-green-600 bg-green-50 px-3 py-2 text-green-900 outline-none focus:border-green-500"
          value={first_name}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-bold text-green-800">Last name</label>
        <input
          type="text"
          onChange={(e) => {
            setLastName(e.target.value);
          }}
          className="rounded-xl border-2 border-green-600 bg-green-50 px-3 py-2 text-green-900 outline-none focus:border-green-500"
          value={last_name}
        />
      </div>
    </>
  );
};

export default NameInputComponent;
