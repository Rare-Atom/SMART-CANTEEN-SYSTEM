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
    <div className="authShell authShellRefined">
      <div className="authGrid authGridRefined">
        <div className="authCard authCardRefined">
          <div className="authTabs authTabsRefined">
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

          <div className="authContentBlock">
            <div className="authKicker">
              {role === "staff" ? "Counter operations" : "Fast campus ordering"}
            </div>

            <h1 className="authTitle">
              {role === "staff" ? "Keep the queue moving." : "Good food starts here."}
            </h1>

            <p className="authSub">
              {role === "staff"
                ? "Open incoming orders, respond quickly, and update preparation status without confusion."
                : "Sign in, choose your slot, and order your campus favourites with less waiting and smoother pickup."}
            </p>
          </div>

          <div className="authForm authFormRefined">
            <div className="authField">
              <label className="authLabel">
                {role === "staff" ? "Staff ID / Email" : "Register No / Email"}
              </label>
              <input
                className="authInput"
                placeholder={role === "staff" ? "Enter staff ID or email" : "Enter register number or email"}
              />
            </div>

            <div className="authField">
              <label className="authLabel">Password</label>
              <input
                className="authInput"
                type="password"
                placeholder="Enter password"
              />
            </div>

            <button className="authButton authButtonRefined" onClick={goNext}>
              {role === "staff" ? "Open Staff Dashboard" : "Start Ordering"}
            </button>

            <div className="authHint">
              {role === "staff"
                ? "Use your staff access to manage approvals, preparation, and pickup flow."
                : "Your slot, order status, and payment window will stay visible after login."}
            </div>
          </div>
        </div>

        <div className="authVisual authVisualRefined">
          <div className="authVisualTop">
            <div className="authVisualKicker">
              {role === "staff" ? "Built for quick decisions" : "Fresh picks. Faster pickup."}
            </div>

            <h3>
              {role === "staff"
                ? "Smarter control during rush hours."
                : "Browse, choose, and collect without the crowd."}
            </h3>

            <p>
              {role === "staff"
                ? "Approve orders faster, track status clearly, and keep students moving through the counter smoothly."
                : "A cleaner canteen flow for campus life — from menu browsing to payment and pickup."}
            </p>
          </div>

          <div className="authImage authImageRefined">
            <Image
              src={role === "staff" ? "/login-food.png" : "/hero-food.png"}
              alt="Canteen food visual"
              fill
              style={{ objectFit: "cover" }}
              priority
            />
          </div>

          <div className="authVisualFooter">
            <div className="authMiniStat">
              <span className="authMiniStatLabel">Flow</span>
              <strong>{role === "staff" ? "Approve → Prepare → Ready" : "Pick → Pay → Collect"}</strong>
            </div>

            <div className="authMiniStat">
              <span className="authMiniStatLabel">Mode</span>
              <strong>{role === "staff" ? "Operations View" : "Student Ordering"}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}