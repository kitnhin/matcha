import { useState, useEffect } from "react";
import "../App.css";
import WS from "../class/ws";
import defaultPfp from "../assets/default_pfp.jpg";
import { useNavigate } from "react-router-dom";

interface Profile {
  profile_link: string;
  username: string;
  age: number;
  location: string;
  common_tags: number;
  profile_pic: string;
  fame: number;
}

interface ProfileCardComponentProps {
  profile: Profile;
}

const ProfileCardComponent: React.FC<ProfileCardComponentProps> = ({
  profile,
}) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/profile/${profile.profile_link}`)}
      className="mb-2 max-w-xs p-4"
    >
      <img
        src={
          profile.profile_pic
            ? `data:image/jpeg;base64,${profile.profile_pic}`
            : defaultPfp
        }
        alt={profile.username}
        className="w-full aspect-square object-cover rounded-3xl"
      />
      <div className="p-3">
        <div className="flex items-center justify-between">
          <span className="font-semibold">
            {profile.username}, {profile.age}
          </span>
          <span className="text-orange-500 text-sm">🔥 {profile.fame}</span>
        </div>
        <p className="text-sm text-gray-400 mt-1">{profile.location}</p>
        <p className="text-xs text-gray-500 mt-1">
          {profile.common_tags} common tags
        </p>
      </div>
    </div>
  );
};

interface BrowseComponentProps {}

const BrowseComponent: React.FC<BrowseComponentProps> = ({}) => {
  const navigate = useNavigate();

  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [showSort, setShowSort] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>("default");
  const [reverse, setReverse] = useState<boolean>(false);

  useEffect(() => {
    WS.setup();
    WS.send({ type: "get_browse_data" });
    WS.add_callback("browseData", (message) => {
      setProfiles(message.profiles);
      console.log(message);
    });
  }, []);

  const sorted = [...profiles].sort((a, b) => {
    //function shud be negative if a comes before b
    if (sortBy === "Age") return a.age - b.age;
    if (sortBy === "Fame") return a.fame - b.fame;
    if (sortBy === "Common Tags") return a.common_tags - b.common_tags;
    if (sortBy === "Location") return a.location.localeCompare(b.location); //similar to strcmp in c
    return 0; // not sorting
  });

  if (reverse) sorted.reverse();

  const col1 = sorted.filter((_, i) => i % 2 == 0);
  const col2 = sorted.filter((_, i) => i % 2 == 1);

  return (
    <div className="min-w-screen h-screen flex flex-col items-center overflow-hidden">
      <div className="flex min-w-screen border items-center justify-center p-4">
        <button
          onClick={() => navigate("/home")}
          className="absolute left-4 text-sm"
        >
          ← Back
        </button>
        <h1 className="text-2xl font-bold">Browse</h1>

        {/* Sorting stuff */}
        <div className="absolute right-4">
          <button
            onClick={() => {
              setShowSort(true);
            }}
            className="right-4 text-xl"
          >
            Sort by: {sortBy || "None"}
          </button>

          {showSort && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowSort(false)}
              />
              <div className="absolute flex flex-col right-0 mt-1 rounded border z-20">
                {["Default", "Age", "Fame", "Common Tags", "Location"].map(
                  (option) => (
                    <button
                      key={option}
                      onClick={() => {
                        setSortBy(option);
                        setShowSort(false);
                      }}
                      className="text-left px-4 py-2 text-sm"
                    >
                      {option}
                    </button>
                  )
                )}
                <button
                  onClick={() => setReverse(!reverse)}
                  className="block w-full text-left px-4 py-2 text-sm"
                >
                  Reverse
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      <div className="max-w-xl flex gap-3 overflow-y-auto flex-1 px-4 pb-4">
        <div className="flex flex-col">
          {col1.map((profile) => (
            <ProfileCardComponent key={profile.username} profile={profile} />
          ))}
        </div>
        <div className="flex flex-col">
          {col2.map((profile) => (
            <ProfileCardComponent key={profile.username} profile={profile} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default BrowseComponent;
