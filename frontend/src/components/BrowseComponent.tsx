import { useState, useEffect, useRef } from "react";
import "../App.css";
import WS from "../class/ws";
import { ProfileCardComponent } from "./shared/ProfileCardComponent";
import type { Profile } from "./shared/ProfileCardComponent";
import VisitProfileComponent from "./VisitProfileComponent";
import {
  SortFilterComponent,
  type SortFilterSpecs,
} from "./shared/SortFilterComponent";

interface BrowseComponentProps {}

const BrowseComponent: React.FC<BrowseComponentProps> = ({}) => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [offset, setOffset] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [sortFilterSpecs, setSortFilterSpecs] = useState<SortFilterSpecs>({
    sortBy: "Default",
    order: "desc",
    minAge: "0",
    maxAge: "200",
    minFame: "0",
    maxFame: "200",
    minCommonTags: "0",
    maxDistance: "100000",
  });

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

    sendWSRequest(sortFilterSpecs.sortBy, sortFilterSpecs.order, offset);
  }, []);

  function sendWSRequest(sortBy: string, order: string, offset: number) {
    WS.send({
      type: "get_browse_data",
      offset: offset,
      limit: limit,
      sort: sortBy,
      order: order,
      min_age: Number(sortFilterSpecs.minAge),
      max_age: Number(sortFilterSpecs.maxAge),
      min_fame: Number(sortFilterSpecs.minFame),
      max_fame: Number(sortFilterSpecs.maxFame),
      min_common_tags: Number(sortFilterSpecs.minCommonTags),
      max_distance: Number(sortFilterSpecs.maxDistance),
    });
  }

  function handleSortChange(newSort: string) {
    //when wanna sort, reset all profiles and start from first batch again
    setSortFilterSpecs((prev) => ({ ...prev, sortBy: newSort }));
    setProfiles([]);
    setOffset(0);
    setHasMore(true);
    setLoading(false);

    sendWSRequest(newSort, sortFilterSpecs.order, 0);
  }

  function handleOrderChange() {
    //same thing when wanna reverse, reset to first batch
    const newOrder = sortFilterSpecs.order === "desc" ? "asc" : "desc";
    setSortFilterSpecs((prev) => ({ ...prev, order: newOrder }));
    setProfiles([]);
    setOffset(0);
    setHasMore(true);
    setLoading(false);

    sendWSRequest(sortFilterSpecs.sortBy, newOrder, 0);
  }

  function handleScroll() {
    const el = scrollRef.current;
    if (!el) return;

    //check the height of the div left
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 10) {
      if (loading || !hasMore) return;

      setLoading(true);
      sendWSRequest(sortFilterSpecs.sortBy, sortFilterSpecs.order, offset);
    }

    //scrollHeight = total height of the div
    //clientHeight = height of the visible window
    //scrollTop = height already scrolled
  }

  function handleFilterSubmit() {
    setProfiles([]);
    setOffset(0);
    setHasMore(true);
    setLoading(false);

    sendWSRequest(sortFilterSpecs.sortBy, sortFilterSpecs.order, 0);
  }

  return (
    <div className="min-w-screen h-screen flex flex-col items-center bg-green-100 pb-16">
      <div className="flex min-w-screen border-b-2 border-green-600 bg-white items-center justify-center p-4">
        <h1 className="text-2xl font-bold text-green-800">Browse</h1>

        <SortFilterComponent
          sortFilterSpecs={sortFilterSpecs}
          setSortFilterSpecs={setSortFilterSpecs}
          handleSortChange={handleSortChange}
          handleOrderChange={handleOrderChange}
          handleFilterSubmit={handleFilterSubmit}
        />
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

      {loading && (
        <p className="text-sm font-bold text-green-700">Loading...</p>
      )}

      {showProfile && (
        <VisitProfileComponent
          profileId={showProfileId}
          setShowProfile={setShowProfile}
        />
      )}
    </div>
  );
};

export default BrowseComponent;
