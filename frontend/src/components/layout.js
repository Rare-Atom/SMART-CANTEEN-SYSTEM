"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { getUser, logout } from "@/lib/auth";

export default function Layout({ children }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [mounted, setMounted] = useState(false);

  // Read from localStorage only after mount to prevent hydration mismatch
  useEffect(() => {
    const u = getUser();
    setUser(u);

    // Cart is only relevant for students
    if (!u || u.role !== "staff") {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      setCartCount(cart.reduce((sum, item) => sum + (item.qty || 0), 0));
    }

    setMounted(true);
  }, []);

  // Sync cart count whenever menu/checkout pages dispatch "cartUpdated"
  useEffect(() => {
    function syncCart() {
      const u = getUser();
      if (u?.role === "staff") return;
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      setCartCount(cart.reduce((sum, item) => sum + (item.qty || 0), 0));
    }
    window.addEventListener("cartUpdated", syncCart);
    return () => window.removeEventListener("cartUpdated", syncCart);
  }, []);

  const isStaff = user?.role === "staff";

  // Skeleton shell before mount — suppresses SSR/client mismatch
  if (!mounted) {
    return (
      <div className="appShell">
        <header className="topBarWhite">
          <div className="leftGroup">
            <div className="brandLogo brandLogoImageWrap">
              <Image
                src="/sathyabama-logo.png"
                alt="Sathyabama logo"
                width={46}
                height={46}
                className="brandLogoImage"
                priority
              />
            </div>
            <div>
              <div className="brandMini">SIST Smart Canteen</div>
              <div className="brandMiniSub">Skip the queue, Savour the meal</div>
            </div>
          </div>
          <div className="topBarRightGroup">
            <nav className="navMini">
              <Link href="/">Home</Link>
              <Link href="/menu">Menu</Link>
            </nav>
          </div>
        </header>
        <main className="pageWrap">{children}</main>
      </div>
    );
  }

  return (
    <div className="appShell">
      <header className="topBarWhite">
        <div className="leftGroup">
          <div className="brandLogo brandLogoImageWrap">
            <Image
              src="/sathyabama-logo.png"
              alt="Sathyabama logo"
              width={46}
              height={46}
              className="brandLogoImage"
              priority
            />
          </div>
          <div>
            <div className="brandMini">SIST Smart Canteen</div>
            <div className="brandMiniSub">Skip the queue, Savour the meal</div>
          </div>
        </div>

        <div className="topBarRightGroup">
          <nav className="navMini">
            <Link href="/">Home</Link>
            <Link href="/menu">Menu</Link>
            {/* Student-only nav links */}
            {user && !isStaff && <Link href="/orders">My Orders</Link>}
            {/* Staff-only nav links */}
            {isStaff && <Link href="/staff/orders">Staff Panel</Link>}
          </nav>

          {/* Cart — students and guests only, never staff */}
          {!isStaff && (
            <Link
              href="/checkout"
              style={{
                position: "relative",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "9px 16px",
                borderRadius: 12,
                fontWeight: 800,
                fontSize: 14,
                cursor: "pointer",
                border: "1.5px solid rgba(70,45,20,0.12)",
                background: cartCount > 0 ? "var(--brand)" : "rgba(255,255,255,0.88)",
                color: cartCount > 0 ? "white" : "var(--text)",
                boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                textDecoration: "none",
                transition: "all 0.18s ease",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              Cart
              {cartCount > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: -6, right: -6,
                    background: "#dc2626",
                    color: "white",
                    borderRadius: "50%",
                    width: 20, height: 20,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 11, fontWeight: 900,
                    border: "2px solid white",
                  }}
                >
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </Link>
          )}

          {/* Auth controls */}
          {user ? (
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span
                style={{
                  fontSize: 14, fontWeight: 700, color: "var(--muted)",
                  maxWidth: 130, overflow: "hidden",
                  textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}
              >
                {isStaff ? `Staff: ${user.name}` : user.name}
              </span>

              <button
                onClick={() => {
                  logout(router);
                  setUser(null);
                  setCartCount(0);
                }}
                style={{
                  padding: "9px 18px", borderRadius: 12,
                  fontWeight: 800, fontSize: 14, cursor: "pointer",
                  border: "1.5px solid rgba(70,45,20,0.12)",
                  background: "rgba(255,255,255,0.88)",
                  color: "var(--text)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                  transition: "all 0.18s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#fff5f5";
                  e.currentTarget.style.borderColor = "#fca5a5";
                  e.currentTarget.style.color = "#dc2626";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.88)";
                  e.currentTarget.style.borderColor = "rgba(70,45,20,0.12)";
                  e.currentTarget.style.color = "var(--text)";
                }}
              >
                Sign out
              </button>
            </div>
          ) : (
            <Link href="/login?role=student" className="topBarSignInBtn">
              Sign in
            </Link>
          )}
        </div>
      </header>

      <main className="pageWrap">{children}</main>
    </div>
  );
}
