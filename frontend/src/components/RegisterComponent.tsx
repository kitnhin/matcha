import { useState } from "react";
import "../App.css";
import NameInputComponent from "./shared/NameInputComponent";

interface RegisterComponentProps {}

const RegisterComponent: React.FC<RegisterComponentProps> = ({}) => {
  const [email, setEmail] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [password1, setPassword1] = useState<string>("");
  const [password2, setPassword2] = useState<string>("");
  const [showPassword1, setShowPassword1] = useState<boolean>(false);
  const [showPassword2, setShowPassword2] = useState<boolean>(false);
  const [registerError, setRegisterError] = useState<string>("");
  const [registerDone, setRegisterDone] = useState<boolean>(false);
  const [registerLoading, setRegisterLoading] = useState<boolean>(false);

  function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setRegisterLoading(true);

    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

    if (password1 !== password2) {
      setRegisterError("Password mismatch");
      return;
    }

    fetch(`${BACKEND_URL}/auth/register`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email,
        username: username,
        first_name: firstName,
        last_name: lastName,
        password: password1,
      }),
    })
      .then((response: Response) => response.json())
      .then((data: { registerStatus: string; errorMessage: string }) => {
        if (data.registerStatus === "success") {
          setRegisterDone(true);
        } else {
          setRegisterError(
            data.errorMessage || "An error occurred during registration."
          );
        }
        setRegisterLoading(false);
      });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-100">
      <div className="w-full max-w-sm rounded-3xl border-2 border-green-600 bg-white p-8 shadow-xl">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-green-800">Register</h1>
        </div>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-bold text-green-800">Email</label>
            <input
              type="text"
              onChange={(e) => {
                setEmail(e.target.value);
              }}
              className="rounded-xl border-2 border-green-600 bg-green-50 px-3 py-2 text-green-900 outline-none focus:border-green-500"
            />
          </div>

          <NameInputComponent
            setUsername={setUsername}
            setFirstName={setFirstName}
            setLastName={setLastName}
            username={username}
            first_name={firstName}
            last_name={lastName}
          />

          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-green-800">
                Password
              </label>
              <button
                type="button"
                onClick={() => {
                  setShowPassword1(!showPassword1);
                }}
                className="text-xs font-bold text-green-500 underline underline-offset-2"
              >
                {showPassword1 ? "Hide" : "Show"}
              </button>
            </div>
            <input
              type={showPassword1 ? "text" : "password"}
              onChange={(e) => {
                setPassword1(e.target.value);
              }}
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
                onClick={() => {
                  setShowPassword2(!showPassword2);
                }}
                className="text-xs font-bold text-green-500 underline underline-offset-2"
              >
                {showPassword2 ? "Hide" : "Show"}
              </button>
            </div>
            <input
              type={showPassword2 ? "text" : "password"}
              onChange={(e) => {
                setPassword2(e.target.value);
              }}
              className="rounded-xl border-2 border-green-600 bg-green-50 px-3 py-2 text-green-900 outline-none focus:border-green-500"
            />
          </div>

          {registerError !== "" && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-center text-sm text-red-600">
              {registerError}
            </p>
          )}

          <button
            type="submit"
            disabled={registerLoading}
            className="mt-2 rounded-2xl bg-green-700 px-4 py-2 font-bold text-white hover:bg-green-800 flex flex-col items-center"
          >
            {registerLoading ? (
              <div className="animate-spin border-2  border-white border-t-transparent rounded-full w-6 h-6"></div>
            ) : (
              "Register"
            )}
          </button>
        </form>

        {registerDone && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-green-100">
            <div className="max-w-sm rounded-3xl border-2 border-green-600 bg-white p-8 flex flex-col justify-center items-center gap-4">
              <h2 className="text-2xl font-semibold text-green-800 text-center">
                Registration successful!
              </h2>
              <p className="text-md text-green-800 text-center">
                Please click the link in the email to activate your account.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegisterComponent;
