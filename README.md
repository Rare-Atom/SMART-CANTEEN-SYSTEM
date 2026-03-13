🍽️ SIST Smart Canteen
Skip the Queue. Savour the Meal.

A modern slot-based digital ordering system designed for campus cafeterias.

SIST Smart Canteen transforms the traditional waiting line into a fast, organized, and transparent food ordering experience for students and staff at Sathyabama Institute of Science and Technology.

Instead of standing in queues during rush hours, students can browse the menu, place orders, complete payments, and pick up food at the right time slot.

The system also provides real-time order tracking and a staff dashboard to manage incoming orders efficiently.

🚀 Vision

Campus cafeterias often struggle with:

• Long queues during peak hours
• Payment delays
• Order confusion
• Poor pickup coordination

Students order → Staff approves → Payment happens → Food gets prepared → Pickup becomes smooth.

⏱️ Slot-Based Ordering

Orders are assigned pickup time windows to prevent congestion.
This ensures balanced kitchen workload and faster pickup.

💳 QR Based Payment Flow

A payment page generates a QR code payment session.
Student scans the QR using UPI and completes payment.
The system is designed for automatic verification via payment gateway webhooks (future integration).

👩‍🍳 Staff Dashboard
Canteen staff get a dedicated Counter Control Panel.

Features
• View incoming orders
• Accept or reject orders
• Update order status
• Manage preparation flow

This enables staff to handle rush hours efficiently.

🧠 System Flow

Student Login
      ➡️Browse Menu
      ➡️      Select Items + Pickup Slot
      ➡️   Order Created
      ➡️  Staff Dashboard Approval
      ➡️  QR Payment Page
      ➡️          Payment Verified
      ➡️         Kitchen Preparation
      ➡️            Pickup Notification

🏗️ Tech Stack

Frontend
Built using Next.js App Router
Next.js
React
CSS Modules

Purpose:
• fast UI rendering
• scalable routing
• modern component architecture

Backend 
Future backend architecture will support:
Node.js
Express.js
MongoDB
Payment Gateway APIs
Webhooks

📁 Project Structure

frontend/
│
├── public/
│   ├── hero-food.png
│   ├── login-food.png
│   └── sathyabama-logo.png
│
├── src/
│
│   ├── app/
│   │
│   │   ├── page.js                # Homepage
│   │   ├── login/page.js          # Login Page
│   │   ├── menu/page.js           # Menu Page
│   │   ├── orders/page.js         # Student Orders
│   │   ├── pay/[token]/page.js    # Payment Session
│   │
│   │   └── staff/
│   │        ├── orders/page.js    # Staff Dashboard
│   │        └── order/[id]/page.js # Order Detail
│
│   ├── components/
│   │   ├── Badge.js
│   │   └── layout.js
│
│   └── mock/
│       ├── menu.json
│       └── orders.json

⚙️ Installation

1️⃣ Clone Repository

git clone https://github.com/Rare-Atom/SMART-CANTEEN-SYSTEM.git

2️⃣ Navigate to frontend

cd SMART-CANTEEN-SYSTEM/frontend

3️⃣ Install dependencies

npm install

4️⃣ Start development server

npm run dev

Open browser:
http://localhost:3000

📸 Screens
Homepage
Smart hero section with food categories.

Login Page
Student / Staff login interface.

Menu Page
Food categories with item listings.

Orders Page
Track your order journey.

Payment Page
QR payment session.

Staff Dashboard
Counter control system for order management.

🔐 Ethical Payment Design
The payment system is intentionally designed to avoid manual "Mark as Paid" buttons.
Instead, the final architecture will rely on:

Payment Gateway Webhooks
UPI Transaction Verification
Automatic Order Status Update
This ensures transparency and prevents misuse.

🌱 Future Enhancements
Planned upgrades include:

🔔 Notifications
Real-time alerts when order is ready.

📱 Mobile App
Flutter / React Native version.

🤖 AI Queue Prediction
Predict rush hours and suggest pickup slots.

📊 Analytics Dashboard
For canteen management.

🧾 Digital Receipts
Auto-generated payment receipts.

🎓 Student ID Integration
Login via university credentials.

🌟 Project Impact

SIST Smart Canteen demonstrates how digital systems can transform campus infrastructure.
Instead of chaotic food counters, campuses can operate with:
• organized ordering
• faster service
• better student experience
This project showcases real-world full-stack system design for campus innovation.

📜 License
This project is created for educational and research purposes.


