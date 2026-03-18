import "./globals.css";

export const metadata = {
  title: "SIST Smart Canteen",
  description: "Skip the queue, Savour the meal",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}