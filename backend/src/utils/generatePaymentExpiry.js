/** Returns a Date exactly 5 minutes from now — used for payment session windows. */
module.exports = function generatePaymentExpiry() {
    return new Date(Date.now() + 5 * 60 * 1000);
};
