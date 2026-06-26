import { useState, useRef, useEffect } from "react";
import "../App.css";
import { useNavigate, useSearchParams } from "react-router-dom";

interface ForgotPasswordComponentProps {}

const ForgotPasswordComponent: React.FC<ForgotPasswordComponentProps> = () => {
  const [newPassword1, setNewPassword1] = useState("");
  const [newPassword2, setNewPassword2] = useState("");
  const [queries, _] = useSearchParams();
  const token = queries.get("token");
  const [errorMessage, setErrorMessage] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showPassword1, setShowPassword1] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);

  const [validToken, setValidToken] = useState(false);

  const navigate = useNavigate();
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    fetch(`${BACKEND_URL}/auth/verify-forgot-password?token=${token}`)
      .then((response: Response) => response.json())
      .then((data: { verifyStatus: string }) => {
        if (data.verifyStatus === "success") {
          setValidToken(true);
        } else {
          setValidToken(false);
        }
      });
  }, []);

  function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    if (newPassword1 != newPassword2) {
      setErrorMessage("Passwords do not match");
      return;
    }

    fetch(`${BACKEND_URL}/auth/save-forgot-password?token=${token}`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        password: newPassword1,
      }),
    })
      .then((response: Response) => response.json())
      .then((data: { saveStatus: string; errorMessage: string }) => {
        if (data.saveStatus === "success") {
          setSaveSuccess(true);
        } else {
          setErrorMessage(data.errorMessage);
        }
      });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-100">
      <div className="w-full max-w-sm rounded-3xl border-2 border-green-600 bg-white p-8">
        {validToken ? (
          <>
            <div className="mb-6 text-center">
              <p className="text-4xl">🍵</p>
              <h1 className="text-3xl font-extrabold text-green-800">
                Reset password
              </h1>
            </div>

            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-green-800">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword1(!showPassword1)}
                    className="text-xs font-bold text-green-500 underline underline-offset-2"
                  >
                    {showPassword1 ? "Hide" : "Show"}
                  </button>
                </div>
                <input
                  type={showPassword1 ? "text" : "password"}
                  onChange={(e) => setNewPassword1(e.target.value)}
                  className="rounded-xl border-2 border-green-600 bg-green-50 px-3 py-2 text-green-900 outline-none focus:border-green-500"
                />
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-green-800">
                    Confirm Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword2(!showPassword2)}
                    className="text-xs font-bold text-green-500 underline underline-offset-2"
                  >
                    {showPassword2 ? "Hide" : "Show"}
                  </button>
                </div>
                <input
                  type={showPassword2 ? "text" : "password"}
                  onChange={(e) => setNewPassword2(e.target.value)}
                  className="rounded-xl border-2 border-green-600 bg-green-50 px-3 py-2 text-green-900 outline-none focus:border-green-500"
                />
              </div>

              {errorMessage && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-center text-sm text-red-600">
                  {errorMessage}
                </p>
              )}

              <button
                type="submit"
                className="mt-2 rounded-2xl bg-green-700 px-4 py-2 font-bold text-white hover:bg-green-800"
              >
                Submit
              </button>
            </form>

            {saveSuccess && (
              <div className="fixed inset-0 flex flex-col items-center justify-center bg-green-100">
                <div className="w-full max-w-sm rounded-3xl border-2 border-green-600 bg-white p-8 text-center">
                  <p className="text-xl font-extrabold text-green-800 mt-4">
                    Successfully changed password. You can now log in.
                  </p>
                  <button
                    className="mt-4 rounded-2xl bg-green-700 px-4 py-2 font-bold text-white hover:bg-green-800"
                    onClick={() => navigate("/login")}
                  >
                    Login
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col justify-center items-center">
            <p className="text-center text-3xl font-semibold text-green-800">
              Invalid reset password link. Please try again
            </p>
            <button
              className="mt-4 rounded-2xl bg-green-700 px-4 py-2 font-bold text-white hover:bg-green-800"
              onClick={() => navigate("/login")}
            >
              Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordComponent;
