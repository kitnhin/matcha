import { useState, useRef, useEffect } from "react";
import "../../App.css";

export interface Location {
  place_name: string;
  latitude: number;
  longitude: number;
}

interface LocationComponentProps {
  selectedLocation: Location | null;
  setSelectedLocation: React.Dispatch<React.SetStateAction<Location | null>>;
}

const LocationComponent: React.FC<LocationComponentProps> = ({
  selectedLocation,
  setSelectedLocation,
}) => {
  const [locationQuery, setLocationQuery] = useState<string>("");
  const [locationRes, setLocationRes] = useState<any[]>([]);
  const [showLocationRes, setShowLocationRes] = useState<boolean>(false);
  const locationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleLocationInputChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const inputPlace = event.target.value;
    setLocationQuery(inputPlace);

    if (locationTimerRef.current) {
      clearTimeout(locationTimerRef.current);
    }

    if (inputPlace.trim() === "") {
      setSelectedLocation(null);
      setLocationRes([]);
      setShowLocationRes(false);
      return;
    }

    if (inputPlace.length < 3) {
      setLocationRes([]);
      setShowLocationRes(false);
      return;
    }

    //everytime whenever the user wait for abit after typing, then only call api
    locationTimerRef.current = setTimeout(() => {
      try {
        fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
            inputPlace
          )}&format=json`,
          { headers: { "User-Agent": "42-Matcha" } }
        )
          .then((response: Response) => response.json())
          .then((data: any) => {
            setLocationRes(data);
            setShowLocationRes(true);
            // console.log(data);
          });
      } catch (error: any) {
        console.log("Nominatim error: ", error);
      }
    }, 300);
  }

  function handleSelectedLocation(place: any) {
    setSelectedLocation({
      place_name: place.display_name,
      latitude: parseFloat(place.lat),
      longitude: parseFloat(place.lon),
    });
    setShowLocationRes(false);
  }

  function handleAutoLocation() {
    navigator.geolocation.getCurrentPosition((position) => {
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;

      try {
        fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
          { headers: { "User-Agent": "42-Matcha" } }
        )
          .then((response: Response) => response.json())
          .then((data: any) => {
            const place_name = `${
              data.address.city_district ? `${data.address.city_district},` : ""
            }${data.address.city ? ` ${data.address.city},` : ""}${
              data.address.state ? ` ${data.address.state},` : ""
            }${data.address.country ? ` ${data.address.country}` : ""}`;
            setSelectedLocation({
              place_name: place_name,
              latitude: latitude,
              longitude: longitude,
            });
            // console.log("auto", data);
          });
      } catch (error: any) {
        console.log("Nominatim error: ", error);
      }
    });
  }

  useEffect(() => {
    if (selectedLocation) {
      setLocationQuery(selectedLocation.place_name);
    }
  }, [selectedLocation]);

  return (
    <div className="flex flex-col gap-2">
      <label className="text-xl font-medium text-gray-700">Location</label>

      <div className="relative">
        <input
          type="text"
          className="rounded-md border px-2 py-1 w-full"
          onChange={(e) => {
            handleLocationInputChange(e);
          }}
          value={
            locationQuery.length > 35
              ? locationQuery.substring(0, 35) + "..."
              : locationQuery
          }
        />
        {showLocationRes && (
          <ul className="absolute left-0 right-0 top-full z-10 max-h-30 overflow-y-auto rounded-md border bg-white shadow-md">
            {locationRes.map((place, i) => {
              return (
                <li
                  key={i}
                  onClick={() => handleSelectedLocation(place)}
                  className="px-2 py-1 cursor-pointer hover:bg-gray-100 text-sm border-b last:border-b-0"
                >
                  {place.display_name.length > 40
                    ? place.display_name.substring(0, 40) + "..."
                    : place.display_name}
                </li>
              );
            })}
          </ul>
        )}
      </div>
      <button
        type="button"
        className="text-xs text-blue-500 hover:text-blue-700 self-start border px-1 py-1 rounded"
        onClick={() => {
          handleAutoLocation();
        }}
      >
        📍 Use current location
      </button>
      <p className="text-sm text-gray-500">
        Selected location:{" "}
        {selectedLocation
          ? `${selectedLocation.place_name} (${selectedLocation.latitude.toFixed(5)}, ${selectedLocation.longitude.toFixed(5)})`
          : "None"}
      </p>
    </div>
  );
};

export default LocationComponent;
