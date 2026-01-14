import React, { useState, useRef, useEffect } from 'react';
import { Plus, Trash2, RotateCw, Sparkles, Trophy, Share2, Check } from 'lucide-react';

const CatWheelApp = () => {
  // 1. 邏輯優化：從網址讀取選項 (如有)
  const getInitialItems = () => {
    try {
      const params = new URLSearchParams(window.location.search);
      const sharedItems = params.get('items');
      if (sharedItems) {
        return sharedItems.split(',').map((text, index) => ({
          id: index,
          text: decodeURIComponent(text)
        }));
      }
    } catch (e) {
      console.error("無法讀取分享連結");
    }
    return [
      { id: 1, text: '食罐罐' },
      { id: 2, text: '訓晏覺' },
      { id: 3, text: '抓梳化' },
      { id: 4, text: '睇雀仔' },
      { id: 5, text: '去玩逗貓棒' },
    ];
  };

  const [items, setItems] = useState(getInitialItems);
  const [newItemText, setNewItemText] = useState('');
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [winner, setWinner] = useState(null);
  const [showCopied, setShowCopied] = useState(false);

  // 2. 分享功能：生成網址
  const handleShare = () => {
    const itemTexts = items.map(i => encodeURIComponent(i.text)).join(',');
    const shareUrl = `${window.location.origin}${window.location.pathname}?items=${itemTexts}`;
    
    // 複製到剪貼簿
    const textArea = document.createElement("textarea");
    textArea.value = shareUrl;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    } catch (err) {
      console.error('無法複製連結');
    }
    document.body.removeChild(textArea);
  };

  const handleAddItem = (e) => {
    e.preventDefault();
    if (!newItemText.trim()) return;
    setItems([...items, { id: Date.now(), text: newItemText }]);
    setNewItemText('');
  };

  const handleDeleteItem = (id) => {
    if (items.length <= 1) return;
    setItems(items.filter(item => item.id !== id));
  };

  const spinWheel = () => {
    if (isSpinning || items.length === 0) return;
    setIsSpinning(true);
    setWinner(null);
    const randomDegrees = Math.floor(Math.random() * 360);
    const spinCount = 5 + Math.floor(Math.random() * 5); 
    const newRotation = rotation + (spinCount * 360) + randomDegrees;
    setRotation(newRotation);
    setTimeout(() => {
      setIsSpinning(false);
      const degrees = newRotation % 360;
      const sliceAngle = 360 / items.length;
      const effectiveAngle = (360 - degrees + 270) % 360; 
      const winnerIndex = Math.floor(effectiveAngle / sliceAngle);
      setWinner(items[winnerIndex].text);
    }, 3000);
  };

  const getCoordinatesForPercent = (percent) => [
    Math.cos(2 * Math.PI * percent),
    Math.sin(2 * Math.PI * percent)
  ];

  const renderWheelSlices = () => {
    let cumulativePercent = 0;
    const COLORS = ['#A6BCC9', '#F4C2C2', '#B0E0E6', '#FFDAB9', '#E6E6FA', '#98FB98', '#FFB6C1'];
    return items.map((item, index) => {
      const slicePercent = 1 / items.length;
      const [startX, startY] = getCoordinatesForPercent(cumulativePercent);
      cumulativePercent += slicePercent;
      const [endX, endY] = getCoordinatesForPercent(cumulativePercent);
      const largeArcFlag = slicePercent > 0.5 ? 1 : 0;
      const pathData = `M 0 0 L ${startX} ${startY} A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY} L 0 0`;
      const textAngle = cumulativePercent - slicePercent / 2;
      const textX = Math.cos(2 * Math.PI * textAngle) * 0.65;
      const textY = Math.sin(2 * Math.PI * textAngle) * 0.65;
      return (
        <g key={item.id}>
          <path d={pathData} fill={COLORS[index % COLORS.length]} stroke="white" strokeWidth="0.02" />
          <text x={textX} y={textY} fill="#4a5568" fontSize="0.12" fontWeight="bold" textAnchor="middle" alignmentBaseline="middle" transform={`rotate(${(textAngle * 360) + 90}, ${textX}, ${textY})`} style={{ pointerEvents: 'none' }}>
            {item.text.length > 6 ? item.text.substring(0, 5) + '..' : item.text}
          </text>
        </g>
      );
    });
  };

  return (
    <div className="min-h-screen bg-pink-50 font-sans text-gray-700 flex flex-col items-center py-8 px-4 overflow-x-hidden">
      <header className="mb-8 text-center relative z-10">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-600 bg-white px-6 py-3 rounded-full shadow-lg border-4 border-blue-200 flex items-center gap-2">
          <Sparkles className="text-yellow-400" />
          英短幸運轉盤
          <Sparkles className="text-yellow-400" />
        </h1>
        <p className="mt-2 text-gray-500 font-medium">唔知揀咩好？問下主子啦！</p>
      </header>

      <div className="w-full max-w-4xl flex flex-col lg:flex-row gap-8 items-center justify-center">
        <div className="relative w-80 h-80 md:w-96 md:h-96 flex-shrink-0">
          <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 z-20 w-32 h-32 pointer-events-none">
             <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg">
                <ellipse cx="50" cy="60" rx="40" ry="35" fill="#94a3b8" />
                <path d="M15 40 L10 10 L40 25 Z" fill="#94a3b8" />
                <path d="M85 40 L90 10 L60 25 Z" fill="#94a3b8" />
                <path d="M20 35 L18 20 L35 28 Z" fill="#fda4af" />
                <path d="M80 35 L82 20 L65 28 Z" fill="#fda4af" />
                <path d="M 50 25 L 15 62 C 15 62, 20 95, 50 95 C 80 95, 85 62, 85 62 Z" fill="#ffffff" />
                <circle cx="35" cy="55" r="8" fill="#d97706" />
                <circle cx="65" cy="55" r="8" fill="#d97706" />
                <circle cx="35" cy="55" r="3" fill="#000" />
                <circle cx="65" cy="55" r="3" fill="#000" />
                <circle cx="38" cy="52" r="2" fill="#fff" />
                <path d="M46 68 L50 72 L54 68" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round"/>
                <path d="M50 72 L50 76" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round"/>
                <g transform="translate(42, 85)">
                    <path d="M0 0 C-5 10, -5 20, 8 25 C21 20, 21 10, 16 0 Z" fill="#fff" stroke="#94a3b8" strokeWidth="1"/>
                    <ellipse cx="8" cy="12" rx="4" ry="6" fill="#fca5a5" />
                </g>
             </svg>
          </div>
          <div className="w-full h-full rounded-full border-8 border-white shadow-2xl overflow-hidden relative bg-white"
            style={{ transform: `rotate(${rotation}deg)`, transition: isSpinning ? 'transform 3s cubic-bezier(0.25, 0.1, 0.25, 1)' : 'none' }}>
            <svg viewBox="-1 -1 2 2" className="w-full h-full transform -rotate-90">
              {items.length > 0 ? renderWheelSlices() : <circle cx="0" cy="0" r="1" fill="#e2e8f0" />}
            </svg>
          </div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-yellow-300 rounded-full border-4 border-white shadow-md flex items-center justify-center z-10"></div>
          <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-3/4 h-4 bg-black opacity-10 rounded-full blur-md"></div>
        </div>

        <div className="flex-1 w-full max-w-md bg-white rounded-3xl p-6 shadow-xl border border-pink-100">
          <div className="mb-6 min-h-[4rem] flex items-center justify-center bg-blue-50 rounded-2xl p-4 border-2 border-dashed border-blue-200">
             {winner ? (
               <div className="text-center animate-bounce">
                 <p className="text-sm text-gray-500 mb-1">主子選中咗：</p>
                 <h2 className="text-2xl font-bold text-blue-600 flex items-center justify-center gap-2"><Trophy size={24} className="text-yellow-500"/>{winner}</h2>
               </div>
             ) : <p className="text-gray-400 italic text-center">{isSpinning ? "主子思考中...喵..." : "準備好未？"}</p>}
          </div>

          <div className="flex gap-2 mb-4">
            <button onClick={spinWheel} disabled={isSpinning || items.length < 2}
              className={`flex-1 py-4 rounded-2xl text-xl font-bold text-white shadow-lg transform transition-all flex items-center justify-center gap-2 ${isSpinning || items.length < 2 ? 'bg-gray-300' : 'bg-gradient-to-r from-blue-400 to-blue-500 hover:scale-[1.02]'}`}>
              <RotateCw className={isSpinning ? "animate-spin" : ""} /> {isSpinning ? '轉動中...' : '轉啦！'}
            </button>
            <button onClick={handleShare} className="bg-pink-100 text-pink-500 p-4 rounded-2xl hover:bg-pink-200 transition-colors relative group">
              {showCopied ? <Check size={24} className="text-green-500" /> : <Share2 size={24} />}
              <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                {showCopied ? '已複製連結！' : '分享轉盤內容'}
              </span>
            </button>
          </div>

          <div className="space-y-4">
            <form onSubmit={handleAddItem} className="flex gap-2">
              <input type="text" value={newItemText} onChange={(e) => setNewItemText(e.target.value)} placeholder="輸入新選項..." className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-blue-400 bg-gray-50" disabled={isSpinning} />
              <button type="submit" disabled={!newItemText.trim() || isSpinning} className="bg-pink-400 text-white p-3 rounded-xl hover:bg-pink-500 transition-colors"><Plus size={24} /></button>
            </form>

            <div className="max-h-48 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
              {items.map((item, index) => (
                <div key={item.id} className="flex items-center justify-between bg-white p-3 rounded-xl border border-gray-100 shadow-sm group">
                  <div className="flex items-center gap-3">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: ['#A6BCC9', '#F4C2C2', '#B0E0E6', '#FFDAB9', '#E6E6FA', '#98FB98', '#FFB6C1'][index % 7] }}></span>
                    <span className="font-medium text-gray-700">{item.text}</span>
                  </div>
                  <button onClick={() => handleDeleteItem(item.id)} disabled={isSpinning} className="text-gray-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={18} /></button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <footer className="mt-12 text-gray-400 text-sm flex flex-col items-center"><p>🐾 Powered by Cat Energy 🐾</p></footer>
      <style>{`.custom-scrollbar::-webkit-scrollbar { width: 6px; } .custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 4px; } .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }`}</style>
    </div>
  );
};

export default CatWheelApp;
