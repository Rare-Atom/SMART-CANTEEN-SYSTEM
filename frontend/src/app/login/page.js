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
        <div className="loginCardPanel">
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

          <div style={{ display: "flex", gap: 6, marginBottom: 24 }}>
            <button onClick={() => switchMode("login")} type="button">
              Sign in
            </button>
            <button onClick={() => switchMode("register")} type="button">
              Create account
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {mode === "register" && (
              <input value={name} onChange={(e) => setName(e.target.value)} required />
            )}

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {mode === "register" && role === "staff" && (
              <input
                value={staffCode}
                onChange={(e) => setStaffCode(e.target.value)}
                required
              />
            )}

            {error && <div>{error}</div>}

            <button type="submit" disabled={loading}>
              {loading ? "Please wait…" : "Continue"}
            </button>
          </form>
        </div>

        <div className="loginVisualPanel">
          <Image
            src="/hero-snacks-drinks.png"
            alt="Snacks"
            width={400}
            height={400}
          />
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