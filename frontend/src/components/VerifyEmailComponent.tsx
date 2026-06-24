import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";
import { handleLogout } from "../utils/auth";
import { useSearchParams } from "react-router-dom";
import { useRef } from "react";

interface VerifyEmailProps {}

const VerifyEmailComponent: React.FC<VerifyEmailProps> = ({}) => {
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const navigate = useNavigate();
  const [verifySuccess, setVerifySuccess] = useState<boolean>(false);
  const [verifyFail, setVerifyFail] = useState<boolean>(false);
  const [queries, _] = useSearchParams();
  const token = queries.get("token");

  const hasFetched = useRef(false); // to prevent useEffect from running multiple times in dev mode (from Claude)
  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    fetch(`${BACKEND_URL}/auth/verify?token=${token}`)
      .then((response: Response) => response.json())
      .then((data: { verificationStatus: string }) => {
        // console.log(data)
        if (data.verificationStatus === "success") {
          setVerifySuccess(true);
        } else {
          setVerifyFail(true);
        }
      });
  }, []);

  return (
    <>
      {!verifySuccess && !verifyFail && (
        <h1 className="text-5xl text-green-800 font-bold">
          {" "}
          Verifying your email...
        </h1>
      )}
      {verifySuccess && (
        <div className="min-h-screen flex flex-col items-center justify-center bg-green-100">
          <div className="border-2 border-green-600 bg-white p-6 flex flex-col gap-7 rounded-xl">
            <h1 className="text-3xl text-green-800 text-center">
              Your email has been verified, you can now login
            </h1>
            <button
              className="self-center text-lg rounded-2xl bg-green-700 px-4 py-2 font-bold text-white hover:bg-green-800"
              onClick={() => {
                navigate("/login");
              }}
            >
              Login
            </button>
          </div>
        </div>
      )}
      {verifyFail && (
        <div className="min-h-screen flex flex-col items-center justify-center bg-green-100">
        <div className="border-2 border-green-600 bg-white p-6 flex flex-col gap-7 rounded-xl">
          <h1 className="text-3xl text-green-800">
            Registration failed, please register again
          </h1>
          <button
            className="self-center text-lg rounded-2xl bg-green-700 px-4 py-2 font-bold text-white hover:bg-green-800"
            onClick={() => {
              navigate("/register");
            }}
          >
            Register
          </button>
        </div>
      </div>
      )}
    </>
  );
};

export default VerifyEmailComponent;
