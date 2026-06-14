import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TagsComponent from "./shared/TagsComponent";
import LocationComponent, { type Location } from "./shared/LocationComponent";
import PicsComponent from "./shared/PicsComponent";
import WS from "../class/ws";
import BasicInfoComponent from "./shared/BasicInfoComponent";
import NameInputComponent from "./shared/NameInputComponent";
import { picToBase64 } from "../utils/auth.ts";

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

  async function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    // convert profile pic to base64 if it's a File
    let pfpBase64 = profilePic;
    if (profilePic instanceof File) {
        pfpBase64 = await picToBase64(profilePic);
    }

    // convert extra pics to base64
    const picsBase64 = [];
    for (const pic of extraPics) {
        if (pic instanceof File) {
            picsBase64.push(await picToBase64(pic));
        } else if (pic) {
            picsBase64.push(pic);
        }
    }

    WS.send({
        type: "save_settings",
        email,
        username,
        first_name: firstName,
        last_name: lastName,
        gender,
        sexual_preference: sexualPreference,
        age,
        bio,
        tags: selectedTags,
        location: selectedLocation ? selectedLocation.place_name : "",
        latitude: selectedLocation ? selectedLocation.latitude : 0,
        longitude: selectedLocation ? selectedLocation.longitude : 0,
        profile_pic: pfpBase64 || null,
        extra_pics: picsBase64,
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

    WS.add_callback("saveSettingsStatus", (message) => {
        if(message.status === "success") {
            setSuccessMessage("Settings saved successfully!");
            setErrorMessage("");
        }
        else {
            setErrorMessage(message.errorMessage);
            setSuccessMessage("");
        }
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
