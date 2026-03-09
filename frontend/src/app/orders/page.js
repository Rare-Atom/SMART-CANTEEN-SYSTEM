import Layout from "@/components/layout";

const orders = [
  {
    id: "#124",
    items: "Veg Fried Rice, Tea",
    slot: "12:15 - 12:30",
    status: "accepted",
    note: "Your meal is moving smoothly. Payment window is active."
  },
  {
    id: "#128",
    items: "Chicken Biryani with Egg",
    slot: "01:00 - 01:15",
    status: "preparing",
    note: "Your order is in the kitchen now. Pickup will be ready soon."
  },
  {
    id: "#131",
    items: "Rose Milk, Softie",
    slot: "03:15 - 03:30",
    status: "ready",
    note: "Everything’s ready at the counter. Go grab it while it’s fresh."
  }
];

export default function OrdersPage() {
  return (
    <Layout>
      <h1 className="sectionHeading">Your order story</h1>
      <p className="sectionSub">
        Track every step — from approval to pickup — without standing around and guessing.
      </p>

      <div className="orderGrid">
        {orders.map((order) => (
          <div className="orderCard" key={order.id}>
            <div className="orderTop">
              <div className="orderId">{order.id}</div>
              <div className={`badge ${order.status}`}>{order.status.toUpperCase()}</div>
            </div>

            <div className="orderMeta">
              <div><strong>Items:</strong> {order.items}</div>
              <div><strong>Slot:</strong> {order.slot}</div>
              <div>{order.note}</div>
            </div>

            <div className="orderActions">
              <button className="primarySmallBtn">View Details</button>
              <button className="secondaryBtn">Payment</button>
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
}