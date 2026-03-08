"use client";

import Image from "next/image";
import { useSearchParams } from "next/navigation";
import Layout from "@/components/layout";
import Card from "@/components/card";
import Button from "@/components/button";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const role = (searchParams.get("role") || "student").toLowerCase();

  const goNext = () => {
    if (role === "staff") {
      window.location.href = "/staff/orders";
    } else {
      window.location.href = "/menu";
    }
  };

  return (
    <Layout title={role === "staff" ? "Staff Login" : "Student Login"}>
      <Card>
        <div className="loginGrid">
          <div
            style={{
              background: "rgba(255,255,255,0.58)",
              border: "1px solid rgba(70,45,20,0.08)",
              borderRadius: 24,
              padding: 28,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: 40, fontWeight: 900 }}>Login</div>
              <div
                style={{
                  padding: "8px 14px",
                  borderRadius: 999,
                  background: "rgba(255,255,255,0.88)",
                  border: "1px solid rgba(70,45,20,0.08)",
                  fontWeight: 800,
                  fontSize: 14,
                }}
              >
                {role.toUpperCase()}
              </div>
            </div>

            <div style={{ marginTop: 22, display: "grid", gap: 14 }}>
              <Input placeholder="Register No / Email" />
              <Input placeholder="Password" type="password" />
            </div>

            <div style={{ marginTop: 18 }}>
              <Button full onClick={goNext}>Login</Button>
            </div>
          </div>

          <div
            style={{
              background: "linear-gradient(135deg, #fff3e6 0%, #fff9f1 100%)",
              border: "1px solid rgba(70,45,20,0.08)",
              borderRadius: 24,
              padding: 18,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              minHeight: 420,
            }}
          >
            <div>
              <div style={{ fontSize: 36, fontWeight: 900, lineHeight: 1.05 }}>
                Smart ordering. Zero queue.
              </div>
              <div style={{ marginTop: 10, fontSize: 18, color: "#7a6758", lineHeight: 1.5 }}>
                Staff approves first. Payment opens only for a few minutes. Faster service, less crowd.
              </div>
            </div>

            <div
              style={{
                width: "100%",
                height: 250,
                position: "relative",
                borderRadius: 20,
                overflow: "hidden",
                background: "white",
                boxShadow: "0 14px 28px rgba(90,55,20,0.08)",
              }}
            >
              <Image
                src="/login-food.png"
                alt="Non-veg canteen food"
                fill
                style={{ objectFit: "cover" }}
                priority
              />
            </div>
          </div>
        </div>
      </Card>
    </Layout>
  );
}

function Input({ placeholder, type = "text" }) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      style={{
        width: "100%",
        padding: "15px 16px",
        borderRadius: 16,
        border: "1px solid rgba(70,45,20,0.10)",
        background: "rgba(255,255,255,0.9)",
        color: "#2f241d",
        outline: "none",
        fontSize: 15,
      }}
    />
  );
}