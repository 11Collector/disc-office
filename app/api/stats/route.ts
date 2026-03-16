import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';

// ประชากรตั้งต้น 1,000 คน (ลดอาการ Cold Start เปิดเว็บมาจะได้ดูมีคนเล่นเยอะๆ)
const SEED_DATA = { 
  D: 120, // 12%
  I: 250, // 25%
  S: 450, // 45%
  C: 180  // 18%
};

// ฟังก์ชันดึงข้อมูลสถิติ
export async function GET() {
  try {
    const stats = await kv.hgetall('disc_stats');
    if (!stats) return NextResponse.json(SEED_DATA);
    
    // เอาข้อมูลจริง + ข้อมูลตั้งต้น
    return NextResponse.json({
      D: (Number(stats.D) || 0) + SEED_DATA.D,
      I: (Number(stats.I) || 0) + SEED_DATA.I,
      S: (Number(stats.S) || 0) + SEED_DATA.S,
      C: (Number(stats.C) || 0) + SEED_DATA.C,
    });
  } catch (e) {
    // ถ้ายังไม่ได้ต่อ Database บน Vercel ให้พ่น Seed Data ออกไปก่อน เว็บจะได้ไม่พัง
    return NextResponse.json(SEED_DATA);
  }
}

// ฟังก์ชันส่งคะแนนเข้ามาบวกเพิ่ม
export async function POST(req: Request) {
  try {
    const { type } = await req.json();
    if (['D', 'I', 'S', 'C'].includes(type)) {
      // บวกค่าเพิ่มทีละ 1 ใน Database
      await kv.hincrby('disc_stats', type, 1);
    }
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ success: false });
  }
}