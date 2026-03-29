import { createBrowserRouter } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import AuthTestPage from "./pages/AuthTestPage";
import SignUpPage from "./pages/SignUp";

import PatientDashboard from "./pages/patient/Dashboard";

import DoctorDashboard from "./pages/doctor/Dashboard";

import ResearcherDashboard from "./pages/researcher/Dashboard";
import ClaimResearch from "./pages/researcher/ClaimResearch";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: LandingPage,
  },
  {
    path: "/login/*",
    Component: LoginPage,
  },
  {
    path: "/sign-up",
    Component: SignUpPage,
  },
  {
    path: "/dashboard",
    Component: Dashboard,
  },
  {
    path: "/auth-test",
    Component: AuthTestPage,
  },
  {
    path: "/patient",
    Component: LandingPage,
  },
  { path: "/", Component: LandingPage, },
  { path: "/login", Component: LoginPage, },
  { path: "/dashboard", Component: Dashboard, },
  { path: "/auth-test", Component: AuthTestPage, },
  
  { path: "/patient", Component: PatientDashboard, },

  { path: "/doctor", Component: DoctorDashboard, },

  { path: "/researcher", Component: ResearcherDashboard, },
  { path: "/researcher/claim", Component: ClaimResearch, },
  { path: "/researcher/manage", Component: ResearcherDashboard, },
  { path: "/researcher/messages", Component: ResearcherDashboard, },
]);