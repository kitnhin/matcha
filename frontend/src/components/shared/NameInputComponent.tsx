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
  setUsername, setFirstName, setLastName, username, first_name, last_name
}) => {
  

  return (
    <>
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">Username</label>
        <input
          type="text"
          onChange={(e) => {
            setUsername(e.target.value);
          }}
          className="rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          value={username}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">First name</label>
        <input
          type="text"
          onChange={(e) => {
            setFirstName(e.target.value);
          }}
          className="rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          value={first_name}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">Last name</label>
        <input
          type="text"
          onChange={(e) => {
            setLastName(e.target.value);
          }}
          className="rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          value={last_name}
        />
      </div>
    </>
  );
};

export default NameInputComponent;
