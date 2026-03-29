
import { useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";

export type Role =  "doctor" | "user" | "researcher"


export default function PostLoginRedirect() {
  const { isLoaded, isSignedIn, user } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user) return;

    const role = user.unsafeMetadata?.role as Role | undefined;

    switch (role) {
      case "doctor":
        navigate("/doctor", { replace: true });
        break;
      case "researcher":
        navigate("/research", { replace: true });
        break;
      case "user":
      default:
        navigate("/patient-chatbot", { replace: true });
        break;
    }
  }, [isLoaded, isSignedIn, user, navigate]);

  return <div>Redirecting...</div>;
}