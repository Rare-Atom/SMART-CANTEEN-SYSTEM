import Image from "next/image";
import Layout from "@/components/layout";
import Card from "@/components/card";
import Button from "@/components/button";

export default function Home() {
  return (
    <Layout>
      <Card>
        <div
          style={{
            background: "linear-gradient(135deg, #ff6a00 0%, #ff9f00 55%, #ffbf47 100%)",
            borderRadius: 24,
            padding: 24,
            minHeight: 280,
            color: "white",
            overflow: "hidden",
            position: "relative",
          }}
        >
          <div className="heroGrid">
            <div style={{ zIndex: 2 }}>
              <div
                style={{
                  fontSize: 56,
                  lineHeight: 1.05,
                  fontWeight: 900,
                  letterSpacing: "-1px",
                  maxWidth: 580,
                }}
              >
                Smart ordering for a faster campus canteen.
              </div>

              <div
                style={{
                  marginTop: 14,
                  fontSize: 20,
                  lineHeight: 1.45,
                  maxWidth: 520,
                  color: "rgba(255,255,255,0.92)",
                }}
              >
                Skip the queue, pick your slot, get staff approval, and collect your meal on time.
              </div>

              <div style={{ display: "flex", gap: 12, marginTop: 24, flexWrap: "wrap" }}>
                <a href="/login?role=student">
                  <Button variant="ghost">Student Login</Button>
                </a>
                <a href="/login?role=staff">
                  <Button>Staff Login</Button>
                </a>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                position: "relative",
                zIndex: 2,
              }}
            >
              <div
                style={{
                  width: "100%",
                  maxWidth: 360,
                  aspectRatio: "1 / 1",
                  position: "relative",
                  borderRadius: 24,
                  overflow: "hidden",
                  boxShadow: "0 25px 45px rgba(0,0,0,0.18)",
                  background: "rgba(255,255,255,0.18)",
                }}
              >
                <Image
                  src="/hero-food.png"
                  alt="Vegetarian canteen food"
                  fill
                  style={{ objectFit: "cover" }}
                  priority
                />
              </div>
            </div>
          </div>

          <div
            style={{
              position: "absolute",
              top: -50,
              right: -50,
              width: 180,
              height: 180,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.12)",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: -70,
              left: -40,
              width: 220,
              height: 220,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.10)",
            }}
          />
        </div>
      </Card>

      <div style={{ height: 18 }} />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
        <Card>
          <div style={{ fontSize: 24, fontWeight: 900 }}>Student Flow</div>
          <div style={{ marginTop: 10, color: "#7a6758", lineHeight: 1.6 }}>
            Browse menu, choose a fixed slot, place order, pay after approval, and track live status.
          </div>
        </Card>

        <Card>
          <div style={{ fontSize: 24, fontWeight: 900 }}>Staff Control</div>
          <div style={{ marginTop: 10, color: "#7a6758", lineHeight: 1.6 }}>
            Accept or reject orders based on capacity and update status from preparing to ready.
          </div>
        </Card>

        <Card>
          <div style={{ fontSize: 24, fontWeight: 900 }}>Campus Ready</div>
          <div style={{ marginTop: 10, color: "#7a6758", lineHeight: 1.6 }}>
            Built for real Sathyabama canteen conditions with crowd control, time slots, and payment timing.
          </div>
        </Card>
      </div>
    </Layout>
  );
}