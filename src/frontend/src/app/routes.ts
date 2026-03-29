import { createBrowserRouter } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import AuthTestPage from "./pages/AuthTestPage";
import SignUpPage from "./pages/SignUp";

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
]);