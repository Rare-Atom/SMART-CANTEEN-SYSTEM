/**
 * Seeds the database with menu items, slots, and a default staff account
 * if they don't already exist. Called automatically on server startup.
 *
 * ALL items use canteen: "BOTH" — they exist in both canteens.
 * Per-canteen visibility is controlled by availableAt.MAIN / availableAt.SCAS.
 * Staff can toggle these independently via the menu management UI.
 */

const MenuItem = require("./models/MenuItem");
const Slot = require("./models/Slot");
const User = require("./models/User");
const bcrypt = require("bcryptjs");

const menuItems = [
    // ── Veg meals — initially visible at MAIN only ────────────────────────────
    { name: "Veg Fried Rice",     price: 80,  category: "veg",    canteen: "BOTH", image: "/menu/Veg fried rice.png",      description: "Wok-tossed rice with vegetables and classic canteen flavour.",   availableAt: { MAIN: true, SCAS: false } },
    { name: "Plain Dosa",         price: 30,  category: "veg",    canteen: "BOTH", image: "/menu/Plain dosa.png",           description: "Golden crisp dosa served with chutney and sambar.",              availableAt: { MAIN: true, SCAS: false } },
    { name: "Podi Dosa",          price: 40,  category: "veg",    canteen: "BOTH", image: "/menu/podi dosa.png",            description: "Crispy dosa topped with spicy podi and ghee.",                  availableAt: { MAIN: true, SCAS: false } },
    { name: "Poori",              price: 35,  category: "veg",    canteen: "BOTH", image: "/menu/poori.png",                description: "Soft puffed pooris served with hot potato masala.",              availableAt: { MAIN: true, SCAS: false } },
    { name: "Parotta",            price: 20,  category: "veg",    canteen: "BOTH", image: "/menu/parotta.png",              description: "Layered flaky parotta served with delicious curry.",             availableAt: { MAIN: true, SCAS: false } },

    // ── Non-veg meals — initially visible at MAIN only ────────────────────────
    { name: "Chicken Fried Rice", price: 130, category: "nonveg", canteen: "BOTH", image: "/menu/Chicken fried rice.png",  description: "Wok fried rice with chicken pieces and spices.",                availableAt: { MAIN: true, SCAS: false } },
    { name: "Chicken Biryani",    price: 150, category: "nonveg", canteen: "BOTH", image: "/menu/Chicken Biriyani.png",    description: "Aromatic biryani cooked with chicken and traditional spices.", availableAt: { MAIN: true, SCAS: false } },
    { name: "Chicken Noodles",    price: 120, category: "nonveg", canteen: "BOTH", image: "/menu/Chicken noodles.png",     description: "Stir-fried noodles with chicken and vegetables.",               availableAt: { MAIN: true, SCAS: false } },

    // ── Snacks — initially visible at SCAS only ───────────────────────────────
    { name: "Samosa",             price: 15,  category: "snacks", canteen: "BOTH", image: "/menu/Samosa.png",              description: "Crispy golden samosa filled with spicy potato masala.",         availableAt: { MAIN: false, SCAS: true } },
    { name: "Bhelpuri",           price: 25,  category: "snacks", canteen: "BOTH", image: "/menu/Bhelpuri.png",            description: "Tangy street-style bhelpuri with chutneys and sev.",           availableAt: { MAIN: false, SCAS: true } },
    { name: "Pani Poori",         price: 30,  category: "snacks", canteen: "BOTH", image: "/menu/Pani poori.png",          description: "Crunchy pani poori served with spicy mint water.",              availableAt: { MAIN: false, SCAS: true } },
    { name: "Masala Channa",      price: 30,  category: "snacks", canteen: "BOTH", image: "/menu/Masala channa.png",       description: "Spiced chickpeas snack full of flavour.",                       availableAt: { MAIN: false, SCAS: true } },
    { name: "Dahi Puri",          price: 35,  category: "snacks", canteen: "BOTH", image: "/menu/dahi puri.png",           description: "Puris filled with yogurt, chutneys, and sev.",                 availableAt: { MAIN: false, SCAS: true } },

    // ── Drinks — visible at BOTH canteens ─────────────────────────────────────
    { name: "Tea",                price: 12,  category: "drinks", canteen: "BOTH", image: "/menu/Tea.png",                 description: "Hot strong campus tea for quick refreshment.",                  availableAt: { MAIN: true, SCAS: true } },
    { name: "Coffee",             price: 15,  category: "drinks", canteen: "BOTH", image: "/menu/Coffee.png",              description: "Bold South Indian filter coffee.",                              availableAt: { MAIN: true, SCAS: true } },
    { name: "Lemon Juice",        price: 20,  category: "drinks", canteen: "BOTH", image: "/menu/lemon juice.png",         description: "Fresh lemon juice for a cool break.",                           availableAt: { MAIN: true, SCAS: true } },
    { name: "Orange Juice",       price: 25,  category: "drinks", canteen: "BOTH", image: "/menu/orange juice.png",        description: "Refreshing freshly squeezed orange juice.",                     availableAt: { MAIN: true, SCAS: true } },
    { name: "Watermelon Juice",   price: 25,  category: "drinks", canteen: "BOTH", image: "/menu/Water melon juice.png",   description: "Cool watermelon juice perfect for hot days.",                   availableAt: { MAIN: true, SCAS: true } },
    { name: "Rose Milk",          price: 25,  category: "drinks", canteen: "BOTH", image: "/menu/Rose milk.png",           description: "Sweet chilled rose milk drink.",                                availableAt: { MAIN: true, SCAS: true } },
];

const slots = [
    { time: "12:15 PM", active: true },
    { time: "12:30 PM", active: true },
    { time: "12:45 PM", active: true },
    { time: "01:00 PM", active: true },
    { time: "01:15 PM", active: true },
    { time: "01:30 PM", active: true },
];

async function seedDatabase() {
    try {
        // ── Menu items ──────────────────────────────────────────────────────────
        const menuCount = await MenuItem.countDocuments();
        if (menuCount === 0) {
            await MenuItem.insertMany(menuItems);
            console.log(`Seeded ${menuItems.length} menu items.`);
        }

        // ── Slots ───────────────────────────────────────────────────────────────
        const slotCount = await Slot.countDocuments();
        if (slotCount === 0) {
            await Slot.insertMany(slots);
            console.log(`Seeded ${slots.length} slots.`);
        }

        // ── Default staff account ────────────────────────────────────────────────
        const staffExists = await User.findOne({ role: "staff" });
        if (!staffExists) {
            const hashed = await bcrypt.hash("staff123", 10);
            await User.create({
                name: "Canteen Staff",
                email: "staff@sist.edu",
                password: hashed,
                role: "staff",
            });
            console.log("Seeded default staff account: staff@sist.edu / staff123");
        }
    } catch (err) {
        console.error("Seed error:", err.message);
    }
}

module.exports = seedDatabase;
