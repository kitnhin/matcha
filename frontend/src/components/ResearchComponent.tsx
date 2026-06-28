import React, { useState, useEffect, useRef } from "react";
import "../App.css";
import WS from "../class/ws";
import defaultPfp from "../assets/default_pfp.jpg";
import { useNavigate } from "react-router-dom";
import { ProfileCardComponent } from "./shared/ProfileCardComponent";
import type { Profile } from "./shared/ProfileCardComponent";
import LocationComponent, { type Location } from "./shared/LocationComponent";
import VisitProfileComponent from "./VisitProfileComponent";
import {
  SortFilterComponent,
  type SortFilterSpecs,
} from "./shared/SortFilterComponent";

interface ResearchComponentProps {}

const ResearchComponent: React.FC<ResearchComponentProps> = ({}) => {
  const AVAILABLE_TAGS = [
    "vegan",
    "geek",
    "piercing",
    "gaming",
    "anime",
    "sports",
  ];

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
  const [Tags, setTags] = useState<string[]>([]);

  const [showProfile, setShowProfile] = useState<boolean>(false);
  const [showProfileId, setShowProfileId] = useState<number>(-2);

  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null
  );

  const [displaySearch, setDisplaySearch] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const limit = 6;
  const scrollRef = useRef<HTMLDivElement>(null);

  const col1 = profiles.filter((_, i) => i % 2 == 0);
  const col2 = profiles.filter((_, i) => i % 2 == 1);

  useEffect(() => {
    // WS.setup();

    WS.add_callback("researchData", (message) => {
      if (message.status === "success") {
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
        setErrorMessage("");
      } else {
        setErrorMessage(message.errorMessage);
      }
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
      min_age: Number(sortFilterSpecs.minAge),
      max_age: Number(sortFilterSpecs.maxAge),
      min_fame: Number(sortFilterSpecs.minFame),
      max_fame: Number(sortFilterSpecs.maxFame),
      min_common_tags: Number(sortFilterSpecs.minCommonTags),
      max_distance: Number(sortFilterSpecs.maxDistance),

      tags: Tags,
      location: selectedLocation,
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
      console.log(loading, hasMore);
      if (loading || !hasMore) return;

      setLoading(true);
      sendWSRequest(sortFilterSpecs.sortBy, sortFilterSpecs.order, offset);
    }
  }

  function handleFilterSubmit() {
    setProfiles([]);
    setOffset(0);
    setHasMore(true);
    setLoading(false);

    sendWSRequest(sortFilterSpecs.sortBy, sortFilterSpecs.order, 0);
  }

  function handleSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setProfiles([]);
    setOffset(0);
    setHasMore(true);
    setLoading(false);

    sendWSRequest(sortFilterSpecs.sortBy, sortFilterSpecs.order, 0);
  }

  return (
    <div className="min-w-screen h-screen flex flex-col items-center bg-green-100 pb-16">
      <div className="flex min-w-screen border-b-2 border-green-600 bg-white items-center justify-center p-4">
        <h1 className="text-2xl font-bold text-green-800">Research</h1>

        <SortFilterComponent
          sortFilterSpecs={sortFilterSpecs}
          setSortFilterSpecs={setSortFilterSpecs}
          handleSortChange={handleSortChange}
          handleOrderChange={handleOrderChange}
          handleFilterSubmit={handleFilterSubmit}
        />
      </div>

      {!displaySearch ? (
        <button
          className="text-sm font-bold text-green-700 underline underline-offset-2 mt-2 mb-1"
          onClick={() => setDisplaySearch(true)}
        >
          Edit search
        </button>
      ) : (
        <form
          className="rounded-3xl border-2 border-green-600 bg-white flex flex-col items-center justify-center gap-2 p-3 mt-4"
          onSubmit={handleSearchSubmit}
        >
          <div className="flex gap-2 p-2 items-center">
            <label className="text-sm font-bold text-green-800">Age:</label>
            <input
              type="text"
              value={sortFilterSpecs.minAge}
              onChange={(e) => {
                setSortFilterSpecs((prev) => ({
                  ...prev,
                  minAge: e.target.value,
                }));
              }}
              className="w-12 rounded-xl border-2 border-green-600 bg-green-50 px-2 py-1 text-green-900 text-sm"
            />
            <p className="text-sm text-green-800">to</p>
            <input
              type="text"
              value={sortFilterSpecs.maxAge}
              onChange={(e) => {
                setSortFilterSpecs((prev) => ({
                  ...prev,
                  maxAge: e.target.value,
                }));
              }}
              className="w-12 rounded-xl border-2 border-green-600 bg-green-50 px-2 py-1 text-green-900 text-sm"
            />
          </div>

          <div className="flex gap-2 p-2 items-center">
            <label className="text-sm font-bold text-green-800">Fame:</label>
            <input
              value={sortFilterSpecs.minFame}
              type="text"
              onChange={(e) => {
                setSortFilterSpecs((prev) => ({
                  ...prev,
                  minFame: e.target.value,
                }));
              }}
              className="w-12 rounded-xl border-2 border-green-600 bg-green-50 px-2 py-1 text-green-900 text-sm"
            />
            <p className="text-sm text-green-800">to</p>
            <input
              type="text"
              value={sortFilterSpecs.maxFame}
              onChange={(e) => {
                setSortFilterSpecs((prev) => ({
                  ...prev,
                  maxFame: e.target.value,
                }));
              }}
              className="w-12 rounded-xl border-2 border-green-600 bg-green-50 px-2 py-1 text-green-900 text-sm"
            />
          </div>

          <div className="flex gap-3 items-center">
            <label className="text-sm font-bold text-green-800">Tags:</label>
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
                className={`rounded-xl border-2 px-3 py-1 text-sm font-bold ${
                  Tags.includes(tag)
                    ? "bg-green-700 text-white border-green-700"
                    : "bg-green-50 text-green-800 border-green-600"
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
          <p className="text-xs text-gray-400">(Leave empty to search all locations)</p>

          {errorMessage && (
            <div>
              <p className="rounded-lg bg-red-50 px-3 py-2 text-center text-sm text-red-600">
                {errorMessage}
              </p>
            </div>
          )}
          <div className="flex gap-2 mt-2">
            <button
              type="button"
              className="rounded-2xl border-2 border-green-600 bg-white px-4 py-2 text-sm font-bold text-green-800 hover:bg-green-50"
              onClick={() => setDisplaySearch(false)}
            >
              Close
            </button>
            <button
              type="submit"
              className="rounded-2xl bg-green-700 px-4 py-2 text-sm font-bold text-white hover:bg-green-800"
            >
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

export default ResearchComponent;
