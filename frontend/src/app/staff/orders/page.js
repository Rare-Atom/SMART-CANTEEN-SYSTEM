import Layout from "@/components/layout";

const staffOrders = [
  {
    id: "#142",
    student: "Divya Shree",
    items: "Veg Fried Rice × 1, Tea × 1",
    slot: "12:15 - 12:30",
    status: "pending"
  },
  {
    id: "#143",
    student: "Arun Kumar",
    items: "Chicken Biryani with Egg × 1",
    slot: "12:30 - 12:45",
    status: "accepted"
  },
  {
    id: "#144",
    student: "Keerthana",
    items: "Softie × 2, Rose Milk × 1",
    slot: "01:00 - 01:15",
    status: "preparing"
  }
];

export default function StaffOrdersPage() {
  return (
    <Layout>
      <h1 className="sectionHeading">Counter control</h1>
      <p className="sectionSub">
        Handle incoming orders clearly, respond fast, and keep service flowing without confusion.
      </p>

      <div className="orderGrid">
        {staffOrders.map((order) => (
          <div className="orderCard" key={order.id}>
            <div className="orderTop">
              <div className="orderId">{order.id}</div>
              <div className={`badge ${order.status}`}>{order.status.toUpperCase()}</div>
            </div>

            <div className="orderMeta">
              <div><strong>Student:</strong> {order.student}</div>
              <div><strong>Items:</strong> {order.items}</div>
              <div><strong>Slot:</strong> {order.slot}</div>
            </div>

            <div className="orderActions">
              <button className="primarySmallBtn">Accept</button>
              <button className="secondaryBtn">Reject</button>
              <button className="secondaryBtn">Preparing</button>
              <button className="secondaryBtn">Ready</button>
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
}