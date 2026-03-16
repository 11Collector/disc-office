"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Trophy, ExternalLink, RefreshCcw, HeartPulse, Camera, Zap, ShieldAlert } from "lucide-react";
// เปลี่ยนมาใช้ html-to-image แทน html2canvas
import { toPng } from "html-to-image"; 
import { Kanit } from "next/font/google";
import { scenarios, Choice, ChatScenario } from "@/data/chatScenarios";

const kanit = Kanit({ 
  subsets: ["thai", "latin"], 
  weight: ["300", "400", "500", "700"] 
});

const shuffleArray = (array: any[]) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const resultData = {
  D: {
    rpgTitle: "เดอะแบกสายบวก 🚀", discTitle: "มนุษย์กลุ่ม D (Dominance)", color: "bg-red-600", emoji: "🚀",
    desc: "คุณคือเครื่องจักรปั่นงาน! ชอบความท้าทาย ตัดสินใจไว เด็ดขาด มั่นใจสูง งานด่วนงานไฟไหม้ขอให้บอก พร้อมบวกเสมอไม่ว่าหน้าไหน!",
    bestPartner: { name: "Type C - มนุษย์ Checklist 🧐", desc: "เพื่อนซี้สายซัพ! C จะช่วยอุดรูรั่วหลังบ้าน ให้คุณพุ่งชนเป้าหมายได้เต็มที่" },
    kryptonite: { name: "Type D - เดอะแบกสายบวก 🚀", desc: "เสือสองตัวอยู่ถ้ำเดียวกันไม่ได้! พร้อมบวกแย่งกันเป็นผู้นำตลอดเวลา" }
  },
  I: {
    rpgTitle: "รมต. กระทรวงเอนเตอร์เทน 💃", discTitle: "มนุษย์กลุ่ม I (Influence)", color: "bg-orange-500", emoji: "💃",
    desc: "คุณคือสีสันของแผนก! มนุษย์โลกสวย ชอบเข้าสังคม สร้างบรรยากาศดีๆ ใครอยู่ใกล้ก็อารมณ์ดี เรื่องงานอาจจะชิว แต่เรื่องปาร์ตี้เราจริงจัง!",
    bestPartner: { name: "Type S - กาวใจประจำออฟฟิศ 🛡️", desc: "ผู้ฟังที่ดี! S จะคอยซัพพอร์ตไอเดียฟุ้งๆ และฟังเรื่องเมาท์ของคุณได้ทั้งวัน" },
    kryptonite: { name: "Type C - มนุษย์ Checklist 🧐", desc: "คู่ปรับสายเป๊ะ! C ถามหาแต่ตัวเลขและแผนงาน ซึ่งคุณเกลียดงานเอกสารสุดๆ" }
  },
  S: {
    rpgTitle: "กาวใจประจำออฟฟิศ 🛡️", discTitle: "มนุษย์กลุ่ม S (Steadiness)", color: "bg-emerald-600", emoji: "🛡️",
    desc: "คุณคือเซฟโซนของทุกคน! ใจเย็น เป็นผู้ฟังที่ดี ใครมีปัญหาอะไรก็ชอบมาปรึกษา เน้นประนีประนอม รักสงบ เกลียดการเปลี่ยนแปลงกะทันหันสุดๆ",
    bestPartner: { name: "Type I - รมต. เอนเตอร์เทน 💃", desc: "คนเติมไฟ! I จะช่วยดึงคุณออกจากเซฟโซนมาสนุกกับชีวิตออฟฟิศมากขึ้น" },
    kryptonite: { name: "Type D - เดอะแบกสายบวก 🚀", desc: "ตัวทำลายความสงบ! D ชอบสั่งงานด่วนๆ แรงๆ ขัดกับสไตล์คุณที่ชอบทำเป็นสเต็ป" }
  },
  C: {
    rpgTitle: "มนุษย์ Checklist 🧐", discTitle: "มนุษย์กลุ่ม C (Compliance)", color: "bg-blue-600", emoji: "🧐",
    desc: "คุณคือเครื่องจับผิด! สายวิเคราะห์ รอบคอบ มีแผนเสมอ ทุกอย่างต้องมี Reference ผิดมิลลิเมตรเดียวก็ไม่ได้ เจ้าระเบียบยืนหนึ่ง!",
    bestPartner: { name: "Type D - เดอะแบกสายบวก 🚀", desc: "คู่หูทำยอด! คุณวางแผนเป๊ะๆ ให้ ส่วน D จะเป็นคนฟาดฟันเอาผลลัพธ์มาเอง" },
    kryptonite: { name: "Type I - รมต. เอนเตอร์เทน 💃", desc: "น่ารำคาญใจ! I ทำงานปุบปับ ไร้แบบแผน เปลี่ยนใจบ่อยจนแผนคุณพังหมด" }
  },
};

