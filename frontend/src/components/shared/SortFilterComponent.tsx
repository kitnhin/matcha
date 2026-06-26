import "../../App.css";
import { useState } from "react";

export interface SortFilterSpecs {
  sortBy: string;
  order: string;
  minAge: string;
  maxAge: string;
  minFame: string;
  maxFame: string;
  minCommonTags: string;
  maxDistance: string;
}

interface SortFilterComponentProps {
  sortFilterSpecs: SortFilterSpecs;
  setSortFilterSpecs: React.Dispatch<React.SetStateAction<SortFilterSpecs>>;
  handleSortChange: (sortBy: string) => void;
  handleOrderChange: () => void;
  handleFilterSubmit: () => void;
}

export const SortFilterComponent: React.FC<SortFilterComponentProps> = ({
  sortFilterSpecs,
  setSortFilterSpecs,
  handleSortChange,
  handleOrderChange,
  handleFilterSubmit,
}) => {
  const [showSort, setShowSort] = useState<boolean>(false);
  const [showFilter, setShowFilter] = useState<boolean>(false);

  return (
    <div className="absolute right-5 gap-4 flex">
      <button
        onClick={() => {
          setShowSort(true);
        }}
        className="right-4 text-sm font-bold text-green-700"
      >
        Sort: {sortFilterSpecs.sortBy || "None"}
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
                    setShowSort(false);
                  }}
                  className="text-left px-4 py-2 text-sm font-bold text-green-800 border-b border-green-200 hover:bg-green-50"
                >
                  {option}
                </button>
              ),
            )}
            <button
              onClick={() => {
                handleOrderChange();
                setShowSort(false);
              }}
              className="text-left px-4 py-2 text-sm font-bold text-green-800 hover:bg-green-50"
            >
              Order:{" "}
              {sortFilterSpecs.order === "desc" ? "Descending" : "Ascending"}
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

            <div className="flex gap-2 p-2 items-center">
              <label className="text-sm font-bold text-green-800">
                Min Common Tags:
              </label>
              <input
                type="text"
                value={sortFilterSpecs.minCommonTags}
                onChange={(e) => {
                  setSortFilterSpecs((prev) => ({
                    ...prev,
                    minCommonTags: e.target.value,
                  }));
                }}
                className="w-12 rounded-xl border-2 border-green-600 bg-green-50 px-2 py-1 text-green-900 text-sm"
              />
            </div>

            <div className="flex gap-2 p-2 items-center">
              <label className="text-sm font-bold text-green-800">
                Max distance:
              </label>
              <input
                type="text"
                value={sortFilterSpecs.maxDistance}
                onChange={(e) => {
                  setSortFilterSpecs((prev) => ({
                    ...prev,
                    maxDistance: e.target.value,
                  }));
                }}
                className="w-12 rounded-xl border-2 border-green-600 bg-green-50 px-2 py-1 text-green-900 text-sm"
              />
            </div>

            <button
              onClick={() => {
                handleFilterSubmit();
                setShowFilter(false);
              }}
              className="rounded-xl bg-green-700 text-white px-4 py-2 text-sm font-bold hover:bg-green-800 my-2"
            >
              Submit
            </button>
          </div>
        </>
      )}
    </div>
  );
};
