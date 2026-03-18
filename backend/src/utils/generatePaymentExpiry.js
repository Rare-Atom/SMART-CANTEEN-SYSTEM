module.exports = function generatePaymentExpiry() {

    const now = new Date();

    const expiry = new Date(now.getTime() + 3 * 60 * 1000);

    return expiry;
}