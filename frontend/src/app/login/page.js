"use client";

import { Suspense, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { setToken } from "@/lib/auth";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5001";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialRole = searchParams.get("role") || "student";
  const nextPath = searchParams.get("next") || null;

  const [mode, setMode] = useState("login");
  const [role, setRole] = useState(initialRole);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [staffCode, setStaffCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function resetForm() {
    setName("");
    setEmail("");
    setPassword("");
    setStaffCode("");
    setError("");
  }

  function switchMode(newMode) {
    setMode(newMode);
    resetForm();
  }

  function switchRole(newRole) {
    setRole(newRole);
    resetForm();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "register") {
        const res = await fetch(`${API_BASE}/api/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            email,
            password,
            role,
            staffCode: staffCode || undefined,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.message || "Registration failed");
          return;
        }

        await doLogin(email, password);
      } else {
        await doLogin(email, password);
      }
    } catch {
      setError("Could not reach the server. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }

  async function doLogin(emailVal, passwordVal) {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: emailVal, password: passwordVal }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.message || "Login failed");
      return;
    }

    setToken(data.token);

    if (nextPath) {
      router.push(nextPath);
    } else if (data.role === "staff") {
      router.push("/staff/orders");
    } else {
      router.push("/menu");
    }
  }

  return (
    <div className="loginScreen">
      <div className="loginShell">
        {/* LEFT PANEL */}
        <div className="loginCardPanel">

          {/* Role tabs */}
          <div className="loginRoleTabs">
            <button
              className={`loginRoleTab ${role === "student" ? "active" : ""}`}
              onClick={() => switchRole("student")}
              type="button"
            >
              Student
            </button>
            <button
              className={`loginRoleTab ${role === "staff" ? "active" : ""}`}
              onClick={() => switchRole("staff")}
              type="button"
            >
              Staff
            </button>
          </div>

          {/* Mode toggle */}
          <div style={{ display: "flex", gap: 6, marginBottom: 24 }}>
            <button
              type="button"
              onClick={() => switchMode("login")}
              className={mode === "login" ? "activeBtn" : ""}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => switchMode("register")}
              className={mode === "register" ? "activeBtn" : ""}
            >
              Create account
            </button>
          </div>

          {/* Copy */}
          <div className="loginCopy">
            <h1>
              Good food starts
              <br />
              here.
            </h1>
            <p>
              {mode === "register"
                ? "Create your account and start ordering in seconds."
                : "Sign in, choose your slot, and move through a premium campus canteen experience without the queue."}
            </p>
          </div>

          {/* Form */}
          <form className="loginFormWrap" onSubmit={handleSubmit}>
            {mode === "register" && (
              <input
                className="loginInput"
                type="text"
                placeholder="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            )}

            <input
              className="loginInput"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <input
              className="loginInput"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {mode === "register" && role === "staff" && (
              <input
                className="loginInput"
                type="password"
                placeholder="Staff code"
                value={staffCode}
                onChange={(e) => setStaffCode(e.target.value)}
                required
              />
            )}

            {error && <div className="errorBox">{error}</div>}

            <button className="loginMainBtn" type="submit" disabled={loading}>
              {loading ? "Please wait…" : "Continue"}
            </button>
          </form>
        </div>

        {/* RIGHT PANEL */}
        <div className="loginVisualPanel">
          <div className="loginVisualCopy">
            <h2>Fresh picks. Faster pickup.</h2>
            <p>Browse, choose, and order without the queue.</p>
          </div>

          <div className="loginFoodShowcase">
            <Image
              src="/hero-snacks-drinks.png"
              alt="Food"
              width={400}
              height={400}
              priority
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}