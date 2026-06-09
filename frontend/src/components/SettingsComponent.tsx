import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TagsComponent from "./shared/TagsComponent";
import LocationComponent, { type Location } from "./shared/LocationComponent";
import PicsComponent from "./shared/PicsComponent";
import WS from "../class/ws";
import BasicInfoComponent from "./shared/BasicInfoComponent";
import NameInputComponent from "./shared/NameInputComponent";

interface SettingsProps {}

const SettingsComponent: React.FC<SettingsProps> = ({}) => {
  // register stuffs
  const [email, setEmail] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");

  //profile setup stuffs
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
  const [successMessage, setSuccessMessage] = useState<string>("");

  const navigate = useNavigate();

  function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

    // create form data to send to backend
    let formData = new FormData();
    formData.append("email", email);
    formData.append("username", username);
    formData.append("first_name", firstName);
    formData.append("last_name", lastName);

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

    fetch(`${BACKEND_URL}/settings/save`, {
      method: "POST",
      credentials: "include",
      body: formData,
    })
      .then((response: Response) => response.json())
      .then((data: { saveSettingsStatus: string; errorMessage: string }) => {
        console.log("WEEE", data);
        if (data.saveSettingsStatus === "success") {
          setSuccessMessage("Successfully updated profile");
          setErrorMessage("");
        } else {
          setErrorMessage(data.errorMessage);
          setSuccessMessage("");
        }
      });
  }

  useEffect(() => {
    WS.setup();

    WS.add_callback("userSettingsData", (message) => {
      setEmail(message.email);
      setUsername(message.username);
      setFirstName(message.first_name);
      setLastName(message.last_name);

      setGender(message.gender);
      setSexualPreference(message.sexual_preference);
      setAge(message.age);
      setBio(message.bio);
      setSelectedTags(message.tags);

      setProfilePic(message.profile_pic);
      setExtraPics(message.extra_pics || []);

      setSelectedLocation({
        place_name: message.location,
        latitude: message.latitude,
        longitude: message.longitude,
      });
    });

    WS.send({ type: "get_user_settings_data" });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-sm rounded-xl border border-gray-200 bg-white p-6 shadow-lg">
        <h1 className="mb-6 text-center text-2xl font-bold text-gray-800">
          Settings
        </h1>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>

          {/* Email */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Email</label>
            <input
              type="text"
              onChange={(e) => {
                setEmail(e.target.value);
              }}
              className="rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              value={email}
            />
          </div>

          {/* Name Inputs */}
          <NameInputComponent
            setUsername={setUsername}
            setFirstName={setFirstName}
            setLastName={setLastName}
            username={username}
            first_name={firstName}
            last_name={lastName}
          />

          {/* Basic Info */}
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
            <p className="text-center text-sm text-red-600">{errorMessage}</p>
          )}

          {successMessage && (
            <p className="text-center text-sm text-green-600">
              {successMessage}
            </p>
          )}

          <button
            type="submit"
            className="mt-4 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          >
            Save
          </button>

          <button
            type="button"
            className="rounded-md border border-blue-600 px-4 py-2 font-medium text-blue-600 hover:bg-blue-50"
            onClick={() => {
              navigate("/home");
            }}
          >
            Close
          </button>

        </form>
      </div>
    </div>
  );
};

export default SettingsComponent;
