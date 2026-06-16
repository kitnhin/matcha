import React, { useState, useEffect, useRef } from "react";
import "../App.css";
import WS from "../class/ws";
import defaultPfp from "../assets/default_pfp.jpg";
import { useNavigate } from "react-router-dom";
import { ProfileCardComponent } from "./shared/ProfileCardComponent";
import type { Profile } from "./shared/ProfileCardComponent";
import LocationComponent, { type Location } from "./shared/LocationComponent";
import VisitProfileComponent from "./VisitProfileComponent";

interface ResearchComponentProps {}

const ResearchComponent: React.FC<ResearchComponentProps> = ({}) => {
  const navigate = useNavigate();
  const AVAILABLE_TAGS = [
    "vegan",
    "geek",
    "piercing",
    "gaming",
    "anime",
    "sports",
  ];

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
  const [Tags, setTags] = useState<string[]>([]);

  const [showProfile, setShowProfile] = useState<boolean>(false);
  const [showProfileId, setShowProfileId] = useState<number>(-2);

  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null
  );

  const [displaySearch, setDisplaySearch] = useState<boolean>(true);

  const limit = 6;
  const scrollRef = useRef<HTMLDivElement>(null);

  const col1 = profiles.filter((_, i) => i % 2 == 0);
  const col2 = profiles.filter((_, i) => i % 2 == 1);

  useEffect(() => {
    WS.setup();

    WS.add_callback("researchData", (message) => {
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

      setDisplaySearch(false);
    });

    setDisplaySearch(true);
  }, []);

  function sendWSRequest(sortBy: string, order: string, offset: number) {
    WS.send({
      type: "get_research_data",
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

      tags: Tags,
      location: selectedLocation,
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
      console.log(loading, hasMore);
      if (loading || !hasMore) return;

      setLoading(true);
      sendWSRequest(sortBy, order, offset);
    }
  }

  function handleFilterSubmit() {
    setShowFilter(false);
    setProfiles([]);
    setOffset(0);
    setHasMore(true);
    setLoading(false);

    sendWSRequest(sortBy, order, 0);
  }

  function handleSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setProfiles([]);
    setOffset(0);
    setHasMore(true);
    setLoading(false);

    sendWSRequest(sortBy, order, 0);
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
        <h1 className="text-2xl font-bold">Research</h1>

        <div className="absolute right-5 gap-4 flex">
          {/* Sorting stuff */}
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
                  <label>Tags: </label>
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

      {/* Search stuff */}

      {!displaySearch ? (
        <button
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={() => setDisplaySearch(true)}
        >
          Search
        </button>
      ) : (
        <form
          className="border rounded flex flex-col items-center justify-center gap-2 p-5"
          onSubmit={handleSearchSubmit}
        >
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

          <div className="flex gap-3">
            <label>Includes tags:</label>
            {AVAILABLE_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => {
                  if (!Tags.includes(tag)) {
                    setTags([...Tags, tag]);
                  } else {
                    setTags(Tags.filter((t) => t !== tag));
                  }
                }}
                className={`rounded-md border px-3 py-1 text-sm ${
                  Tags.includes(tag) ? "bg-gray-500 text-white" : "bg-white"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>

          <LocationComponent
            selectedLocation={selectedLocation}
            setSelectedLocation={setSelectedLocation}
          />
          <div className="flex gap-2">
            <button
              type="button"
              className="rounded border p-2"
              onClick={() => setDisplaySearch(false)}
            >
              Close
            </button>
            <button type="submit" className="rounded border p-2">
              Submit
            </button>
          </div>
        </form>
      )}
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

      {showProfile && (
        <VisitProfileComponent
          profileId={showProfileId}
          setShowProfile={setShowProfile}
        />
      )}

    </div>
  );
};

export default ResearchComponent;
