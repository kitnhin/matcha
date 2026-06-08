import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface ProfileSetupProps {
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
}

const ProfileSetupComponent: React.FC<ProfileSetupProps> = ({
  setIsLoggedIn,
}) => {
  const navigate = useNavigate();
  //basics
  const [gender, setGender] = useState<string>("");
  const [sexualPreference, setSexualPreference] = useState<string>("");
  const AVAILABLE_TAGS = [
    "vegan",
    "geek",
    "piercing",
    "gaming",
    "anime",
    "sports",
  ];
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  //location
  const [locationQuery, setLocationQuery] = useState<string>("");
  const [locationRes, setLocationRes] = useState<any[]>([]);
  const [showLocationRes, setShowLocationRes] = useState<boolean>(false);
  const [selectedLocation, setSelectedLocation] = useState<{
    place_name: string;
    latitude: number;
    longitude: number;
  } | null>(null);
  const locationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  //pics
  const [profilePic, setProfilePic] = useState<File | null>(null);
  const [extraPics, setExtraPics] = useState<(File | null)[]>([]);
  const pfpInputRef = useRef<HTMLInputElement>(null);
  const extraPicsInputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  const [errorMessage, setErrorMessage] = useState<string>("");

  function toggleTag(tag: string) {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  }

  function handlePfpChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];

      //max file size
      const max_file_size = 5 * 1024 * 1024;
      if (file.size > max_file_size) {
        setErrorMessage("File size exceeds the 5MB limit.");
        return;
      }
      setProfilePic(file);
    }
  }

  function deletePfp() {
    setProfilePic(null);
    if (pfpInputRef.current) {
      pfpInputRef.current.value = "";
    }
  }

  function handleExtraPicChange(
    event: React.ChangeEvent<HTMLInputElement>,
    i: number
  ) {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];

      //max file size
      const max_file_size = 5 * 1024 * 1024;
      if (file.size > max_file_size) {
        setErrorMessage("File size exceeds the 5MB limit.");
        return;
      }

      const newExtraPics = [...extraPics];
      newExtraPics[i] = file;
      setExtraPics(newExtraPics);
    }
  }

  function deleteExtraPic(i: number) {
    const newExtraPics = [...extraPics];
    newExtraPics[i] = null;
    setExtraPics(newExtraPics);
  }

  function handleLocationInputChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const inputPlace = event.target.value;
    setLocationQuery(inputPlace);

    if (locationTimerRef.current) {
      clearTimeout(locationTimerRef.current);
    }

    if (inputPlace.length < 3) {
      setLocationRes([]);
      setShowLocationRes(false);
      return;
    }

    //everytime whenever the user wait for abit after typing, then only call api
    locationTimerRef.current = setTimeout(() => {
      try {
        fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
            inputPlace
          )}&format=json`,
          { headers: { "User-Agent": "42-Matcha" } }
        )
          .then((response: Response) => response.json())
          .then((data: any) => {
            setLocationRes(data);
            setShowLocationRes(true);
            console.log(data);
          });
      } catch (error: any) {
        console.log("Nominatim error: ", error);
      }
    }, 300);
  }

  function handleSelectedLocation(place: any) {
    setLocationQuery(place.display_name);
    setSelectedLocation({
      place_name: place.display_name,
      latitude: parseFloat(place.lat),
      longitude: parseFloat(place.lon),
    });
    setShowLocationRes(false);
  }

  function handleAutoLocation() {
    navigator.geolocation.getCurrentPosition((position) => {
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;

      try {
        fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
          { headers: { "User-Agent": "42-Matcha" } }
        )
          .then((response: Response) => response.json())
          .then((data: any) => {
            setSelectedLocation({
              place_name: `${data.address.city_district}, ${data.address.city}, ${data.address.state} , ${data.address.country}`,
              latitude: latitude,
              longitude: longitude,
            });
            console.log("auto", data);
          });
      } catch (error: any) {
        console.log("Nominatim error: ", error);
      }
    });
  }

  function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

    // create form data to send to backend
    let formData = new FormData();
    formData.append("gender", gender)
    formData.append("sexual_preference", sexualPreference)
    for (let i = 0; i < selectedTags.length; i++) {
      formData.append('tags', selectedTags[i]);
    }
    formData.append("location", selectedLocation ? selectedLocation.place_name : "")
    formData.append("longitude", selectedLocation ? selectedLocation.longitude.toString() : "0")
    formData.append("latitude", selectedLocation ? selectedLocation.latitude.toString() : "0")
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
      body: formData
    })
      .then((response: Response) => response.json())
      .then((data: { loginStatus: string, errorMessage: string}) => {
        if (data.loginStatus === "success") {
          setIsLoggedIn(true);
          navigate("/home");
        }
        else {
          setErrorMessage(data.errorMessage);
        }
      });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-sm rounded-xl border border-gray-200 bg-white p-6 shadow-lg">
        <h1 className="mb-6 text-center text-2xl font-bold text-gray-800">
          Profile setup
        </h1>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          {/* Gender block */}
          <div className="flex flex-col gap-2">
            <label className="text-xl font-medium text-gray-700">Gender</label>
            <select
              className="rounded-md border px-2 py-1"
              onChange={(e) => setGender(e.target.value)}
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
            >
              <option value="">Please select a sexual preference</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="others">Others</option>
            </select>
          </div>

          {/* Tags block */}
          <div className="flex flex-col gap-2">
            <label className="text-xl font-medium text-gray-700">Tags</label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_TAGS.map((tag) => {
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`rounded-md border px-3 py-1 text-sm ${
                      selectedTags.includes(tag)
                        ? "bg-gray-500 text-white"
                        : "bg-white"
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Location block */}
          <div className="flex flex-col gap-2">
            <label className="text-xl font-medium text-gray-700">
              Choose your location
            </label>

            <div className="relative">
              <input
                type="text"
                className="rounded-md border px-2 py-1 w-full pr-24"
                onChange={(e) => {
                  handleLocationInputChange(e);
                }}
                value={locationQuery}
              />
              <button
                type="button"
                className="absolute right-1 top-1/2 -translate-y-1/2 text-xs text-blue-500 hover:text-blue-700 px-2 py-0.5 rounded-md bg-blue-50 hover:bg-blue-100"
                onClick={() => {
                  handleAutoLocation();
                }}
              >
                Use current location
              </button>
              {showLocationRes && (
                <ul className="absolute left-0 right-0 top-full z-10 max-h-30 overflow-y-auto rounded-md border bg-white shadow-md">
                  {locationRes.map((place, i) => {
                    return (
                      <li
                        key={i}
                        onClick={() => handleSelectedLocation(place)}
                        className="px-2 py-1 cursor-pointer hover:bg-gray-100 text-sm border-b last:border-b-0"
                      >
                        {place.display_name.length > 40
                          ? place.display_name.substring(0, 40) + "..."
                          : place.display_name}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
            <p className="text-sm text-gray-500">
              Selected location:{" "}
              {selectedLocation
                ? `${selectedLocation.place_name} (${selectedLocation.latitude}, ${selectedLocation.longitude})`
                : "None"}
            </p>
          </div>

          {/* Pfp block */}
          <div className="flex flex-col gap-2">
            <label className="text-xl font-medium text-gray-700">
              Profile Picture
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handlePfpChange}
              className="hidden"
              ref={pfpInputRef}
            />
            {profilePic ? (
              <div className="w-full flex flex-col items-center gap-1">
                <img
                  className="object-cover w-16 h-16 rounded-md border cursor-pointer"
                  src={profilePic ? URL.createObjectURL(profilePic) : ""}
                  alt="+"
                  onClick={() => {
                    if (pfpInputRef.current) {
                      pfpInputRef.current.click();
                    }
                  }}
                />
                <button className="text-sm text-red-500" onClick={deletePfp}>
                  Delete
                </button>
              </div>
            ) : (
              <div className="w-full flex flex-col items-center">
                <div
                  className="w-16 h-16 rounded-md border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer text-gray-400 text-xl"
                  onClick={() => {
                    if (pfpInputRef.current) {
                      pfpInputRef.current.click();
                    }
                  }}
                >
                  +
                </div>
              </div>
            )}
          </div>

          {/* Extra pics block */}
          <div className="flex flex-col gap-2">
            <label className="text-xl font-medium text-gray-700">
              Extra pictures
            </label>

            <div className="flex w-full gap-2">
              {[0, 1, 2, 3].map((i) => {
                return (
                  <div
                    key={i}
                    className="flex flex-col items-center w-1/4 gap-1"
                  >
                    <input
                      key={i}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      ref={extraPicsInputRefs[i]}
                      onChange={(e) => handleExtraPicChange(e, i)}
                    />
                    {extraPics[i] ? (
                      <>
                        <img
                          className="object-cover w-16 h-16 rounded-md border cursor-pointer"
                          src={URL.createObjectURL(extraPics[i])}
                          alt="+"
                          onClick={() => {
                            if (extraPicsInputRefs[i].current) {
                              extraPicsInputRefs[i].current.click();
                            }
                          }}
                        />
                        <button
                          className="text-sm text-red-500"
                          onClick={() => deleteExtraPic(i)}
                        >
                          Delete
                        </button>
                      </>
                    ) : (
                      <div
                        className="w-16 h-16 rounded-md border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer text-gray-400 text-xl"
                        onClick={() => {
                          if (extraPicsInputRefs[i].current) {
                            extraPicsInputRefs[i].current.click();
                          }
                        }}
                      >
                        +
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {errorMessage && (
            <p className="text-center text-sm text-red-600">{errorMessage}</p>
          )}

          <button
            type="submit"
            className="mt-4 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileSetupComponent;
