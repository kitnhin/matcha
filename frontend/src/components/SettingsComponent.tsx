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

  const resetStatus = useRef<boolean>(false);

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
    // WS.setup();

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

      if (resetStatus.current) {
        setSuccessMessage("Settings reset successfully!");
        setErrorMessage("");
      }
    });

    WS.add_callback("saveSettingsStatus", (message) => {
      if (message.status === "success") {
        setSuccessMessage("Settings saved successfully!");
        setErrorMessage("");
      } else {
        setErrorMessage(message.errorMessage);
        setSuccessMessage("");
      }
    });

    WS.send({ type: "get_user_settings_data" });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-100 pb-16">
      <div className="w-full max-w-sm rounded-3xl border-2 border-green-600 bg-white p-8 shadow-xl">
        <div className="mb-6 text-center">
          <p className="text-4xl">🍵</p>
          <h1 className="text-3xl font-bold text-green-800">Settings</h1>
        </div>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          {/* Email */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-bold text-green-800">Email</label>
            <input
              type="text"
              onChange={(e) => {
                setEmail(e.target.value);
              }}
              className="rounded-xl border-2 border-green-600 bg-green-50 px-3 py-2 text-green-900 outline-none focus:border-green-500"
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
            <p className="rounded-lg bg-red-50 px-3 py-2 text-center text-sm text-red-600">
              {errorMessage}
            </p>
          )}

          {successMessage && (
            <p className="rounded-lg bg-green-50 px-3 py-2 text-center text-sm text-green-600">
              {successMessage}
            </p>
          )}

          <button
            type="submit"
            className="mt-2 rounded-2xl bg-green-700 px-4 py-2 font-bold text-white hover:bg-green-800"
          >
            Save
          </button>

          <button
            type="button"
            className="rounded-2xl border-2 border-green-600 px-4 py-2 font-bold text-green-800 hover:bg-green-50"
            onClick={() => {
              resetStatus.current = true;
              WS.send({ type: "get_user_settings_data" });
            }}
          >
            Reset changes
          </button>
        </form>
      </div>
    </div>
  );
};

export default SettingsComponent;
