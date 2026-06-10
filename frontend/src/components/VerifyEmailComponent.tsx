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
    if (hasFetched.current)
        return;
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
        <h1 className="text-5xl"> Verifying your email...</h1>
      )}
      {verifySuccess && (
        <div className="min-h-screen flex flex-col items-center justify-center">
          <h1 className="text-3xl">
            Your email has been verified, you can now login
          </h1>
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
      {verifyFail && (
        <div className="flex flex-col items-center">
          <h1 className="text-5xl">
            {" "}
            Email verification failed. Please register again
          </h1>
          <button
            onClick={() => {
              navigate("/register");
            }}
          >
            Register
          </button>
        </div>
      )}
    </>
  );
};

export default VerifyEmailComponent;
