import { useState } from "react";
import "../../App.css";

interface BasicInfoComponentProps {
  setGender: React.Dispatch<React.SetStateAction<string>>;
  setSexualPreference: React.Dispatch<React.SetStateAction<string>>;
  setAge: React.Dispatch<React.SetStateAction<string>>;
  setBio: React.Dispatch<React.SetStateAction<string>>;
  gender: string;
  sexualPreference: string;
  age: string;
  bio: string;
}

const BasicInfoComponent: React.FC<BasicInfoComponentProps> = ({
  setGender,
  setSexualPreference,
  setAge,
  setBio,
  gender,
  sexualPreference,
  age,
  bio,
}) => {
  return (
    <>
      {/* Gender block */}
      <div className="flex flex-col gap-2">
        <label className="text-xl font-medium text-gray-700">Gender</label>
        <select
          className="rounded-md border px-2 py-1"
          onChange={(e) => setGender(e.target.value)}
          value={gender}
        >
          <option value="">Please select a gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="others">Others</option>
        </select>
      </div>

      {/* Sexual pref block */}
      <div className="flex flex-col gap-2">
        <label className="text-xl font-medium text-gray-700">
          Sexual Preference
        </label>
        <select
          className="rounded-md border px-2 py-1"
          onChange={(e) => setSexualPreference(e.target.value)}
          value={sexualPreference}
        >
          <option value="">Please select a sexual preference</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="others">Others</option>
        </select>
      </div>

      {/* Age block */}
      <div className="flex flex-col gap-2">
        <label className="text-xl font-medium text-gray-700">Age</label>
        <input
          type="text"
          className="rounded-md border px-2 py-1 w-full pr-24"
          onChange={(e) => {
            setAge(e.target.value);
          }}
          value={age}
        />
      </div>

      {/* Bio block */}
      <div className="flex flex-col gap-2">
        <label className="text-xl font-medium text-gray-700">Bio</label>
        <input
          type="text"
          className="rounded-md border px-2 py-1 w-full pr-24"
          onChange={(e) => {
            setBio(e.target.value);
          }}
          value={bio}
        />
      </div>
    </>
  );
};

export default BasicInfoComponent;
