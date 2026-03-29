import { createBrowserRouter } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import AuthTestPage from "./pages/AuthTestPage";
import SignUpPage from "./pages/SignUp";
import ChatbotPage from "./pages/Patient_Chatbot";


import PatientDashboard from "./pages/patient/Dashboard";

import DoctorDashboard from "./pages/doctor/Dashboard";

import ResearcherDashboard from "./pages/researcher/Dashboard";
import ClaimResearch from "./pages/researcher/ClaimResearch";
import MyTrialsPage from "./pages/researcher/MyTrialsPage";
import PatientMessagesPage from "./pages/PatientMessagesPage";
import ChatBotPage from "./pages/Patient_Chatbot";

export const router = createBrowserRouter([
  { path: "/login/*", Component: LoginPage, },
  { path: "/sign-up", Component: SignUpPage, },
  { path: "/dashboard", Component: Dashboard, },

  { path: "/", Component: LandingPage, },
  { path: "/auth-test", Component: AuthTestPage, },
  
  { path: "/patient", Component: PatientDashboard, },
  { path: "/patient/messages", Component: PatientMessagesPage, },
  {path: "/patient-chatbot", Component: ChatBotPage},

  { path: "/doctor", Component: DoctorDashboard, },

  { path: "/researcher", Component: ResearcherDashboard, },
  { path: "/researcher/claim", Component: ClaimResearch, },
  { path: "/researcher/manage", Component: MyTrialsPage, },
  { path: "/researcher/messages", Component: ResearcherDashboard, },
]);