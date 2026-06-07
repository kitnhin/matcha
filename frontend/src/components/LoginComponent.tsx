import { useState } from "react";
import "../App.css";
import { useNavigate } from "react-router-dom";

interface LoginComponentProps {
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
}

const LoginComponent: React.FC<LoginComponentProps> = ({ setIsLoggedIn }) => {
  const navigate = useNavigate();

  const [loginUsername, setLoginUsername] = useState<string>("");
  const [loginPassword, setLoginPassword] = useState<string>("");
  const [loginError, setLoginError] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

    fetch(`${BACKEND_URL}/auth/login`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: loginUsername,
        password: loginPassword,
      }),
    })
      .then((response: Response) => response.json())
      .then((data: { loginStatus: string; isComplete: boolean }) => {
        if (data.loginStatus === "success") {
          setIsLoggedIn(true);
          if (data.isComplete) {
            navigate("/home");
          } else navigate("/setup");
        } else {
          setLoginError(true);
        }
      });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-sm rounded-xl border border-gray-200 bg-white p-6 shadow-lg">
        <h1 className="mb-6 text-center text-2xl font-bold text-gray-800">
          Login
        </h1>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              type="text"
              onChange={(e) => {
                setLoginUsername(e.target.value);
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
                  setShowPassword(!showPassword);
                }}
                className="text-xs underline"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            <input
              type={showPassword ? "text" : "password"}
              onChange={(e) => {
                setLoginPassword(e.target.value);
              }}
              className="rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
          </div>

          {loginError && (
            <p className="text-center text-sm text-red-600">
              Invalid username or password. Please try again.
            </p>
          )}

          <button
            type="submit"
            className="mt-1 rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
          >
            Submit
          </button>

          <button
            type="button"
            className="rounded-md border border-blue-600 px-4 py-2 font-medium text-blue-600 hover:bg-blue-50"
            onClick={() => {
              navigate("/register");
            }}
          >
            Register an account
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginComponent;
