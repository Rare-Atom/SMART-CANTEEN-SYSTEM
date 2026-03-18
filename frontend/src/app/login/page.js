"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialRole = searchParams.get("role") || "student";

  const [role, setRole] = useState(initialRole);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      // 🔹 Step 1: Try login
      let res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, role }),
      });

      let data = await res.json();

      // 🔴 If user not found → REGISTER
      if (data.message === "User not found") {
        console.log("Creating new user...");

        const registerRes = await fetch("http://localhost:5000/api/auth/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password, role }),
        });

        const registerData = await registerRes.json();

        alert("Account created! Please login again.");
        return;
      }

      // 🔴 Wrong password
      if (data.message === "Wrong password") {
        alert("Incorrect password");
        return;
      }

      // ✅ Success
      if (res.ok) {
        localStorage.setItem("token", data.token);

        if (role === "staff") {
          router.push("/staff/orders");
        } else {
          router.push("/menu");
        }
      }

    } catch (error) {
      console.error(error);
      alert("Server error");
    }
  };

  return (
    <div className="loginScreen">
      <div className="loginShell">
        {/* LEFT PANEL */}
        <div className="loginCardPanel">
          {/* Role Tabs */}
          <div className="loginRoleTabs">
            <button
              className={`loginRoleTab ${role === "student" ? "active" : ""}`}
              onClick={() => setRole("student")}
              type="button"
            >
              Student Login
            </button>

            <button
              className={`loginRoleTab ${role === "staff" ? "active" : ""}`}
              onClick={() => setRole("staff")}
              type="button"
            >
              Staff Login
            </button>
          </div>

          {/* Text */}
          <div className="loginCopy">
            <h1>
              Good food starts
              <br />
              here.
            </h1>
            <p>
              Sign in, choose your slot, and move through a premium campus
              canteen experience without the queue.
            </p>
          </div>

          {/* FORM */}
          <form className="loginFormWrap" onSubmit={handleLogin}>
            <input
              className="loginInput"
              type="text"
              placeholder={
                role === "staff"
                  ? "Staff ID / Email"
                  : "Register No / Email"
              }
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

            <button className="loginMainBtn" type="submit">
              {role === "staff"
                ? "Enter Staff Dashboard"
                : "Start Ordering"}
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