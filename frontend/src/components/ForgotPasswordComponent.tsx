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

  const navigate = useNavigate();
  function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

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
      .then((data: { saveStatus: string, errorMessage: string }) => {
        if (data.saveStatus === "success") {
          setSaveSuccess(true);
        } else {
          setErrorMessage(data.errorMessage);
        }
      });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-sm rounded-xl border border-gray-200 bg-white p-6 shadow-lg">
        <h1 className="mb-6 text-center text-2xl font-bold text-gray-800">
          Reset password
        </h1>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
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
                setNewPassword1(e.target.value);
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
                setNewPassword2(e.target.value);
              }}
              className="rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
          </div>

          {errorMessage && (
            <p className="text-center text-sm text-red-600">{errorMessage}</p>
          )}

          <button
            type="submit"
            className="mt-1 rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
          >
            Submit
          </button>
        </form>

        {saveSuccess && (
          <div className="fixed inset-0 flex flex-col items-center justify-center bg-white">
            <p className="text-green-600 text-center text-4xl">
              Succesfully changed password. You can now log in.
            </p>
            <button
              className="text-lg mt-4 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
              onClick={() => {
                navigate("/login");
              }}
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


