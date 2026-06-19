import { useEffect, useState } from "react";
import "../App.css";
import WS from "../class/ws";
import defaultPfp from "../assets/default_pfp.jpg";
import { FiAlertTriangle, FiUserX } from "react-icons/fi";
import ConfirmBlockComponent from "./ConfirmBlockComponent";

interface VisitProfileComponentProps {
  profileId: number;
  setShowProfile: React.Dispatch<React.SetStateAction<boolean>>;
}

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
  onlineStatus: string;
  isUser: boolean;
  likedBy: string[];
  viewedBy: string[];
}

const VisitProfileComponent: React.FC<VisitProfileComponentProps> = ({
  profileId,
  setShowProfile,
}) => {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [likeStatus, setLikeStatus] = useState<boolean>(false);
  const [connectedStatus, setConnectedStatus] = useState<boolean>(false);
  const [reportStatus, setReportStatus] = useState<boolean>(false);
  const [likeErrorMessage, setLikeErrorMessage] = useState<string>("");
  const [reportErrorMessage, setReportErrorMessage] = useState<string>("");
  const [showBlockConfirm, setShowBlockConfirm] = useState<boolean>(false);
  const [blockErrorMessage, setBlockErrorMessage] = useState<string>("");

  useEffect(() => {
    // WS.setup();

    WS.add_callback("getProfile", (data) => {
      const { type, status, ...profileData } = data;
      setProfile(profileData);
      if (data.isLiked) {
        setLikeStatus(true);
      }
      if (data.isConnected) {
        setConnectedStatus(true);
      }

      if (data.isReported) {
        setReportStatus(true);
      }
    });

    WS.add_callback("likeProfileStatus", (data) => {
      if (data.status === "success") {
        setLikeStatus(data.likeStatus);
        setConnectedStatus(data.connectedStatus);
      } else {
        setLikeErrorMessage(data.errorMessage);
      }
    });

    WS.add_callback("reportProfileStatus", (data) => {
      if (data.status === "success") {
        setReportStatus(data.reportStatus);
      } else {
        setReportErrorMessage(data.errorMessage);
      }
    });

    WS.add_callback("updateIsConnected", (data) => {
      setConnectedStatus(data.isConnected);
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

  function handleReport() {
    WS.send({
      type: "report_profile",
      profile_id: profileId,
    });
  }

  return (
    <>
      <div className="fixed inset-0 flex flex-col items-center justify-center  min-h-screen bg-gray-100">
        <div className="w-full max-w-sm rounded-xl border border-gray-200 bg-white p-6 break-words">
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
                <div className="flex flex-col text-left">
                  <h1 className="text-2xl font-bold text-gray-800">
                    {profile.username}'s profile
                  </h1>
                  {profile.onlineStatus === "online" ? (
                    <p className="text-green-500 text-sm">Online</p>
                  ) : (
                    <p className="text-gray-500 text-sm">
                      Last online: {profile.onlineStatus}
                    </p>
                  )}
                </div>

                <div className="flex ml-auto gap-2">
                  {reportStatus ? (
                    <div className="flex flex-col ml-auto items-center justify-center text-gray-400">
                      <button>
                        <FiAlertTriangle className="w-5 h-5" />
                      </button>
                      <p className="text-xs">Reported</p>
                    </div>
                  ) : (
                    <div className="flex flex-col ml-auto items-center justify-center">
                      <button onClick={() => handleReport()}>
                        <FiAlertTriangle className="w-5 h-5" />
                      </button>
                      <p className="text-xs">Report</p>
                    </div>
                  )}

                  <div className="flex flex-col ml-auto items-center justify-center">
                    <button onClick={() => setShowBlockConfirm(true)}>
                      <FiUserX className="w-5 h-5" />
                    </button>
                    <p className="text-xs">Block</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2 mt-5">
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

                {/* Liked by */}
                {profile.likedBy && (
                  <div className="flex">
                    <p>Liked by: </p>
                    {profile.likedBy && profile.likedBy.length > 0 ? (
                      profile.likedBy.map((username, i) => (
                        <p key={i} className="ml-1">
                          {username}
                          {i !== profile.likedBy.length - 1 && ","}
                        </p>
                      ))
                    ) : (
                      <p className="ml-1">-</p>
                    )}
                  </div>
                )}

                {/* Viewed by */}
                {profile.viewedBy && (
                  <div className="flex">
                    <p>Viewed by: </p>
                    {profile.viewedBy && profile.viewedBy.length > 0 ? (
                      profile.viewedBy.map((username, i) => (
                        <p key={i} className="ml-1">
                          {username}
                          {i !== profile.viewedBy.length - 1 && ","}
                        </p>
                      ))
                    ) : (
                      <p className="ml-1">-</p>
                    )}
                  </div>
                )}

                {likeErrorMessage && (
                  <p className="text-red-500 text-sm">{likeErrorMessage}</p>
                )}
                {reportErrorMessage && (
                  <p className="text-red-500 text-sm">{reportErrorMessage}</p>
                )}
                {blockErrorMessage && (
                    <p className="text-red-500 text-sm">{blockErrorMessage}</p>
                )}

                <div className="flex flex-col gap-1 items-center">
                  <button
                    onClick={() => handleLike(!likeStatus)}
                    className={`text-2xl border rounded w-full ${
                      likeStatus ? "text-red-500" : "text-gray-300"
                    }`}
                  >
                    ♥
                  </button>
                  {connectedStatus && (
                    <p className="text-sm text-gray-500">(Connected)</p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
        <button onClick={() => setShowProfile(false)} className="text-xl">
          ← Back
        </button>

        {showBlockConfirm && (
          <ConfirmBlockComponent
            setShowConfirmation={setShowBlockConfirm}
            setShowProfile={setShowProfile}
            setBlockErrorMessage={setBlockErrorMessage}
            profile_id={profileId}
          />
        )}
      </div>
    </>
  );
};

export default VisitProfileComponent;
