import { useEffect, useState } from "react";
import "../App.css";
import WS from "../class/ws";
import defaultPfp from "../assets/default_pfp.jpg";
import { FiAlertTriangle, FiUserX, FiHeart, FiArrowLeft } from "react-icons/fi";
import { FaHeart } from "react-icons/fa";
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
  const [showBlockConfirm, setShowBlockConfirm] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

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
        setErrorMessage(data.errorMessage);
      }
    });

    WS.add_callback("reportProfileStatus", (data) => {
      if (data.status === "success") {
        setReportStatus(data.reportStatus);
      } else {
        setErrorMessage(data.errorMessage);
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
      <div className="fixed inset-0 flex flex-col items-center justify-center min-h-screen bg-green-100 pb-15 pt-10 overflow-y-auto">
        <div className="w-full max-w-sm">
          <div>
            <button
              className="flex items-center mt-2 text-green-600 hover:text-green-800 font-semibold text-lg"
              onClick={() => setShowProfile(false)}
            >
              <FiArrowLeft />
              <p>Back</p>
            </button>
          </div>
          <div className="w-full max-w-sm rounded-3xl border-2 border-green-600 bg-white p-5 break-words">
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
                    className="w-12 h-12 rounded-full object-cover border-2 border-green-600"
                  />
                  <div className="flex flex-col text-left">
                    <h1 className="text-2xl font-bold text-green-800">
                      {profile.username}'s profile
                    </h1>
                    {profile.onlineStatus === "online" ? (
                      <p className="text-green-600 font-semibold text-sm">
                        Online
                      </p>
                    ) : (
                      <p className="text-green-600 text-sm">
                        Last online: {profile.onlineStatus}
                      </p>
                    )}
                  </div>

                  <div className="flex ml-auto gap-2">
                    {reportStatus ? (
                      <div className="flex flex-col ml-auto items-center justify-center text-green-400">
                        <button>
                          <FiAlertTriangle className="w-5 h-5" />
                        </button>
                        <p className="text-xs font-bold">Reported</p>
                      </div>
                    ) : (
                      <div className="flex flex-col ml-auto items-center justify-center text-green-700">
                        <button onClick={() => handleReport()}>
                          <FiAlertTriangle className="w-5 h-5" />
                        </button>
                        <p className="text-xs font-bold">Report</p>
                      </div>
                    )}

                    <div className="flex flex-col ml-auto items-center justify-center text-green-700">
                      <button onClick={() => setShowBlockConfirm(true)}>
                        <FiUserX className="w-5 h-5" />
                      </button>
                      <p className="text-xs font-bold">Block</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-1 mt-1 text-green-800">
                  <p>{`First Name: ${profile.firstName}`}</p>
                  <p>{`Last Name: ${profile.lastName}`}</p>
                  <p>{`Age: ${profile.age}`}</p>
                  {profile.tags.length > 0 && (
                    <div className="flex gap-2 items-center">
                      <p>Tags:</p>
                      {profile.tags.map((tag, i) => (
                        <div
                          key={i}
                          className="px-2 py-1 bg-green-50 rounded-xl border-2 border-green-600 text-sm font-bold text-green-800"
                        >
                          {tag}
                        </div>
                      ))}
                    </div>
                  )}
                  <p>{`Gender: ${profile.gender}`}</p>
                  <p>{`Sexual preference: ${profile.sexualPreference}`}</p>
                  <p>{`Biography: ${profile.biography ? profile.biography : "-"}`}</p>
                  <p>
                    Fame:{" "}
                    <span className="text-orange-500 font-bold">
                      🔥 {profile.fame}
                    </span>
                  </p>
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
                            className="w-15 h-15 rounded-xl border-2 border-green-600 object-cover"
                          />
                        ))}
                      </div>
                    </>
                  )}

                  {profile.likedBy && (
                    <div className="flex">
                      <p>Liked by:</p>
                      {profile.likedBy.length > 0 ? (
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

                  {profile.viewedBy && (
                    <div className="flex">
                      <p>Viewed by:</p>
                      {profile.viewedBy.length > 0 ? (
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

                  {errorMessage && (
                    <p className="rounded-lg bg-red-50 px-3 py-2 text-center text-sm text-red-600">
                      {errorMessage}
                    </p>
                  )}

                  <div className="flex flex-col gap-1 items-center">
                    <button
                      onClick={() => handleLike(!likeStatus)}
                      className={`mt-2 text-2xl rounded-2xl border-2 border-green-600 w-full py-1 hover:bg-green-50 text-green-700`}
                    >
                      {likeStatus ? (
                        <FaHeart className="mx-auto" />
                      ) : (
                        <FiHeart className="mx-auto" />
                      )}
                    </button>
                    {connectedStatus && (
                      <p className="text-sm text-green-600 font-bold">
                        (Connected)
                      </p>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {showBlockConfirm && (
            <ConfirmBlockComponent
              setShowConfirmation={setShowBlockConfirm}
              setShowProfile={setShowProfile}
              setBlockErrorMessage={setErrorMessage}
              profile_id={profileId}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default VisitProfileComponent;
