import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TagsComponent from "./shared/TagsComponent";
import LocationComponent, { type Location } from "./shared/LocationComponent";
import PicsComponent from "./shared/PicsComponent";
import BasicInfoComponent from "./shared/BasicInfoComponent";

interface ProfileSetupProps {
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
}

const ProfileSetupComponent: React.FC<ProfileSetupProps> = ({
  setIsLoggedIn,
}) => {
  const navigate = useNavigate();

  const [gender, setGender] = useState<string>("");
  const [sexualPreference, setSexualPreference] = useState<string>("");
  const [age, setAge] = useState<string>("");
  const [bio, setBio] = useState<string>("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null
  );
  const [profilePic, setProfilePic] = useState<File | string | null>(null);
  const [extraPics, setExtraPics] = useState<(File | string | null)[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>("");

  function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

    // create form data to send to backend
    let formData = new FormData();
    formData.append("gender", gender);
    formData.append("sexual_preference", sexualPreference);
    formData.append("age", age);
    formData.append("bio", bio);
    for (let i = 0; i < selectedTags.length; i++) {
      formData.append("tags", selectedTags[i]);
    }
    formData.append(
      "location",
      selectedLocation ? selectedLocation.place_name : ""
    );
    formData.append(
      "longitude",
      selectedLocation ? selectedLocation.longitude.toString() : "0"
    );
    formData.append(
      "latitude",
      selectedLocation ? selectedLocation.latitude.toString() : "0"
    );
    if (profilePic) {
      formData.append("profile_pic", profilePic);
    }
    for (let i = 0; i < extraPics.length; i++) {
      if (extraPics[i]) {
        formData.append("extra_pics", extraPics[i] as File);
      }
    }

    fetch(`${BACKEND_URL}/auth/setup`, {
      method: "POST",
      credentials: "include",
      body: formData,
    })
      .then((response: Response) => response.json())
      .then((data: { setupStatus: string; errorMessage: string }) => {
        if (data.setupStatus === "success") {
          setIsLoggedIn(true);
          navigate("/home");
        } else {
          setErrorMessage(data.errorMessage);
        }
      });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-100">
      <div className="w-full max-w-sm rounded-3xl border-2 border-green-600 bg-white p-8 shadow-xl">
        <div className="mb-6 text-center">
          <p className="text-4xl">🍵</p>
          <h1 className="text-3xl font-extrabold text-green-800">
            Profile setup
          </h1>
        </div>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          {/* Basic info */}
          <BasicInfoComponent
            setGender={setGender}
            setSexualPreference={setSexualPreference}
            setAge={setAge}
            setBio={setBio}
            gender={gender}
            sexualPreference={sexualPreference}
            age={age}
            bio={bio}
          />

          {/* Tags block */}
          <TagsComponent
            selectedTags={selectedTags}
            setSelectedTags={setSelectedTags}
          />

          {/* Location block */}
          <LocationComponent
            selectedLocation={selectedLocation}
            setSelectedLocation={setSelectedLocation}
          />

          {/* Pics block */}
          <PicsComponent
            profilePic={profilePic}
            setProfilePic={setProfilePic}
            extraPics={extraPics}
            setExtraPics={setExtraPics}
            setErrorMessage={setErrorMessage}
          />

          {errorMessage && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-center text-sm text-red-600">{errorMessage}</p>
          )}

          <button
            type="submit"
            className="mt-2 rounded-2xl bg-green-700 px-4 py-2 font-bold text-white hover:bg-green-800"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}

export default ProfileSetupComponent;