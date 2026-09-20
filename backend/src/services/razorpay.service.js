const Razorpay = require("razorpay");
const crypto = require("crypto");

let client = null;
function getClient() {
    if (!client) {
        if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
            throw Object.assign(new Error("Razorpay is not configured on the server."), { status: 503 });
        }
        client = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });
    }
    return client;
}

// Creates a Razorpay order for the exact amount of an internal Order.
// amountRupees is converted to paise (integer) as required by Razorpay.
async function createRazorpayOrder({ amountRupees, internalOrderId }) {
    const order = await getClient().orders.create({
        amount: Math.round(amountRupees * 100),
        currency: "INR",
        receipt: String(internalOrderId),
        notes: { internalOrderId: String(internalOrderId) },
    });
    return order;
}

// Verifies the signature Razorpay Checkout returns to the browser after payment.
function verifyPaymentSignature({ razorpayOrderId, razorpayPaymentId, razorpaySignature }) {
    const expected = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest("hex");
    return expected === razorpaySignature;
}

// Verifies the X-Razorpay-Signature header on incoming webhook requests.
function verifyWebhookSignature({ rawBody, signature }) {
    if (!process.env.RAZORPAY_WEBHOOK_SECRET) return false;
    const expected = crypto
        .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
        .update(rawBody)
        .digest("hex");
    return expected === signature;
}

module.exports = { createRazorpayOrder, verifyPaymentSignature, verifyWebhookSignature };
