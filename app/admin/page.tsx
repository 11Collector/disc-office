"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase"; 

export default function AdminDashboard() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // ข้อมูลสถิติ
  const [stats, setStats] = useState({ D: 0, I: 0, S: 0, C: 0, total: 0 });

  const fetchResults = async () => {
    try {
      const resultsCollection = collection(db, "discResults");
      const snapshot = await getDocs(resultsCollection);
      
      const dataList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

    // คำนวณสถิติ
      const totalCount = dataList.length;
      const counts = { D: 0, I: 0, S: 0, C: 0 };
      
      dataList.forEach((user: any) => { // ✨ 1. ใส่ :any ตรงนี้ให้ TypeScript เลิกบ่น
        const resultType = user.finalResult as "D" | "I" | "S" | "C"; // ✨ 2. ดึงค่ามาจัด Type ให้ชัดเจน
        
        if (resultType && counts[resultType] !== undefined) {
          counts[resultType]++;
        }
      });

      setStats({ ...counts, total: totalCount });
      setResults(dataList);
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการดึงข้อมูล:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, []);

  const getPercent = (count: number) => {
    if (stats.total === 0) return 0;
    return Math.round((count / stats.total) * 100);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-end mb-6">
          <h1 className="text-2xl md:text-3xl font-black text-slate-800 flex items-center gap-3">
            📊 ระบบหลังบ้าน
          </h1>
          <button onClick={fetchResults} className="text-sm bg-white px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 transition-colors shadow-sm font-bold flex items-center gap-2">
            🔄 รีเฟรช
          </button>
        </div>

        {loading ? (
          <p className="text-slate-500 font-bold animate-pulse">กำลังโหลดข้อมูล...</p>
        ) : (
          <>
            {/* กล่องโชว์สถิติ % */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-red-50 border border-red-200 p-4 rounded-2xl shadow-sm text-center">
                <p className="text-red-700 text-sm font-bold mb-1">Type D 🚀</p>
                <p className="text-2xl font-black text-red-600">{getPercent(stats.D)}%</p>
                <p className="text-xs text-red-500 mt-1">{stats.D} คน</p>
              </div>
              <div className="bg-orange-50 border border-orange-200 p-4 rounded-2xl shadow-sm text-center">
                <p className="text-orange-700 text-sm font-bold mb-1">Type I 💃</p>
                <p className="text-2xl font-black text-orange-600">{getPercent(stats.I)}%</p>
                <p className="text-xs text-orange-500 mt-1">{stats.I} คน</p>
              </div>
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl shadow-sm text-center">
                <p className="text-emerald-700 text-sm font-bold mb-1">Type S 🛡️</p>
                <p className="text-2xl font-black text-emerald-600">{getPercent(stats.S)}%</p>
                <p className="text-xs text-emerald-500 mt-1">{stats.S} คน</p>
              </div>
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl shadow-sm text-center">
                <p className="text-blue-700 text-sm font-bold mb-1">Type C 🧐</p>
                <p className="text-2xl font-black text-blue-600">{getPercent(stats.C)}%</p>
                <p className="text-xs text-blue-500 mt-1">{stats.C} คน</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-4 bg-slate-800 text-white font-bold flex justify-between">
                <span>ยอดผู้เล่นทั้งหมด: <span className="text-blue-400">{stats.total}</span> คน</span>
              </div>
              <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 bg-slate-100 shadow-sm">
                    <tr className="text-slate-600 text-sm">
                      <th className="p-4 border-b">ชื่อเล่น</th>
                      <th className="p-4 border-b">ผลลัพธ์</th>
                      <th className="p-4 border-b">สไตล์</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.length === 0 ? (
                      <tr><td colSpan={3} className="p-8 text-center text-slate-400">ยังไม่มีข้อมูล</td></tr>
                    ) : (
                      results.map((user) => (
                        <tr key={user.id} className="border-b last:border-0 hover:bg-slate-50 transition-colors">
                          <td className="p-4 font-bold text-slate-800">{user.nickname}</td>
                          <td className="p-4">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold 
                              ${user.finalResult === 'D' ? 'bg-red-100 text-red-700' : 
                                user.finalResult === 'I' ? 'bg-orange-100 text-orange-700' : 
                                user.finalResult === 'S' ? 'bg-emerald-100 text-emerald-700' : 
                                'bg-blue-100 text-blue-700'}`}>
                              Type {user.finalResult}
                            </span>
                          </td>
                          <td className="p-4 text-sm text-slate-600">{user.gender}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}