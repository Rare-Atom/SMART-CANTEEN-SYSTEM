// Server-side IST ordering window check. Never trust the browser clock.
// Uses Intl with the Asia/Kolkata timezone so it is correct regardless of
// the host server's own timezone (e.g. UTC on Render).

const WINDOWS = [
    { start: "08:15", end: "08:45" },
    { start: "11:00", end: "12:00" },
    { start: "13:15", end: "13:45" },
];

function nowInISTMinutes() {
    const parts = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    }).formatToParts(new Date());

    const hour = Number(parts.find((p) => p.type === "hour").value);
    const minute = Number(parts.find((p) => p.type === "minute").value);
    return hour * 60 + minute;
}

function toMinutes(hhmm) {
    const [h, m] = hhmm.split(":").map(Number);
    return h * 60 + m;
}

function isWithinOrderingWindow() {
    const nowMinutes = nowInISTMinutes();
    return WINDOWS.some((w) => nowMinutes >= toMinutes(w.start) && nowMinutes <= toMinutes(w.end));
}

module.exports = { isWithinOrderingWindow, WINDOWS };
