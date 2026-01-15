"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useAuthActions, useAuthToken } from "@convex-dev/auth/react";
import { useState, useEffect } from "react";

export default function DevPage() {
  const { signIn, signOut } = useAuthActions();
  const token = useAuthToken();
  const isAuthed = token !== null;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [hasEnsuredUser, setHasEnsuredUser] = useState(false);

  const user = useQuery(api.users.getMe);
  const ensureUserOnLogin = useMutation(api.users.ensureUserOnLogin);
  const makeMeAdmin = useMutation(api.users.makeMeAdmin);

  // Ensure user exists after login
  useEffect(() => {
    if (isAuthed && !user && !hasEnsuredUser) {
      void ensureUserOnLogin().then(() => {
        setHasEnsuredUser(true);
      });
    } else if (user) {
      setHasEnsuredUser(true);
    }
  }, [isAuthed, user, hasEnsuredUser, ensureUserOnLogin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSigningIn(true);
    try {
      const formData = new FormData();
      formData.set("email", email);
      formData.set("password", password);
      formData.set("flow", flow);
      await signIn("password", formData);
      setHasEnsuredUser(false); // Reset to trigger ensureUserOnLogin
    } catch (error) {
      console.error("Auth error:", error);
      alert("Authentication failed. Check console for details.");
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    setHasEnsuredUser(false);
  };

  const handleMakeAdmin = async () => {
    try {
      await makeMeAdmin();
      alert("You are now an admin!");
    } catch (error) {
      console.error("Make admin error:", error);
      alert("Failed to make admin. Check console for details.");
    }
  };

  return (
    <div className="min-h-screen p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">RoadPal Dev Page</h1>

      {!isAuthed || !user ? (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Not signed in</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 border rounded"
                placeholder="your@email.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="block mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2 border rounded"
                placeholder="Password (min 8 characters)"
              />
            </div>
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={isSigningIn}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {flow === "signIn" ? "Sign In" : "Sign Up"}
              </button>
              <button
                type="button"
                onClick={() => setFlow(flow === "signIn" ? "signUp" : "signIn")}
                className="px-4 py-2 border rounded hover:bg-gray-100"
              >
                {flow === "signIn" ? "Switch to Sign Up" : "Switch to Sign In"}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Signed in</h2>
          <div className="bg-gray-100 p-4 rounded space-y-2">
            <p>
              <strong>User ID:</strong> {user._id}
            </p>
            <p>
              <strong>Email:</strong> {user.email || "N/A"}
            </p>
            <p>
              <strong>Name:</strong> {user.name || "N/A"}
            </p>
            <p>
              <strong>Role:</strong>{" "}
              <span className="font-semibold">{user.role}</span>
            </p>
            <p>
              <strong>Created:</strong>{" "}
              {new Date(user.createdAt).toLocaleString()}
            </p>
            <p>
              <strong>Updated:</strong>{" "}
              {new Date(user.updatedAt).toLocaleString()}
            </p>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleMakeAdmin}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              Make me admin
            </button>
            <button
              onClick={handleSignOut}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
