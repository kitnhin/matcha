import { useState, useEffect, useRef } from "react";
import "../App.css";
import WS from "../class/ws";
import defaultPfp from "../assets/default_pfp.jpg";
import { useNavigate } from "react-router-dom";
import { ProfileCardComponent } from "./shared/ProfileCardComponent";
import type { Profile } from "./shared/ProfileCardComponent";

// interface Profile {
//   userId: string;
//   username: string;
//   age: number;
//   location: string;
//   commonTags: number;
//   profilePic: string;
//   fame: number;
// }

// interface ProfileCardComponentProps {
//   profile: Profile;
// }

// const ProfileCardComponent: React.FC<ProfileCardComponentProps> = ({
//   profile,
// }) => {
//   const navigate = useNavigate();

//   return (
//     <div
//       onClick={() => navigate(`/profile?profile-id=${profile.userId}`)}
//       className="mb-2 max-w-xs p-4"
//     >
//       <img
//         src={
//           profile.profilePic
//             ? `data:image/jpeg;base64,${profile.profilePic}`
//             : defaultPfp
//         }
//         alt={profile.username}
//         className="w-full aspect-square object-cover rounded-3xl"
//       />
//       <div className="p-3">
//         <div className="flex items-center justify-between">
//           <span className="font-semibold">
//             {profile.username}, {profile.age}
//           </span>
//           <span className="text-orange-500 text-sm">🔥 {profile.fame}</span>
//         </div>
//         <p className="text-sm text-gray-400 mt-1">{profile.location}</p>
//         <p className="text-xs text-gray-500 mt-1">
//           {profile.commonTags} common tags
//         </p>
//       </div>
//     </div>
//   );
// };

interface BrowseComponentProps {}

