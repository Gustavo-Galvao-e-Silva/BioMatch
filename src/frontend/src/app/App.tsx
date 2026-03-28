import { ClerkProvider } from "@clerk/clerk-react";
import { RouterProvider } from "react-router";
import { router } from "./routes";

// Chave pública do Clerk - substitua pela sua chave real
const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || "";

export default function App() {
  // Se não houver chave do Clerk configurada, renderiza sem o ClerkProvider
  if (!CLERK_PUBLISHABLE_KEY || CLERK_PUBLISHABLE_KEY.length < 10) {
    return <RouterProvider router={router} />;
  }

  return (
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
      <RouterProvider router={router} />
    </ClerkProvider>
  );
}