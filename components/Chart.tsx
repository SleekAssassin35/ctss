
import React, { useState, useMemo, useEffect } from 'react';
import { ComposedChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Coin, TimeFrame, Candle } from '../types';
import { TIME_FRAMES, VISIBLE_CANDLES } from '../constants';
import { resampleCandles } from '../services/gameEngine';
import { ZoomIn, ZoomOut, MoveLeft, MoveRight } from 'lucide-react';

interface ChartProps {
  data: Coin['history'];
  color: string;
}

const Chart: React.FC<ChartProps> = ({ data, color }) => {
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('1H');
  const [zoomIndex, setZoomIndex] = useState<number>(0); 
  // Dynamic visible count for zooming (candle density)
  const [visibleCount, setVisibleCount] = useState<number>(VISIBLE_CANDLES['1H']);

  // Reset view when timeframe changes
  useEffect(() => {
    setZoomIndex(0);
    setVisibleCount(VISIBLE_CANDLES[timeFrame]);
  }, [timeFrame]);
  
  // 1. Resample Data based on selected timeframe
  const resampledData = useMemo(() => {
    return resampleCandles(data, timeFrame);
  }, [data, timeFrame]);

  // 2. Calculate Slice for View
  const chartData = useMemo(() => {
      const total = resampledData.length;
      if (total === 0) return [];

      const endIndex = Math.max(0, total - zoomIndex);
      const startIndex = Math.max(0, endIndex - visibleCount);
      
      const sliced = resampledData.slice(startIndex, endIndex);

      return sliced.map(c => ({
        ...c,
        range: [c.low, c.high],
        displayDate: c.time // Use formatted game time
      }));
  }, [resampledData, visibleCount, zoomIndex]);

  const handlePan = (direction: 'LEFT' | 'RIGHT') => {
      const step = Math.max(1, Math.floor(visibleCount / 10)); // Jump 10%
      if (direction === 'LEFT') {
          // Move view to past -> Increase zoomIndex
          setZoomIndex(prev => Math.min(prev + step, Math.max(0, resampledData.length - visibleCount)));
      } else {
          // Move view to future -> Decrease zoomIndex
          setZoomIndex(prev => Math.max(0, prev - step));
      }
  };

  const handleZoom = (direction: 'IN' | 'OUT') => {
      const step = Math.max(5, Math.floor(visibleCount * 0.1)); // Zoom step size
      if (direction === 'IN') {
          // Show fewer candles (min 20)
          setVisibleCount(prev => Math.max(20, prev - step));
      } else {
          // Show more candles (max 500 or data length)
          setVisibleCount(prev => Math.min(500, prev + step));
      }
  };

  // Handle Mouse Wheel for Zooming
  const handleWheel = (e: React.WheelEvent) => {
    // Prevent default page scroll if needed, though usually managed by CSS overflow
    if (e.deltaY < 0) {
      handleZoom('IN');
    } else {
      handleZoom('OUT');
    }
  };

  return (
    <div className="w-full h-full flex flex-col relative group" onWheel={handleWheel}>
      {/* Controls Header */}
      <div className="flex justify-between items-center mb-2 px-2 z-10">
        {/* Timeframes */}
        <div className="flex gap-1">
            {TIME_FRAMES.map(tf => (
            <button
                key={tf}
                onClick={() => setTimeFrame(tf)}
                className={`text-[10px] font-bold px-2 py-1 rounded transition-colors
                ${timeFrame === tf ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'}`}
            >
                {tf}
            </button>
            ))}
        </div>

        {/* Zoom & Pan Controls */}
        <div className="flex items-center gap-3">
            {/* Zoom Buttons */}
            <div className="flex items-center gap-1 bg-slate-800/50 rounded p-1">
                 <button onClick={() => handleZoom('OUT')} className="p-1 hover:bg-slate-700 rounded text-slate-400" title="Zoom Out">
                    <ZoomOut size={14}/>
                 </button>
                 <button onClick={() => handleZoom('IN')} className="p-1 hover:bg-slate-700 rounded text-slate-400" title="Zoom In">
                    <ZoomIn size={14}/>
                 </button>
            </div>

            {/* Pan Buttons */}
            <div className="flex items-center gap-2 bg-slate-800/50 rounded p-1">
                 <button onClick={() => handlePan('LEFT')} className="p-1 hover:bg-slate-700 rounded text-slate-400"><MoveLeft size={14}/></button>
                 <span className="text-[10px] text-slate-500 font-mono min-w-[50px] text-center select-none">
                     {zoomIndex === 0 ? "LIVE" : `-${zoomIndex}`}
                 </span>
                 <button onClick={() => handlePan('RIGHT')} className="p-1 hover:bg-slate-700 rounded text-slate-400"><MoveRight size={14}/></button>
            </div>
        </div>
      </div>

      <div className="flex-1 w-full min-h-0 relative">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.2} />
            
            <XAxis 
                dataKey="displayDate" 
                minTickGap={50} 
                tick={{ fill: '#64748b', fontSize: 9 }} 
                axisLine={{ stroke: '#334155' }}
                tickLine={false}
            />
            
            <YAxis 
              domain={['auto', 'auto']} 
              orientation="right" 
              tick={{ fill: '#94a3b8', fontSize: 10 }} 
              tickFormatter={(val) => `$${val.toFixed(val < 1 ? 6 : 2)}`}
              stroke="#334155"
              width={55}
            />
            
            <Tooltip 
              cursor={{ stroke: '#475569', strokeWidth: 1, strokeDasharray: '4 4' }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload as Candle & { displayDate: string };
                  const isBull = d.close >= d.open;
                  return (
                    <div className="bg-slate-900 border border-slate-700 p-2 rounded text-xs text-slate-200 shadow-xl z-50 backdrop-blur-md bg-opacity-90">
                      <p className="font-bold mb-1 text-slate-400 border-b border-slate-700 pb-1">{d.displayDate}</p>
                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5">
                        <span className="text-slate-500">O:</span> <span className="font-mono">{d.open.toFixed(d.open<1?6:2)}</span>
                        <span className="text-slate-500">H:</span> <span className="font-mono">{d.high.toFixed(d.high<1?6:2)}</span>
                        <span className="text-slate-500">L:</span> <span className="font-mono">{d.low.toFixed(d.low<1?6:2)}</span>
                        <span className="text-slate-500">C:</span> <span className="font-mono">{d.close.toFixed(d.close<1?6:2)}</span>
                      </div>
                      <p className={`mt-1 font-bold text-right ${isBull ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {((d.close - d.open)/d.open * 100).toFixed(2)}%
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />

            <Bar 
               dataKey="range"
               shape={(props: any) => {
                   const { x, width, y, height, payload } = props;
                   const { open, close, high, low } = payload;
                   
                   const isBull = close >= open;
                   const color = isBull ? '#10b981' : '#f43f5e';
                   
                   const range = high - low;
                   if (range === 0) return null;
                   const ratio = height / range;
                   
                   const bodyTopPrice = Math.max(open, close);
                   const bodyBottomPrice = Math.min(open, close);
                   
                   const bodyTopOffset = (high - bodyTopPrice) * ratio;
                   const bodyHeight = (bodyTopPrice - bodyBottomPrice) * ratio;
                   
                   // Ensure body has at least 1px height
                   const visualBodyHeight = Math.max(1, bodyHeight);
                   
                   // Dynamic Candle Width based on density
                   // If many candles, ensure minimal gap
                   const gap = width > 4 ? 2 : 0;
                   const candleWidth = Math.max(1, width - gap); 
                   const wickX = x + width / 2;
                   
                   return (
                     <g>
                       {/* Wick */}
                       <line x1={wickX} y1={y} x2={wickX} y2={y + height} stroke={color} strokeWidth={Math.max(1, width * 0.1)} opacity={0.8} />
                       {/* Body */}
                       <rect 
                         x={x + (width - candleWidth)/2} 
                         y={y + bodyTopOffset} 
                         width={candleWidth} 
                         height={visualBodyHeight} 
                         fill={color} 
                       />
                     </g>
                   );
               }}
               isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
        
        {/* Overlay for Zoom Hint */}
        {chartData.length > 0 && (
           <div className="absolute bottom-2 left-2 text-[9px] text-slate-600 select-none pointer-events-none">
             {visibleCount} Candles ({timeFrame}) - Scroll to Zoom
           </div>
        )}
      </div>
      
      {/* Pan Slider */}
      <div className="px-2 h-4 flex items-center">
          <input 
            type="range" 
            min="0" 
            max={Math.max(0, resampledData.length - visibleCount)} 
            value={Math.max(0, resampledData.length - visibleCount) - zoomIndex}
            onChange={(e) => {
                const val = parseInt(e.target.value);
                const max = Math.max(0, resampledData.length - visibleCount);
                setZoomIndex(max - val);
            }}
            className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
      </div>
    </div>
  );
};

export default Chart;
