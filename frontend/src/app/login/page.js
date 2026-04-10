"use client";

import { useState, Suspense } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { setToken } from "@/lib/auth";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5001";

function LoginPageInner() {
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
        const url = `${API_BASE}/api/auth/register`;

        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password, role, staffCode: staffCode || undefined }),
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
    } catch (err) {
      setError("Could not reach the server. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }

  async function doLogin(emailVal, passwordVal) {
    const url = `${API_BASE}/api/auth/login`;

    const res = await fetch(url, {
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
            <button
              type="button"
              onClick={() => switchMode("login")}
              style={{
                flex: 1,
                padding: "9px 0",
                borderRadius: 12,
                fontWeight: 800,
                fontSize: 14,
                cursor: "pointer",
                border: "1.5px solid",
                borderColor: mode === "login" ? "var(--brand)" : "rgba(0,0,0,0.10)",
                background: mode === "login" ? "var(--brand-soft)" : "transparent",
                color: mode === "login" ? "var(--brand)" : "var(--muted)",
              }}
            >
              Sign in
            </button>

            <button
              type="button"
              onClick={() => switchMode("register")}
              style={{
                flex: 1,
                padding: "9px 0",
                borderRadius: 12,
                fontWeight: 800,
                fontSize: 14,
                cursor: "pointer",
                border: "1.5px solid",
                borderColor: mode === "register" ? "var(--brand)" : "rgba(0,0,0,0.10)",
                background: mode === "register" ? "var(--brand-soft)" : "transparent",
                color: mode === "register" ? "var(--brand)" : "var(--muted)",
              }}
            >
              Create account
            </button>
          </div>

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

          <form className="loginFormWrap" onSubmit={handleSubmit}>
            {mode === "register" && (
              <input className="loginInput" type="text" placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} />
            )}

            <input className="loginInput" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />

            <input className="loginInput" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />

            {error && <div style={{ color: "red" }}>{error}</div>}

            <button className="loginMainBtn" type="submit">
              {loading ? "Please wait…" : "Continue"}
            </button>
          </form>
        </div>

        {/* RIGHT PANEL */}
        <div className="loginVisualPanel">
  <div className="loginVisualCopy">
    <h2>Fresh picks. Faster pickup.</h2>
    <p>
      Browse, choose, and order in a polished canteen flow designed for
      busy campus life.
    </p>
  </div>

  <div className="loginFoodShowcase">
    <div className="loginFoodPrimary">
      <Image
        src="/hero-snacks-drinks.png"
        alt="Snacks and drinks"
        width={440}
        height={440}
        className="loginFoodMainImage"
        priority
      />
    </div>

    <div className="loginFoodMini loginFoodMiniLeft">
      <Image
        src="/hero-veg-thali.png"
        alt="Veg platter"
        width={180}
        height={180}
        className="loginMiniImage"
      />
    </div>

    <div className="loginFoodMini loginFoodMiniRight">
      <Image
        src="/hero-nonveg-thali.png"
        alt="Non veg platter"
        width={180}
        height={180}
        className="loginMiniImage"
      />
    </div>
  </div>
</div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageInner />
    </Suspense>
  );
}