const BrowseComponent: React.FC<BrowseComponentProps> = ({}) => {
  const navigate = useNavigate();

  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [showSort, setShowSort] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>("Default");
  const [order, setOrder] = useState<string>("desc");
  const [offset, setOffset] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);

  const [showFilter, setShowFilter] = useState<boolean>(false);
  const [minAge, setMinAge] = useState<string>("18");
  const [maxAge, setMaxAge] = useState<string>("100");
  const [minFame, setMinFame] = useState<string>("0");
  const [maxFame, setMaxFame] = useState<string>("10000");
  const [maxDistance, setMaxDistance] = useState<string>("10000");
  const [minCommonTags, setMinCommonTags] = useState<string>("0");

  const limit = 6;
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    WS.setup();

    WS.add_callback("browseData", (message) => {
      setLoading(false);
      setProfiles((prev) => {
        const combined = [...prev, ...message.profiles];
        const unique = []
        const seen = new Set()

        for (const profile of combined) {
          if (!seen.has(profile.username)) {
            seen.add(profile.username);
            unique.push(profile);
          }
        }

        return unique;
      }); //need to pass in ft if not it will use the array at the start instead of the current one
      setOffset((prev) => prev + message.profiles.length);
      if (message.profiles.length < limit) {
        setHasMore(false);
      }
    });

    loadMore(sortBy, order, offset);

  }, []);

  function loadMore(sortBy: string, order: string, offset: number) {
    if (loading || !hasMore) return;

    setLoading(true);
    WS.send({
      type: "get_browse_data",
      offset: offset,
      limit: limit,
      sort: sortBy,
      order: order,
      min_age: Number(minAge),
      max_age: Number(maxAge),
      min_fame: Number(minFame),
      max_fame: Number(maxFame),
      min_common_tags: Number(minCommonTags),
      max_distance: Number(maxDistance),
    });
  }

  function handleSortChange(newSort: string) {
    //when wanna sort, reset all profiles and start from first batch again
    setSortBy(newSort);
    setShowSort(false);
    setProfiles([]);
    setOffset(0);
    setHasMore(true);
    setLoading(false);

    loadMore(newSort, order, 0);
  }

  function handleOrderChange() {
    //same thing when wanna reverse, reset to first batch
    const newOrder = order === "desc" ? "asc" : "desc";
    setOrder(newOrder);
    setShowSort(false);
    setProfiles([]);
    setOffset(0);
    setHasMore(true);
    setLoading(false);

    loadMore(sortBy, newOrder, 0);
  }

  function handleScroll() {
    const el = scrollRef.current;
    if (!el) return;

    //check the height of the div left
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 10) {
      loadMore(sortBy, order, offset);
    }
  }

  const col1 = profiles.filter((_, i) => i % 2 == 0);
  const col2 = profiles.filter((_, i) => i % 2 == 1);

  function handleFilterSubmit() {
    setShowFilter(false);
    setProfiles([]);
    setOffset(0);
    setHasMore(true);
    setLoading(false);

    loadMore(sortBy, order, 0);
  }

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
        <div className="absolute right-5 gap-4 flex">
          <button
            onClick={() => {
              setShowSort(true);
            }}
            className="right-4 text-xl"
          >
            Sort: {sortBy || "None"}
          </button>

          {showSort && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowSort(false)}
              />
              <div className="absolute flex flex-col right-0 mt-10 rounded border z-20">
                {["Default", "Age", "Fame", "Common Tags", "Location"].map(
                  (option) => (
                    <button
                      key={option}
                      onClick={() => {
                        handleSortChange(option);
                      }}
                      className="text-left px-4 py-2 text-sm"
                    >
                      {option}
                    </button>
                  )
                )}
                <button
                  onClick={() => handleOrderChange()}
                  className="text-left px-4 py-2 text-sm"
                >
                  Order: {order === "desc" ? "Descending" : "Ascending"}
                </button>
              </div>
            </>
          )}

          {/* Filter stuff */}
          <button
            onClick={() => {
              setShowFilter(true);
            }}
            className="right-4 text-xl"
          >
            Filter
          </button>

          {showFilter && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowFilter(false)}
              />
                <div className="absolute flex flex-col items-center right-0 mt-10 rounded border z-20 fex">
                  <div className="flex gap-2 p-4">
                    <label>Age: </label>
                    <input
                      type="text"
                      value={minAge}
                      onChange={(e) => {
                        setMinAge(e.target.value);
                      }}
                      className="w-12 rounded border"
                    />
                    <p> to </p>
                    <input
                      type="text"
                      value={maxAge}
                      onChange={(e) => {
                        setMaxAge(e.target.value);
                      }}
                      className="w-12 rounded border"
                    />
                  </div>
                  <div className="flex gap-3 p-2">
                    <label>Fame: </label>
                    <input
                      value={minFame}
                      type="text"
                      onChange={(e) => {
                        setMinFame(e.target.value);
                      }}
                      className="w-12 rounded border"
                    />
                    <p> to </p>
                    <input
                      type="text"
                      value={maxFame}
                      onChange={(e) => {
                        setMaxFame(e.target.value);
                      }}
                      className="w-12 rounded border"
                    />
                  </div>

                  <div className="flex gap-3 p-2">
                    <label>Min Common Tags: </label>
                    <input
                      type="text"
                      value={minCommonTags}
                      onChange={(e) => {
                        setMinCommonTags(e.target.value);
                      }}
                      className="w-12 rounded border"
                    />
                  </div>

                  <div className="flex gap-3 p-2">
                    <label>Max distance: </label>
                    <input
                      type="text"
                      value={maxDistance}
                      onChange={(e) => {
                        setMaxDistance(e.target.value);
                      }}
                      className="w-12 rounded border"
                    />
                  </div>

                  <button
                    onClick={handleFilterSubmit}
                    className="rounded border text-left px-2 my-2 py-2 text-sm"
                  >
                    Submit
                  </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Profiles */}
      <div
        className="max-w-xl flex gap-3 overflow-y-auto flex-1 px-4 pb-4"
        ref={scrollRef}
        onScroll={handleScroll}
      >
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

      {loading && <p className="text-sm">Loading...</p>}
    </div>
  );
};

export default BrowseComponent;
