"use client";

import Link from "next/link";
import Image from "next/image";

export default function Layout({ children }) {
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
            <Link href="/orders">Orders</Link>
            <Link href="/staff/orders">Staff</Link>
          </nav>

          <Link href="/login?role=student" className="topBarSignInBtn">
            Sign in
          </Link>
        </div>
      </header>

      <main className="pageWrap">{children}</main>
    </div>
  );
}