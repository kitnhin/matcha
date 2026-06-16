import "../../App.css";
import defaultPfp from "../../assets/default_pfp.jpg";
import { useNavigate } from "react-router-dom";

export interface Profile {
  userId: number;
  username: string;
  age: number;
  location: string;
  commonTags: number;
  profilePic: string;
  fame: number;
}

interface ProfileCardComponentProps {
  profile: Profile;
  setShowProfile: React.Dispatch<React.SetStateAction<boolean>>;
  setShowProfileId: React.Dispatch<React.SetStateAction<number>>;
}

export const ProfileCardComponent: React.FC<ProfileCardComponentProps> = ({
  profile,
  setShowProfile,
  setShowProfileId,
}) => {

  return (
    <div
      onClick={() => {
        setShowProfile(true);
        setShowProfileId(profile.userId);
      }}
      className="mb-2 max-w-xs p-4"
    >
      <img
        src={
          profile.profilePic
            ? `data:image/jpeg;base64,${profile.profilePic}`
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
          {profile.commonTags} common tags
        </p>
      </div>
    </div>
  );
};
