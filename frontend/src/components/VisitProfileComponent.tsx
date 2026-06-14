import { useEffect, useState } from "react";
import "../App.css";
import { useNavigate, useSearchParams } from "react-router-dom";
import WS from "../class/ws";
import defaultPfp from "../assets/default_pfp.jpg";

interface VisitProfileComponentProps {}

interface ProfileData {
  profileId: string;
  username: string;
  firstName: string;
  lastName: string;
  gender: string;
  sexualPreference: string;
  biography: string;
  fame: number;
  location: string;
  profilePic: string;
  age: number;
  extraPics: string[];
  tags: string[];
  isUser: boolean;
}

const VisitProfileComponent: React.FC<VisitProfileComponentProps> = ({}) => {
  const navigate = useNavigate();

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [queries, _] = useSearchParams();
  const profileId = queries.get("profile-id");
  const [likeStatus, setLikeStatus] = useState<boolean>(false);
  const [likeErrorMessage, setLikeErrorMessage] = useState<string>("");

  useEffect(() => {
    WS.setup();

    WS.add_callback("getProfile", (data) => {
      const { type, status, ...profileData } = data;
      setProfile(profileData);
    });

    WS.add_callback("likeProfileStatus", (data) => {
      if (data.status === "success") {
        setLikeStatus(data.likeStatus);
      } else {
        setLikeErrorMessage(data.errorMessage);
      }
    });

    WS.send({ type: "get_profile_info", profile_id: profileId });
  }, []);

  function handleLike(newLikeStatus: boolean) {
    WS.send({
      type: "like_profile",
      like_status: newLikeStatus,
      profile_id: profileId,
    });
  }

  return (
    <>
      <div className="flex flex-col items-center justify-center  min-h-screen bg-gray-100">
        <div className="w-full max-w-sm rounded-xl border border-gray-200 bg-white p-6">
          {/* <h1 className="mb-6 text-center text-2xl font-bold text-gray-800">
            {profile ? `${profile.username}'s profile` : "Loading..."}
          </h1> */}

          {profile && (
            <>
              <div className="flex gap-4 items-center">
                <img
                  src={
                    profile.profilePic
                      ? `data:image/jpeg;base64,${profile.profilePic}`
                      : defaultPfp
                  }
                  alt="profile"
                  className="w-12 h-12 rounded-full object-cover"
                />

                <h1 className="mb-6 text-center text-2xl font-bold text-gray-800">
                  {profile.username}'s profile
                </h1>
              </div>
              <div className="flex flex-col gap-2">
                <p>{`First Name: ${profile.firstName}`}</p>
                <p>{`Last Name: ${profile.lastName}`}</p>
                <p>{`Age: ${profile.age}`}</p>
                {profile.tags.length > 0 && (
                  <>
                    <div className="flex gap-2">
                      <p>Tags: </p>
                      {profile.tags.map((tag, i) => (
                        <div
                          key={i}
                          className="px-2 py-1 bg-grey-200 rounded border text-sm"
                        >
                          {tag}
                        </div>
                      ))}
                    </div>
                  </>
                )}
                <p>{`Gender: ${profile.gender}`}</p>
                <p>{`Sexual preference: ${profile.sexualPreference}`}</p>
                <p>{`Biography: ${
                  profile.biography ? profile.biography : "-"
                }`}</p>
                <p>{`Fame: ${profile.fame}`}</p>
                <p>{`Location: ${profile.location}`}</p>
                {profile.extraPics.length > 0 && (
                  <>
                    <p>Extra pics:</p>
                    <div className="flex gap-4">
                      {profile.extraPics.map((pic, i) => (
                        <img
                          key={i}
                          src={`data:image/jpeg;base64,${pic}`}
                          alt={`extra-pic-${i}`}
                          className="w-15 h-15 rounded object-cover"
                        />
                      ))}
                    </div>
                  </>
                )}
                {likeErrorMessage && (
                  <p className="text-red-500 text-sm">{likeErrorMessage}</p>
                )}

                <button
                  onClick={() => handleLike(!likeStatus)}
                  className={`text-2xl border rounded ${
                    likeStatus ? "text-red-500" : "text-gray-300"
                  }`}
                >
                  ♥
                </button>
              </div>
            </>
          )}
        </div>
        <button onClick={() => navigate("/browse")} className="text-xl">
          ← Back
        </button>
      </div>
    </>
  );
};

export default VisitProfileComponent;
