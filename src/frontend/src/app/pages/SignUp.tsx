import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSignUp } from "@clerk/clerk-react";

type Role = "user" | "doctor" | "researcher";

export default function SignUpPage() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    username: "",
    emailAddress: "",
    password: "",
    role: "user" as Role,
  });

  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const onChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!isLoaded) return;

    try {
      await signUp.create({
        emailAddress: form.emailAddress,
        password: form.password,
        firstName: form.firstName,
        lastName: form.lastName,
        username: form.username,
        unsafeMetadata: {
          role: form.role,
        },
      });

      await signUp.prepareEmailAddressVerification({
        strategy: "email_code",
      });

      setPendingVerification(true);
    } catch (err: any) {
      setError(err?.errors?.[0]?.longMessage || "Could not sign up.");
    }
  };

  const onVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!isLoaded) return;

    try {
      const result = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        const redirectByRole: Record<Role, string> = {
            user: "/patient-chatbot",
            doctor: "/doctor",
            researcher: "/researcher",
        };

        navigate(redirectByRole[form.role]);
      }

      if (result.status === "missing_requirements") {
        const missing = result.missingFields?.length
          ? `missing: ${result.missingFields.join(", ")}`
          : "";

        const unverified = result.unverifiedFields?.length
          ? `unverified: ${result.unverifiedFields.join(", ")}`
          : "";

        const required = result.requiredFields?.length
          ? `required: ${result.requiredFields.join(", ")}`
          : "";

        setError(
          [missing, unverified, required].filter(Boolean).join(" | ") ||
            "Verification worked, but the sign-up still has incomplete requirements."
        );
        return;
      }

      setError(`Verification returned status: ${result.status}`);
    } catch (err: any) {
      console.error(err);
      setError(err?.errors?.[0]?.longMessage || "Invalid verification code.");
    }
  };

  return (
    <div className="min-h-screen bg-[#EFFAFF]">
      <nav className="border-b border-[#2FCED6]/30 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/" className="text-lg font-semibold text-[#296870]">
            Aura
          </Link>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="rounded-xl border border-[#2FCED6]/40 px-4 py-2 text-sm font-medium text-[#296870] transition hover:bg-[#EFFAFF]"
            >
              Go back
            </button>

            <Link
              to="/login"
              className="rounded-xl bg-[#0A7F8A] px-4 py-2 text-sm font-medium text-[#EFFAFF] transition hover:bg-[#037682]"
            >
              Sign in
            </Link>
          </div>
        </div>
      </nav>

      <div className="mx-auto flex min-h-[calc(100vh-73px)] max-w-6xl items-center justify-center px-6 py-12">
        <div className="grid w-full overflow-hidden rounded-3xl border border-[#2FCED6]/30 bg-white shadow-2xl md:grid-cols-2">
          <div className="hidden flex-col justify-between bg-linear-to-br from-[#296870] via-[#0A7F8A] to-[#037682] p-10 text-[#EFFAFF] md:flex">
            <div>
              <p className="mb-3 text-sm uppercase tracking-[0.25em] text-[#EFFAFF]/70">
                Aura
              </p>
              <h1 className="max-w-md text-4xl font-semibold leading-tight">
                Create your account and personalize your access.
              </h1>
              <p className="mt-4 max-w-md text-sm leading-6 text-[#EFFAFF]/80">
                Join as a user, doctor, or researcher and continue with the same
                Clerk-based auth flow.
              </p>
            </div>

            <div className="space-y-3 text-sm text-[#EFFAFF]/85">
              <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                Secure authentication with email verification
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                Role-aware onboarding for different account types
              </div>
            </div>
          </div>

          <div className="bg-white p-6 sm:p-10">
            {!pendingVerification ? (
              <>
                <div className="mb-8">
                  <h2 className="text-3xl font-semibold text-[#296870]">
                    Sign up
                  </h2>
                  <p className="mt-2 text-sm text-[#296870]/70">
                    Create your account to get started.
                  </p>
                </div>

                <form onSubmit={onSubmit} className="space-y-5">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="firstName"
                        className="mb-2 block text-sm text-[#296870]"
                      >
                        First name
                      </label>
                      <input
                        id="firstName"
                        name="firstName"
                        type="text"
                        value={form.firstName}
                        onChange={onChange}
                        required
                        className="w-full rounded-2xl border border-[#2FCED6]/40 bg-[#EFFAFF] px-4 py-3 text-[#296870] outline-none placeholder:text-[#296870]/35 focus:border-[#0A7F8A] focus:ring-2 focus:ring-[#2FCED6]/30"
                        placeholder="Caio"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="lastName"
                        className="mb-2 block text-sm text-[#296870]"
                      >
                        Last name
                      </label>
                      <input
                        id="lastName"
                        name="lastName"
                        type="text"
                        value={form.lastName}
                        onChange={onChange}
                        required
                        className="w-full rounded-2xl border border-[#2FCED6]/40 bg-[#EFFAFF] px-4 py-3 text-[#296870] outline-none placeholder:text-[#296870]/35 focus:border-[#0A7F8A] focus:ring-2 focus:ring-[#2FCED6]/30"
                        placeholder="Bahlis"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="username"
                      className="mb-2 block text-sm text-[#296870]"
                    >
                      Username
                    </label>
                    <input
                      id="username"
                      name="username"
                      type="text"
                      value={form.username}
                      onChange={onChange}
                      required
                      className="w-full rounded-2xl border border-[#2FCED6]/40 bg-[#EFFAFF] px-4 py-3 text-[#296870] outline-none placeholder:text-[#296870]/35 focus:border-[#0A7F8A] focus:ring-2 focus:ring-[#2FCED6]/30"
                      placeholder="caiobahlis"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="emailAddress"
                      className="mb-2 block text-sm text-[#296870]"
                    >
                      Email
                    </label>
                    <input
                      id="emailAddress"
                      name="emailAddress"
                      type="email"
                      value={form.emailAddress}
                      onChange={onChange}
                      required
                      className="w-full rounded-2xl border border-[#2FCED6]/40 bg-[#EFFAFF] px-4 py-3 text-[#296870] outline-none placeholder:text-[#296870]/35 focus:border-[#0A7F8A] focus:ring-2 focus:ring-[#2FCED6]/30"
                      placeholder="you@example.com"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="password"
                      className="mb-2 block text-sm text-[#296870]"
                    >
                      Password
                    </label>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      value={form.password}
                      onChange={onChange}
                      required
                      className="w-full rounded-2xl border border-[#2FCED6]/40 bg-[#EFFAFF] px-4 py-3 text-[#296870] outline-none placeholder:text-[#296870]/35 focus:border-[#0A7F8A] focus:ring-2 focus:ring-[#2FCED6]/30"
                      placeholder="Create a strong password"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="role"
                      className="mb-2 block text-sm text-[#296870]"
                    >
                      Account type
                    </label>
                    <select
                      id="role"
                      name="role"
                      value={form.role}
                      onChange={onChange}
                      className="w-full rounded-2xl border border-[#2FCED6]/40 bg-[#EFFAFF] px-4 py-3 text-[#296870] outline-none focus:border-[#0A7F8A] focus:ring-2 focus:ring-[#2FCED6]/30"
                    >
                      <option value="user">User</option>
                      <option value="doctor">Doctor</option>
                      <option value="researcher">Researcher</option>
                    </select>
                  </div>

                  {error ? (
                    <div className="rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
                      {error}
                    </div>
                  ) : null}

                  <button
                    type="submit"
                    disabled={!isLoaded}
                    className="w-full rounded-2xl bg-[#0A7F8A] px-4 py-3 font-medium text-[#EFFAFF] transition hover:bg-[#037682] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Create account
                  </button>
                </form>

                <p className="mt-6 text-center text-sm text-[#296870]/70">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="font-medium text-[#037682] underline underline-offset-4"
                  >
                    Sign in
                  </Link>
                </p>
              </>
            ) : (
              <>
                <div className="mb-8">
                  <h2 className="text-3xl font-semibold text-[#296870]">
                    Verify your email
                  </h2>
                  <p className="mt-2 text-sm text-[#296870]/70">
                    Enter the code sent to your email address.
                  </p>
                </div>

                <form onSubmit={onVerify} className="space-y-5">
                  <div>
                    <label
                      htmlFor="code"
                      className="mb-2 block text-sm text-[#296870]"
                    >
                      Verification code
                    </label>
                    <input
                      id="code"
                      name="code"
                      type="text"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      required
                      className="w-full rounded-2xl border border-[#2FCED6]/40 bg-[#EFFAFF] px-4 py-3 text-[#296870] outline-none placeholder:text-[#296870]/35 focus:border-[#0A7F8A] focus:ring-2 focus:ring-[#2FCED6]/30"
                      placeholder="123456"
                    />
                  </div>

                  {error ? (
                    <div className="rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
                      {error}
                    </div>
                  ) : null}

                  <button
                    type="submit"
                    disabled={!isLoaded}
                    className="w-full rounded-2xl bg-[#0A7F8A] px-4 py-3 font-medium text-[#EFFAFF] transition hover:bg-[#037682] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Verify email
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}