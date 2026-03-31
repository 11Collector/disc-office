import type { Metadata } from "next";
import { Kanit } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

// โหลดฟอนต์ Kanit รองรับภาษาไทย
const kanit = Kanit({
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "700"], // เลือกความหนาที่ใช้บ่อยๆ
});

export const metadata: Metadata = {
  // แก้บรรทัดนี้ครับ 👇
  title: "Who are you ?", 
  description: "แบบทดสอบทายใจ สไตล์พนักงานออฟฟิศ", 
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      {/* ฝังฟอนต์ Kanit ลงไปใน Body ของทั้งเว็บไซต์ */}
      <body className={`${kanit.className} text-base`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}