export default function Home() {
  const [gameState, setGameState] = useState<"start" | "playing" | "result">("start");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scores, setScores] = useState({ D: 0, I: 0, S: 0, C: 0 });
  const [shuffledChoices, setShuffledChoices] = useState<Choice[]>([]);
  const [activeScenarios, setActiveScenarios] = useState<ChatScenario[]>([]);
  const [gender, setGender] = useState<"ชาย" | "หญิง">("ชาย");
  const [isCapturing, setIsCapturing] = useState(false);

  const printRef = useRef<HTMLDivElement>(null);

  const handleStart = () => {
    const randomTenScenarios = shuffleArray(scenarios).slice(0, 10);
    setActiveScenarios(randomTenScenarios);
    setGameState("playing");
  };

  useEffect(() => {
    if (gameState === "playing" && activeScenarios.length > 0) {
      setShuffledChoices(shuffleArray(activeScenarios[currentIndex].choices));
    }
  }, [currentIndex, gameState, activeScenarios]);

  const handleChoice = (type: "D" | "I" | "S" | "C") => {
    setScores((prev) => ({ ...prev, [type]: prev[type] + 1 }));
    if (currentIndex < activeScenarios.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setGameState("result");
    }
  };

  const getFinalResult = () => {
    let maxType = "D";
    let maxScore = scores.D;
    (["I", "S", "C"] as const).forEach((type) => {
      if (scores[type] > maxScore) { maxScore = scores[type]; maxType = type; }
    });
    return maxType as "D" | "I" | "S" | "C";
  };

  const restartGame = () => {
    setScores({ D: 0, I: 0, S: 0, C: 0 });
    setCurrentIndex(0);
    setGameState("start");
  };

  // อัปเกรดระบบเซฟรูปด้วย html-to-image
  const handleDownloadImage = async () => {
    if (!printRef.current) return;
    setIsCapturing(true);
    try {
      // ให้เวลา React จัดการ DOM นิดนึงก่อนถ่ายรูป
      await new Promise((resolve) => setTimeout(resolve, 150));

      const dataUrl = await toPng(printRef.current, {
        cacheBust: true, // ป้องกันรูปบั๊กจาก Cache
        pixelRatio: 2, // ให้ภาพคมชัดระดับ HD
        backgroundColor: "#F8FAFC", // สีพื้นหลังเผื่อส่วนที่โปร่งใส
      });
      
      const link = document.createElement("a");
      link.download = `DISC-Office-Result.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Image Capture Error:", err);
      alert("เกิดข้อผิดพลาดในการเซฟรูป ลองแคปหน้าจอแทนนะครับ");
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <div className={`min-h-[100dvh] bg-slate-900 flex flex-col items-center justify-center sm:p-4 ${kanit.className}`}>
      <div className="w-full max-w-md bg-white sm:rounded-[2.5rem] shadow-2xl overflow-hidden h-[100dvh] sm:h-[850px] sm:max-h-[90vh] flex flex-col relative sm:border-[6px] sm:border-slate-700">
        
        {/* หน้าจอเริ่มต้น */}
        {gameState === "start" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col items-center p-8 bg-gradient-to-b from-slate-50 to-blue-50 overflow-y-auto">
            <div className="bg-slate-800 w-28 h-28 rounded-full flex items-center justify-center shadow-xl mt-4 mb-6 border-4 border-white">
              <MessageSquare size={50} className="text-blue-100" />
            </div>
            
            <div className="text-center mb-6">
              <h1 className="text-3xl font-black mb-3 text-slate-800 tracking-tight leading-tight">แกเป็นคนยังไง<br/>ใน Office ?</h1>
              <p className="text-blue-700 font-bold bg-blue-100/70 py-1.5 px-4 rounded-full inline-block text-sm shadow-sm">(DISC ของคนรุ่นใหม่)</p>
            </div>

            <div className="w-full bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-6 flex items-start gap-3">
              <span className="text-2xl mt-1">💡</span>
              <div>
                <p className="font-bold text-slate-800 text-sm mb-1">กติกาการเอาตัวรอด:</p>
                <p className="text-xs text-slate-600 leading-relaxed">
                  กดเลือก <span className="font-bold bg-blue-100 text-blue-800 px-1 rounded">"คำตอบแรกที่แวบขึ้นมาในหัว"</span> ทันทีโดยไม่ต้องคิดเยอะ เพื่อหาธาตุแท้ของคุณ!
                </p>
              </div>
            </div>

            <div className="w-full space-y-4 mb-8 mt-auto">
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-2 text-center">คุณคือพนักงานสไตล์ไหน?</label>
                <div className="flex gap-3">
                  <button onClick={() => setGender("ชาย")} className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${gender === "ชาย" ? "bg-slate-800 text-white shadow-md" : "bg-white text-slate-500 border-2 border-slate-200 hover:border-blue-300"}`}>
                    👨 หนุ่มออฟฟิศ
                  </button>
                  <button onClick={() => setGender("หญิง")} className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${gender === "หญิง" ? "bg-slate-800 text-white shadow-md" : "bg-white text-slate-500 border-2 border-slate-200 hover:border-blue-300"}`}>
                    👩 สาวออฟฟิศ
                  </button>
                </div>
              </div>
            </div>

            <button onClick={handleStart} className="bg-blue-600 text-white font-bold text-xl py-4 px-12 rounded-full shadow-lg hover:bg-blue-700 transition-all hover:scale-105 active:scale-95 w-full mb-2 border-b-4 border-blue-800">
              แกเป็นคนยังไงใน Office?
            </button>
          </motion.div>
        )}

        {/* หน้าจอตอนเล่น (Chat Simulator) */}
        {gameState === "playing" && activeScenarios.length > 0 && (
          <div className="flex flex-col h-full bg-[#E2E8F0]">
            <div className="bg-slate-900 text-white px-3 py-2 flex items-center justify-between shadow-md z-10 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="text-[16px] bg-slate-800 p-1.5 rounded-full w-8 h-8 flex items-center justify-center shrink-0 border border-slate-700">
                  {activeScenarios[currentIndex].avatar}
                </div>
                <div className="flex flex-col justify-center min-w-0">
                  <h2 className="font-bold text-[14px] leading-none truncate">{activeScenarios[currentIndex].npcName}</h2>
                  <p className="text-[10px] text-blue-300 mt-0.5 leading-none truncate">{activeScenarios[currentIndex].role}</p>
                </div>
              </div>
              <div className="bg-slate-800 text-blue-100 text-[10px] font-bold px-2.5 py-1 rounded-full border border-slate-700 shrink-0">
                {currentIndex + 1} / {activeScenarios.length}
              </div>
            </div>

            <div className="flex-1 p-5 overflow-y-auto flex flex-col pb-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeScenarios[currentIndex].id}
                  initial={{ opacity: 0, y: 15, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-white text-slate-800 p-4 rounded-2xl rounded-tl-sm shadow-sm max-w-[85%] self-start border border-slate-200 relative break-words mt-4 ml-2"
                >
                  <svg className="absolute top-0 -left-[9px] w-[10px] h-[14px] text-white drop-shadow-sm" viewBox="0 0 10 14" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 0H0C4.5 0 8.5 4.5 10 10V0Z" />
                  </svg>
                  <p className="text-[15px] leading-relaxed font-medium">{activeScenarios[currentIndex].message}</p>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="bg-slate-100 p-4 pt-4 border-t border-slate-200 rounded-t-3xl shadow-[0_-10px_20px_rgba(0,0,0,0.06)] shrink-0 z-20 relative">
              <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto mb-3"></div>
              <p className="text-[11px] font-bold text-slate-500 text-center mb-3 tracking-wide">เลือกคำตอบสไตล์คุณ</p>
              <div className="space-y-3 max-h-[45vh] overflow-y-auto pr-1 pb-2">
                {shuffledChoices.map((choice, index) => (
                  <button
                    key={index}
                    onClick={() => handleChoice(choice.type)}
                    className="w-full text-left bg-white hover:bg-blue-50 hover:border-blue-400 text-slate-700 p-4 rounded-2xl text-[14px] font-medium transition-all duration-200 border border-slate-200 shadow-sm hover:shadow-md active:scale-[0.98] leading-snug break-words"
                  >
                    {choice.text}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* หน้าจอสรุปผล */}
        {gameState === "result" && (
          <div className="flex-1 flex flex-col bg-slate-50 relative overflow-hidden">
            
            <div className="w-full h-full overflow-y-auto pb-40">
              
              {/* พื้นที่สำหรับถ่ายภาพ (printRef) เราเอาออกมาให้โล่งๆ ไม่มีบั๊กเวลา Scroll */}
              <div ref={printRef} className="flex flex-col bg-slate-50 w-full relative">
                <div className={`${resultData[getFinalResult()].color} text-white p-6 pb-12 text-center flex flex-col items-center relative shadow-md shrink-0`}>
                  <Trophy size={32} className="text-white/80 mb-1 mt-2" />
                  <p className="text-white/80 text-xs font-bold tracking-wider mb-1">ฉายาประจำออฟฟิศของคุณคือ</p>
                  <h1 className="text-2xl font-black mb-2">{resultData[getFinalResult()].rpgTitle}</h1>
                  <p className="text-white/90 text-[10px] bg-black/20 px-3 py-1 rounded-full">{resultData[getFinalResult()].discTitle}</p>
                  
                  <div className="absolute -bottom-8 bg-white text-5xl w-20 h-20 rounded-full flex items-center justify-center shadow-xl border-4 border-slate-50">
                    {resultData[getFinalResult()].emoji}
                  </div>
                </div>

                <div className="p-5 pt-12 flex-1 flex flex-col">
                  <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-4 text-center">
                    <p className="text-[14px] text-slate-700 leading-relaxed font-medium">{resultData[getFinalResult()].desc}</p>
                  </div>

                  <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-4">
                    <h3 className="font-bold text-slate-800 mb-3 text-sm border-b pb-2 flex items-center gap-2">
                      <span className="text-[16px]">🤝</span> ทำงานกับใครเวิร์คสุด?
                    </h3>
                    
                    <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl mb-2">
                      <p className="text-[11px] font-bold text-emerald-700 mb-1 flex items-center gap-1"><Zap size={14}/> คู่หูแบกงาน (Best Partner)</p>
                      <p className="font-bold text-emerald-900 text-sm mb-1">{resultData[getFinalResult()].bestPartner.name}</p>
                      <p className="text-xs text-emerald-800 leading-tight">{resultData[getFinalResult()].bestPartner.desc}</p>
                    </div>

                    <div className="bg-red-50 border border-red-200 p-3 rounded-xl">
                      <p className="text-[11px] font-bold text-red-700 mb-1 flex items-center gap-1"><ShieldAlert size={14}/> คู่กรรมทำปวดหัว (Kryptonite)</p>
                      <p className="font-bold text-red-900 text-sm mb-1">{resultData[getFinalResult()].kryptonite.name}</p>
                      <p className="text-xs text-red-800 leading-tight">{resultData[getFinalResult()].kryptonite.desc}</p>
                    </div>
                  </div>

                  <div className="mt-2 text-center text-slate-400 text-[10px] font-bold pb-4">
                    Created by อัพสกิลกับฟุ้ย
                  </div>
                </div>
              </div>
            </div>

            {/* ปุ่มกดลอยอยู่ด้านล่างสุด */}
            <div className="absolute bottom-0 left-0 w-full bg-white/95 backdrop-blur-md p-4 border-t border-slate-200 shadow-[0_-10px_20px_rgba(0,0,0,0.05)] flex flex-col gap-2 z-20">
              <button 
                onClick={handleDownloadImage}
                disabled={isCapturing}
                className="flex items-center justify-center gap-2 w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 transition-colors text-[14px] shadow-md disabled:bg-slate-400"
              >
                <Camera size={18} /> {isCapturing ? "กำลังประมวลผลรูปภาพ..." : "เซฟรูปเอาไปขิงเพื่อนใน Story"}
              </button>
              
              <div className="flex gap-2">
                <a href="https://wheel-of-life-upskill.vercel.app" target="_blank" rel="noreferrer" className="flex-1 bg-slate-800 text-white font-bold py-3 rounded-xl text-center text-xs flex items-center justify-center gap-1 hover:bg-slate-900">
                  <HeartPulse size={14} /> สแกนสมดุลชีวิต
                </a>
                <button onClick={restartGame} className="flex-1 bg-slate-200 text-slate-700 font-bold py-3 rounded-xl text-center text-xs flex items-center justify-center gap-1 hover:bg-slate-300">
                  <RefreshCcw size={14} /> เล่นใหม่อีกครั้ง
                </button>
              </div>
            </div>

          </div>
        )}
      </div>

      <div className="text-slate-400 text-xs font-medium mt-6 tracking-wide sm:block hidden">
        Created by <span className="font-bold text-slate-300">อัพสกิลกับฟุ้ย</span>
      </div>
    </div>
  );
}