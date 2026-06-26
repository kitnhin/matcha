import { useState } from "react";
import "../App.css";
import { useNavigate } from "react-router-dom";
import { FiX } from "react-icons/fi";

interface LoginComponentProps {
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
}

const LoginComponent: React.FC<LoginComponentProps> = ({ setIsLoggedIn }) => {
  const navigate = useNavigate();

  const [loginUsername, setLoginUsername] = useState<string>("");
  const [loginPassword, setLoginPassword] = useState<string>("");
  const [loginError, setLoginError] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const [email, setEmail] = useState<string>("");
  const [forgotPassword, setForgotPassword] = useState<boolean>(false);
  const [forgotPasswordDone, setForgotPasswordDone] = useState<boolean>(false);
  const [forgotPasswordError, setForgotPasswordError] = useState<string>("");
  const [forgotPasswordLoading, setForgotPasswordLoading] =
    useState<boolean>(false);

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

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
      .then(
        (data: {
          loginStatus: string;
          isComplete: boolean;
          errorMessage: string;
        }) => {
          if (data.loginStatus === "success") {
            setIsLoggedIn(true);
            if (data.isComplete) {
              navigate("/home");
            } else navigate("/setup");
          } else {
            setLoginError(true);
            setErrorMessage(data.errorMessage);
          }
        }
      );
  }

  const handleForgotPassword = (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    setForgotPasswordLoading(true);

    fetch(`${BACKEND_URL}/auth/forgot-password`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email,
      }),
    })
      .then((response: Response) => response.json())
      .then((data: { forgotPasswordStatus: string; errorMessage: string }) => {
        if (data.forgotPasswordStatus === "success") {
          setForgotPasswordDone(true);
          setEmail("");
        } else {
          setForgotPasswordError(data.errorMessage);
          console.log("Forgot password error:", data.errorMessage);
        }
        setForgotPasswordLoading(false);
      });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-100">
      <div className="w-full max-w-sm rounded-3xl border-2 border-green-600 bg-white p-8 shadow-xl">
        <div className="mb-6 text-center">
          <p className="text-4xl">🍵</p>
          <h1 className="text-3xl font-bold text-green-800">matcha</h1>
        </div>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-bold text-green-800">Username</label>
            <input
              type="text"
              onChange={(e) => {
                setLoginUsername(e.target.value);
              }}
              className="rounded-xl border-2 border-green-600 bg-green-50 px-3 py-2 text-green-900 outline-none focus:border-green-500"
            />
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-green-800">
                Password
              </label>
              <button
                type="button"
                onClick={() => {
                  setShowPassword(!showPassword);
                }}
                className="text-xs font-bold text-green-500 underline underline-offset-2"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            <input
              type={showPassword ? "text" : "password"}
              onChange={(e) => {
                setLoginPassword(e.target.value);
              }}
              className="rounded-xl border-2 border-green-600 bg-green-50 px-3 py-2 text-green-900 outline-none focus:border-green-500"
            />
          </div>

          {loginError && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-center text-sm text-red-600">
              {errorMessage}
            </p>
          )}

          <button
            type="submit"
            className="mt-2 rounded-2xl bg-green-700 px-4 py-2 font-bold text-white hover:bg-green-800"
          >
            Login
          </button>

          <button
            type="button"
            className="rounded-2xl border-2 bg-white border-green-600 px-4 py-2 font-bold text-green-800 hover:bg-green-50"
            onClick={() => {
              navigate("/register");
            }}
          >
            Create an account
          </button>

          <button
            type="button"
            className="self-center text-sm font-semibold text-green-600 underline underline-offset-2 hover:text-green-800"
            onClick={() => {
              setForgotPassword(true);
              setForgotPasswordError("");
            }}
          >
            Forgot your password?
          </button>
        </form>

        {/* Forgot password page */}
        {forgotPassword && !forgotPasswordDone && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-green-100">
            <div className="relative w-full max-w-sm rounded-3xl border-2 border-green-600 bg-white p-8">
              <button
                type="button"
                onClick={() => {
                  setForgotPassword(false);
                  setForgotPasswordError("");
                  setLoginError(false);
                }}
                className="absolute top-3 right-4 text-2xl font-bold text-green-600 hover:text-green-800"
              >
                <FiX />
              </button>

              <div className="mb-5 text-center">
                <p className="text-3xl">🍵</p>
                <h2 className="text-xl font-bold text-green-800">
                  Forgot password
                </h2>
              </div>

              <form
                className="flex flex-col gap-3"
                onSubmit={handleForgotPassword}
              >
                <label className="text-sm font-bold text-green-800">
                  Email
                </label>
                <input
                  type="email"
                  onChange={(e) => {
                    setEmail(e.target.value);
                  }}
                  className="rounded-xl border-2 border-green-600 bg-green-50 px-3 py-2 text-green-900 outline-none focus:border-green-500"
                />

                {forgotPasswordError && (
                  <p className="rounded-lg bg-red-50 px-3 py-2 text-center text-sm text-red-600">
                    {forgotPasswordError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={forgotPasswordLoading} // takes in a boolean, so when loading button is disabled
                  className="mt-2 rounded-2xl bg-green-700 px-4 py-2 font-bold text-white flex flex-col items-center hover:bg-green-800"
                >
                  {forgotPasswordLoading ? (
                    <div className="animate-spin border-2  border-white border-t-transparent rounded-full w-6 h-6"></div>
                  ) : (
                    "Send reset link"
                  )}
                </button>
              </form>
            </div>
          </div>
        )}

        {forgotPasswordDone && (
          <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-green-100">
            <div className="max-w-sm rounded-3xl border-2 border-green-600 bg-white p-8 flex flex-col justify-center items-center">
              <h2 className="mt-3 text-2xl font-semibold text-green-800 text-center">
                Reset Link Sent. Please check your email
              </h2>
              <button
                type="button"
                onClick={() => {
                  setForgotPassword(false);
                  setForgotPasswordDone(false);
                }}
                className="mt-5 rounded-2xl border-2 border-green-600 px-6 py-2 font-bold text-green-700 hover:bg-green-50"
              >
                Back to login
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginComponent;
