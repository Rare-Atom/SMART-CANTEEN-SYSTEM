import Layout from "@/components/layout";
import badge from "@/components/badge";

const staffOrders = [
  {
    id: "142",
    student: "Divya Shree",
    items: "Veg Fried Rice ×1, Tea ×1",
    slot: "12:15 - 12:30",
    status: "pending",
    payment: "awaiting",
    total: 92
  },
  {
    id: "143",
    student: "Arun Kumar",
    items: "Chicken Biryani with Egg ×1",
    slot: "12:30 - 12:45",
    status: "accepted",
    payment: "paid",
    total: 150
  },
  {
    id: "144",
    student: "Keerthana",
    items: "Softie ×2, Rose Milk ×1",
    slot: "01:00 - 01:15",
    status: "preparing",
    payment: "paid",
    total: 110
  },
  {
    id: "145",
    student: "Rahul",
    items: "Masala Dosa ×2, Coffee ×1",
    slot: "01:15 - 01:30",
    status: "ready",
    payment: "paid",
    total: 85
  }
];

export default function StaffOrdersPage() {
  const totalOrders = staffOrders.length;
  const pendingCount = staffOrders.filter((o) => o.status === "pending").length;
  const preparingCount = staffOrders.filter((o) => o.status === "preparing").length;
  const readyCount = staffOrders.filter((o) => o.status === "ready").length;

  return (
    <Layout>
      <div className="staffHero">
        <div className="menuKicker">Staff panel</div>
        <h1 className="sectionHeading">Counter control</h1>
        <p className="sectionSub">
          Review incoming orders quickly, keep preparation moving, and make pickup smoother during rush hours.
        </p>
      </div>

      <div className="staffStatsGrid staffStatsGridRefined">
        <div className="staffStatCard staffStatCardRefined">
          <div className="staffStatLabel">Total Orders</div>
          <div className="staffStatValue">{totalOrders}</div>
          <div className="staffStatHint">All active orders in the queue</div>
        </div>

        <div className="staffStatCard staffStatCardRefined">
          <div className="staffStatLabel">Pending Review</div>
          <div className="staffStatValue">{pendingCount}</div>
          <div className="staffStatHint">Need approval or rejection</div>
        </div>

        <div className="staffStatCard staffStatCardRefined">
          <div className="staffStatLabel">Preparing Now</div>
          <div className="staffStatValue">{preparingCount}</div>
          <div className="staffStatHint">Currently in kitchen flow</div>
        </div>

        <div className="staffStatCard staffStatCardRefined">
          <div className="staffStatLabel">Ready for Pickup</div>
          <div className="staffStatValue">{readyCount}</div>
          <div className="staffStatHint">Ready to hand over</div>
        </div>
      </div>

      <div className="staffOrderGrid staffOrderGridRefined">
        {staffOrders.map((order) => (
          <a
            key={order.id}
            href={`/staff/order/${order.id}`}
            className="staffOrderCard staffOrderCardRefined"
          >
            <div className="staffOrderTop">
              <div>
                <div className="staffOrderId">Order #{order.id}</div>
                <div className="staffStudentName">{order.student}</div>
              </div>

              <div className="staffbadges">
                <badge status={order.status} />
                <span className={`paymentbadge ${order.payment}`}>
                  {order.payment === "paid" ? "PAID" : "PAYMENT AWAITING"}
                </span>
              </div>
            </div>

            <div className="staffOrderItems">{order.items}</div>

            <div className="staffMetaRow">
              <span className="slotChip">{order.slot}</span>
              <span className="amountChip">₹{order.total}</span>
            </div>

            <div className="staffOrderFooter">
              <span className="viewLinkText">Open full order →</span>
            </div>
          </a>
        ))}
      </div>
    </Layout>
  );
}