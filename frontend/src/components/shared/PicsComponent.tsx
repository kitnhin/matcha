import { useState, useRef } from "react";
import "../../App.css";

interface PicsComponentProps {
  profilePic: File | string | null;
  setProfilePic: React.Dispatch<React.SetStateAction<File | string | null>>;
  extraPics: (File | string | null)[];
  setExtraPics: React.Dispatch<React.SetStateAction<(File | string | null)[]>>;
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>;
}

const PicsComponent: React.FC<PicsComponentProps> = ({
  profilePic,
  setProfilePic,
  extraPics,
  setExtraPics,
  setErrorMessage
}) => {
  const pfpInputRef = useRef<HTMLInputElement>(null);
  const extraPicsInputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  function handlePfpChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];

      //max file size
      const max_file_size = 5 * 1024 * 1024;
      if (file.size > max_file_size) {
        setErrorMessage("File size exceeds the 5MB limit.");
        return;
      }
      setProfilePic(file);
    }
  }

  function deletePfp() {
    setProfilePic(null);
    if (pfpInputRef.current) {
      pfpInputRef.current.value = "";
    }
  }

  function handleExtraPicChange(
    event: React.ChangeEvent<HTMLInputElement>,
    i: number
  ) {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];

      //max file size
      const max_file_size = 5 * 1024 * 1024;
      if (file.size > max_file_size) {
        setErrorMessage("File size exceeds the 5MB limit.");
        return;
      }

      const newExtraPics = [...extraPics];
      newExtraPics[i] = file;
      setExtraPics(newExtraPics);
    }
  }

  function deleteExtraPic(i: number) {
    const newExtraPics = [...extraPics];
    newExtraPics[i] = null;
    setExtraPics(newExtraPics);

    if(extraPicsInputRefs[i].current) {
      extraPicsInputRefs[i].current.value = "";
    }
  }

  return (
    <>
      {/* Pfp block */}
      <div className="flex flex-col gap-2">
        <label className="text-xl font-medium text-gray-700">
          Profile Picture
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={handlePfpChange}
          className="hidden"
          ref={pfpInputRef}
        />
        {profilePic ? (
          <div className="w-full flex flex-col items-center gap-1">
            <img
              className="object-cover w-16 h-16 rounded-md border cursor-pointer"
              src={profilePic instanceof File ? URL.createObjectURL(profilePic) : `data:image/jpeg;base64,${profilePic}`}
              alt="+"
              onClick={() => {
                if (pfpInputRef.current) {
                  pfpInputRef.current.click();
                }
              }}
            />
            <button className="text-sm text-red-500" onClick={deletePfp}>
              Delete
            </button>
          </div>
        ) : (
          <div className="w-full flex flex-col items-center">
            <div
              className="w-16 h-16 rounded-md border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer text-gray-400 text-xl"
              onClick={() => {
                if (pfpInputRef.current) {
                  pfpInputRef.current.click();
                }
              }}
            >
              +
            </div>
          </div>
        )}
      </div>

      {/* Extra pics block */}
      <div className="flex flex-col gap-2">
        <label className="text-xl font-medium text-gray-700">
          Extra pictures
        </label>

        <div className="flex w-full gap-2">
          {[0, 1, 2, 3].map((i) => {
            return (
              <div key={i} className="flex flex-col items-center w-1/4 gap-1">
                <input
                  key={i}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={extraPicsInputRefs[i]}
                  onChange={(e) => handleExtraPicChange(e, i)}
                />
                {extraPics[i] ? (
                  <>
                    <img
                      className="object-cover w-16 h-16 rounded-md border cursor-pointer"
                      src={extraPics[i] instanceof File ? URL.createObjectURL(extraPics[i]) : `data:image/jpeg;base64,${extraPics[i]}`}
                      alt="+"
                      onClick={() => {
                        if (extraPicsInputRefs[i].current) {
                          extraPicsInputRefs[i].current.click();
                        }
                      }}
                    />
                    <button
                      className="text-sm text-red-500"
                      onClick={() => deleteExtraPic(i)}
                    >
                      Delete
                    </button>
                  </>
                ) : (
                  <div
                    className="w-16 h-16 rounded-md border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer text-gray-400 text-xl"
                    onClick={() => {
                      if (extraPicsInputRefs[i].current) {
                        extraPicsInputRefs[i].current.click();
                      }
                    }}
                  >
                    +
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default PicsComponent;
