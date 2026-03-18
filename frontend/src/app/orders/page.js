import Layout from "@/components/layout";
import Badge from "@/components/badge";
import orders from "@/mock/orders.json";

export default function OrdersPage() {
  return (
    <Layout>
      <div className="ordersHero">
        <div>
          <div className="menuKicker">Student orders</div>
          <h1 className="sectionHeading">Your order story</h1>
          <p className="sectionSub">
            From approval to pickup, every update stays clear, fast, and easy to follow.
          </p>
        </div>
      </div>

      <div className="orderGrid orderGridRefined">
        {orders.map((order) => (
          <div className="orderCard orderCardRefined" key={order.id}>
            <div className="orderTop">
              <div>
                <div className="orderId">Order #{order.id}</div>
                <div className="orderMiniMeta">{order.canteen}</div>
              </div>

              <div className="staffbadges">
                <Badge status={order.status} />
                <span className={`paymentbadge ${order.payment}`}>
                  {order.payment === "paid" ? "PAID" : "PAYMENT AWAITING"}
                </span>
              </div>
            </div>

            <div className="orderMeta orderMetaRefined">
              <div><strong>Items:</strong> {order.items}</div>
              <div><strong>Pickup Slot:</strong> {order.slot}</div>
              <div>{order.note}</div>
            </div>

            <div className="orderProgressRow">
              <div className={`progressStep ${["accepted", "preparing", "ready"].includes(order.status) ? "done" : ""}`}>
                Approved
              </div>
              <div className={`progressStep ${order.payment === "paid" ? "done" : ""}`}>
                Payment
              </div>
              <div className={`progressStep ${["preparing", "ready"].includes(order.status) ? "done" : ""}`}>
                Preparing
              </div>
              <div className={`progressStep ${order.status === "ready" ? "done" : ""}`}>
                Ready
              </div>
            </div>

            <div className="staffMetaRow">
              <span className="amountChip">₹{order.total}</span>
              <span className="slotChip">{order.slot}</span>
            </div>

            <div className="orderActions">
              {order.payment === "awaiting" ? (
                <a href={`/pay/${order.token}`} className="primarySmallBtn">
                  Scan & Pay
                </a>
              ) : null}

              <a href={`/pay/${order.token}`} className="secondaryBtn">
                View Payment
              </a>
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
}