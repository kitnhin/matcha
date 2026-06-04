import { useState } from "react";
import "../App.css";
import { useNavigate } from "react-router-dom";

interface RegisterComponentProps {
    setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
}

const RegisterComponent: React.FC<RegisterComponentProps> = ({setIsLoggedIn}) => {

    const navigate = useNavigate();

  const [registerUsername, setRegisterUsername] = useState<string>("");
  const [registerPassword1, setRegisterPassword1] = useState<string>("");
  const [registerPassword2, setRegisterPassword2] = useState<string>("");
  const [showPassword1, setShowPassword1] = useState<boolean>(false);
  const [showPassword2, setShowPassword2] = useState<boolean>(false);
  const [passwordMismatchError, setPasswordMismatchError] = useState<boolean>(false);
  const [registerError, setRegisterError] = useState<string>("");

  function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

    if (registerPassword1 !== registerPassword2) {
        setPasswordMismatchError(true);
        return;
    }

    fetch(`${BACKEND_URL}/auth/register`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: registerUsername,
        password: registerPassword1,
      }),
    })
      .then((response: Response) => response.json())
      .then((data: { registerStatus: string, errorMessage: string }) => {
        if (data.registerStatus === "success") {
          setIsLoggedIn(true);
          navigate("/home");
        } else {
          setRegisterError(data.errorMessage || "An error occurred during registration.");
        }
      });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-sm rounded-xl border border-gray-200 bg-white p-6 shadow-lg">
        <h1 className="mb-6 text-center text-2xl font-bold text-gray-800">
          Register
        </h1>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              type="text"
              onChange={(e) => {
                setRegisterUsername(e.target.value);
              }}
              className="rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Password
              </label>
              <button
                type="button"
                onClick={() => {
                  setShowPassword1(!showPassword1);
                }}
                className="text-xs underline"
              >
                {showPassword1 ? "Hide" : "Show"}
              </button>
            </div>
            <input
              type={showPassword1 ? "text" : "password"}
              onChange={(e) => {
                setRegisterPassword1(e.target.value);
              }}
              className="rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <button
                type="button"
                onClick={() => {
                  setShowPassword2(!showPassword2);
                }}
                className="text-xs underline"
              >
                {showPassword2 ? "Hide" : "Show"}
              </button>
            </div>
            <input
              type={showPassword2 ? "text" : "password"}
              onChange={(e) => {
                setRegisterPassword2(e.target.value);
              }}
              className="rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
          </div>

          {registerError !== "" && (
            <p className="text-center text-sm text-red-600">
              {registerError}
            </p>
          )}

          {passwordMismatchError && (
            <p className="text-center text-sm text-red-600">
              Passwords do not match. Please try again.
            </p>
          )}

          <button
            type="submit"
            className="mt-1 rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
          >
            Submit
          </button>

        </form>
      </div>
    </div>
  );
}

export default RegisterComponent;