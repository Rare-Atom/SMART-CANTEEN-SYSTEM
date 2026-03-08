import Layout from "@/components/layout";
import Card from "@/components/card";
import Button from "@/components/button";

export default function Page() {
  return (
    <Layout title="Menu">
      <div style={{ display: "grid", gap: 12 }}>
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontWeight: 900, fontSize: 16 }}>Veg Fried Rice</div>
              <div style={{ opacity: 0.75, marginTop: 4 }}>₹60 • Available</div>
            </div>
            <Button variant="ghost">Add</Button>
          </div>
        </Card>

        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontWeight: 900, fontSize: 16 }}>Tea</div>
              <div style={{ opacity: 0.75, marginTop: 4 }}>₹15 • Available</div>
            </div>
            <Button variant="ghost">Add</Button>
          </div>
        </Card>

        <Button full>Proceed to Checkout</Button>
      </div>
    </Layout>
  );
}