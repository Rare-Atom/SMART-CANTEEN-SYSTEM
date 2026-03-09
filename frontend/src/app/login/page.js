"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const role = useMemo(() => searchParams.get("role") || "student", [searchParams]);

  const goNext = () => {
    if (role === "staff") {
      window.location.href = "/staff/orders";
    } else {
      window.location.href = "/menu";
    }
  };

  return (
    <div className="authShell">
      <div className="authGrid">
        <div className="authCard">
          <div className="authTabs">
            <a
              href="/login?role=student"
              className={`authTab ${role === "student" ? "active" : ""}`}
            >
              Student Login
            </a>
            <a
              href="/login?role=staff"
              className={`authTab ${role === "staff" ? "active" : ""}`}
            >
              Staff Login
            </a>
          </div>

          <h1 className="authTitle">
            {role === "staff" ? "Manage the rush with ease." : "Good food starts here."}
          </h1>

          <p className="authSub">
            {role === "staff"
              ? "Take control of incoming orders, approve quickly, and keep the counter moving smoothly."
              : "Sign in, grab your slot, and get your campus favourites without the queue."}
          </p>

          <div className="authForm">
            <input
              className="authInput"
              placeholder={role === "staff" ? "Staff ID / Email" : "Register No / Email"}
            />
            <input
              className="authInput"
              type="password"
              placeholder="Password"
            />
            <button className="authButton" onClick={goNext}>
              {role === "staff" ? "Enter Staff Panel" : "Start Ordering"}
            </button>
          </div>
        </div>

        <div className="authVisual">
          <div>
            <h3>
              {role === "staff" ? "Smart control. Faster service." : "Fresh picks. Faster pickup."}
            </h3>
            <p>
              {role === "staff"
                ? "Approve, prepare, and serve with a clean dashboard built for busy canteen hours."
                : "Browse, choose, and order in a premium canteen flow designed for campus life."}
            </p>
          </div>

          <div className="authImage">
            <Image
              src={role === "staff" ? "/login-food.png" : "/hero-food.png"}
              alt="Food visual"
              fill
              style={{ objectFit: "cover" }}
              priority
            />
          </div>
        </div>
      </div>
    </div>
  );
}