import { useState, useEffect, useRef } from "react";
import "../App.css";
import WS from "../class/ws";
import defaultPfp from "../assets/default_pfp.jpg";
import { useNavigate } from "react-router-dom";
import { ProfileCardComponent } from "./shared/ProfileCardComponent";
import type { Profile } from "./shared/ProfileCardComponent";
import VisitProfileComponent from "./VisitProfileComponent";

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
  const [minAge, setMinAge] = useState<string>("0");
  const [maxAge, setMaxAge] = useState<string>("200");
  const [minFame, setMinFame] = useState<string>("0");
  const [maxFame, setMaxFame] = useState<string>("200");
  const [maxDistance, setMaxDistance] = useState<string>("100000");
  const [minCommonTags, setMinCommonTags] = useState<string>("0");

  const [showProfile, setShowProfile] = useState<boolean>(false);
  const [showProfileId, setShowProfileId] = useState<number>(-2);

  const limit = 6;
  const scrollRef = useRef<HTMLDivElement>(null);

  const col1 = profiles.filter((_, i) => i % 2 == 0);
  const col2 = profiles.filter((_, i) => i % 2 == 1);

  useEffect(() => {
    // WS.setup();

    WS.add_callback("browseData", (message) => {
      setLoading(false);
      setProfiles((prev) => {
        const combined = [...prev, ...message.profiles];
        const unique = [];
        const seen = new Set();

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

    sendWSRequest(sortBy, order, offset);
  }, []);

  function sendWSRequest(sortBy: string, order: string, offset: number) {
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

    sendWSRequest(newSort, order, 0);
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

    sendWSRequest(sortBy, newOrder, 0);
  }

  function handleScroll() {
    const el = scrollRef.current;
    if (!el) return;

    //check the height of the div left
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 10) {
      if (loading || !hasMore) return;

      setLoading(true);
      sendWSRequest(sortBy, order, offset);
    }

    //scrollHeight = total height of the div
    //clientHeight = height of the visible window
    //scrollTop = height already scrolled
  }

  function handleFilterSubmit() {
    setShowFilter(false);
    setProfiles([]);
    setOffset(0);
    setHasMore(true);
    setLoading(false);

    sendWSRequest(sortBy, order, 0);
  }

  return (
    <div className="min-w-screen h-screen flex flex-col items-center overflow-hidden bg-green-100 pb-16">
      <div className="flex min-w-screen border-b-2 border-green-600 bg-white items-center justify-center p-4">
        <h1 className="text-2xl font-extrabold text-green-800">Browse</h1>

        {/* Sorting stuff */}
        <div className="absolute right-5 gap-4 flex">
          <button
            onClick={() => {
              setShowSort(true);
            }}
            className="right-4 text-sm font-bold text-green-700"
          >
            Sort: {sortBy || "None"}
          </button>

          {showSort && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowSort(false)}
              />
              <div className="absolute flex flex-col right-0 mt-10 rounded-xl border-2 border-green-600 bg-white z-20">
                {["Default", "Age", "Fame", "Common Tags", "Location"].map(
                  (option) => (
                    <button
                      key={option}
                      onClick={() => {
                        handleSortChange(option);
                      }}
                      className="text-left px-4 py-2 text-sm font-bold text-green-800 border-b border-green-200 hover:bg-green-50"
                    >
                      {option}
                    </button>
                  )
                )}
                <button
                  onClick={() => handleOrderChange()}
                  className="text-left px-4 py-2 text-sm font-bold text-green-800 hover:bg-green-50"
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
            className="right-4 text-sm font-bold text-green-700"
          >
            Filter
          </button>

          {showFilter && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowFilter(false)}
              />
              <div className="absolute flex flex-col items-center right-0 mt-10 rounded-xl border-2 border-green-600 bg-white z-20 p-2">
                <div className="flex gap-2 p-2 items-center">
                  <label className="text-sm font-bold text-green-800">Age:</label>
                  <input
                    type="text"
                    value={minAge}
                    onChange={(e) => {
                      setMinAge(e.target.value);
                    }}
                    className="w-12 rounded-xl border-2 border-green-600 bg-green-50 px-2 py-1 text-green-900 text-sm"
                  />
                  <p className="text-sm text-green-800">to</p>
                  <input
                    type="text"
                    value={maxAge}
                    onChange={(e) => {
                      setMaxAge(e.target.value);
                    }}
                    className="w-12 rounded-xl border-2 border-green-600 bg-green-50 px-2 py-1 text-green-900 text-sm"
                  />
                </div>
                <div className="flex gap-2 p-2 items-center">
                  <label className="text-sm font-bold text-green-800">Fame:</label>
                  <input
                    value={minFame}
                    type="text"
                    onChange={(e) => {
                      setMinFame(e.target.value);
                    }}
                    className="w-12 rounded-xl border-2 border-green-600 bg-green-50 px-2 py-1 text-green-900 text-sm"
                  />
                  <p className="text-sm text-green-800">to</p>
                  <input
                    type="text"
                    value={maxFame}
                    onChange={(e) => {
                      setMaxFame(e.target.value);
                    }}
                    className="w-12 rounded-xl border-2 border-green-600 bg-green-50 px-2 py-1 text-green-900 text-sm"
                  />
                </div>

                <div className="flex gap-2 p-2 items-center">
                  <label className="text-sm font-bold text-green-800">Min Common Tags:</label>
                  <input
                    type="text"
                    value={minCommonTags}
                    onChange={(e) => {
                      setMinCommonTags(e.target.value);
                    }}
                    className="w-12 rounded-xl border-2 border-green-600 bg-green-50 px-2 py-1 text-green-900 text-sm"
                  />
                </div>

                <div className="flex gap-2 p-2 items-center">
                  <label className="text-sm font-bold text-green-800">Max distance:</label>
                  <input
                    type="text"
                    value={maxDistance}
                    onChange={(e) => {
                      setMaxDistance(e.target.value);
                    }}
                    className="w-12 rounded-xl border-2 border-green-600 bg-green-50 px-2 py-1 text-green-900 text-sm"
                  />
                </div>

                <button
                  onClick={handleFilterSubmit}
                  className="rounded-xl bg-green-700 text-white px-4 py-2 text-sm font-bold hover:bg-green-800 my-2"
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
            <ProfileCardComponent
              key={profile.username}
              profile={profile}
              setShowProfile={setShowProfile}
              setShowProfileId={setShowProfileId}
            />
          ))}
        </div>
        <div className="flex flex-col">
          {col2.map((profile) => (
            <ProfileCardComponent
              key={profile.username}
              profile={profile}
              setShowProfile={setShowProfile}
              setShowProfileId={setShowProfileId}
            />
          ))}
        </div>
      </div>

      {loading && <p className="text-sm font-bold text-green-700">Loading...</p>}

      {showProfile && (
        <VisitProfileComponent
          profileId={showProfileId}
          setShowProfile={setShowProfile}
        />
      )}
    </div>
  );
}

export default BrowseComponent;