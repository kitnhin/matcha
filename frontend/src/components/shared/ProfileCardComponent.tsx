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
      className="mt-2 p-4 max-w-xs rounded-3xl"
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
      <div className="p-1">
        <div className="flex items-center justify-between">
          <div className="font-semibold text-base">
            {profile.username}, {profile.age}
          </div>
          <div className="text-orange-500 text-sm">🔥 {profile.fame}</div>
        </div>
        <p className="text-xs text-gray-800">{profile.location}</p>
        <p className="text-xs text-gray-800">
          {profile.commonTags} common tags
        </p>
      </div>
    </div>
  );
};
