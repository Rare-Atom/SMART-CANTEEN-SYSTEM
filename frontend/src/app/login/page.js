"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRole = searchParams.get("role") || "student";
  const [role, setRole] = useState(initialRole);

  const handleLogin = (e) => {
    e.preventDefault();

    if (role === "staff") {
      router.push("/staff/orders");
    } else {
      router.push("/menu");
    }
  };

  return (
    <div className="loginScreen">
      <div className="loginShell">
        <div className="loginCardPanel">
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

          <form className="loginFormWrap" onSubmit={handleLogin}>
            <input
              className="loginInput"
              type="text"
              placeholder={
                role === "staff" ? "Staff ID / Email" : "Register No / Email"
              }
            />
            <input
              className="loginInput"
              type="password"
              placeholder="Password"
            />
            <button className="loginMainBtn" type="submit">
              {role === "staff" ? "Enter Staff Dashboard" : "Start Ordering"}
            </button>
          </form>
        </div>

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