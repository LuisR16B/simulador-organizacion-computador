import { useState, useEffect, useRef } from 'react';
import { Activity, RotateCcw, Gauge, Info } from 'lucide-react';

export default function BusSataNvme() {
  const canvasRef = useRef(null);
  
  const [fileSize, setFileSize] = useState(5);
  const [isRunning, setIsRunning] = useState(false);
  const requestRef = useRef();
  const startTimeRef = useRef(null);

  const dataMB = fileSize * 1024;
  const timeSata = (dataMB / 600).toFixed(2);
  const timeNvme = (dataMB / 3500).toFixed(2);

  const DURATION_NVME = 1500; 
  const DURATION_SATA = 1500 * (3500 / 600); 

  const renderCanvas = (progSata, progNvme, isSimulating) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#0f172a'; // Canvas screen color
    ctx.fillRect(0, 0, w, h);
    
    ctx.strokeStyle = 'rgba(51, 65, 85, 0.4)';
    ctx.lineWidth = 1;
    for (let i = 0; i < w; i += 20) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, h); ctx.stroke(); }
    for (let i = 0; i < h; i += 20) { ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(w, i); ctx.stroke(); }

    const stages = ["1. DISPOSITIVO", "2. CONTROLADOR", "3. RAM (DMA)", "4. CPU"];
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'center';
    
    stages.forEach((text, i) => {
      const sectionW = w / 4;
      const x = (i * sectionW);
      if (i > 0) {
        ctx.beginPath(); ctx.setLineDash([5, 5]); ctx.strokeStyle = '#334155';
        ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
      }
      ctx.fillText(text, x + (sectionW / 2), 25);
    });
    ctx.setLineDash([]);

    const isSataDone = progSata >= 1;
    const isNvmeDone = progNvme >= 1;

    // SATA = CIAN
    ctx.fillStyle = '#22d3ee'; ctx.font = 'bold 16px sans-serif'; ctx.textAlign = 'left';
    ctx.fillText('⚡ BUS SATA III (AHCI)', 30, 75);
    ctx.textAlign = 'right'; ctx.font = '14px monospace'; ctx.fillStyle = isSataDone ? '#22d3ee' : '#94a3b8';
    ctx.fillText(isSataDone ? `Completado en ${timeSata}s` : isSimulating ? 'Transfiriendo...' : 'En espera', w - 30, 75);

    const sataY = 95, sataH = 40;
    ctx.fillStyle = 'rgba(15, 23, 42, 0.8)'; ctx.strokeStyle = '#1e293b';
    ctx.beginPath(); ctx.roundRect(30, sataY, w - 60, sataH, 6); ctx.fill(); ctx.stroke();

    if (progSata > 0) {
      const currentWidth = (w - 60) * progSata;
      ctx.fillStyle = '#06b6d4'; ctx.shadowColor = '#06b6d4'; ctx.shadowBlur = 12;
      ctx.beginPath(); ctx.roundRect(30, sataY, currentWidth, sataH, 6); ctx.fill(); ctx.shadowBlur = 0;
      if (currentWidth > 120) {
        ctx.fillStyle = '#ffffff'; ctx.font = 'bold 14px sans-serif'; ctx.textAlign = 'right';
        ctx.fillText('AHCI (1 COLA)', 30 + currentWidth - 15, sataY + 25);
      }
    }

    // NVMe = AZUL
    ctx.fillStyle = '#60a5fa'; ctx.font = 'bold 16px sans-serif'; ctx.textAlign = 'left';
    ctx.fillText('⚡ BUS PCI Express x4 (NVMe)', 30, 185);
    ctx.textAlign = 'right'; ctx.font = '14px monospace'; ctx.fillStyle = isNvmeDone ? '#60a5fa' : '#94a3b8';
    ctx.fillText(isNvmeDone ? `Completado en ${timeNvme}s` : isSimulating ? 'Procesamiento masivo...' : 'En espera', w - 30, 185);

    const nvmeY = 205, laneH = 10, laneGap = 15;
    ctx.fillStyle = 'rgba(15, 23, 42, 0.8)'; ctx.strokeStyle = '#1e293b';
    ctx.beginPath(); ctx.roundRect(30, nvmeY - 10, w - 60, (laneGap * 4) + 5, 6); ctx.fill(); ctx.stroke();

    if (progNvme > 0) {
      for(let lane = 0; lane < 4; lane++) {
        const currentWidth = (w - 60) * progNvme; 
        ctx.fillStyle = '#3b82f6'; ctx.shadowColor = '#3b82f6'; ctx.shadowBlur = 10;
        ctx.beginPath(); ctx.roundRect(30, nvmeY + (lane * laneGap), currentWidth, laneH, 3); ctx.fill(); ctx.shadowBlur = 0;
      }
      if (progNvme > 0.1) {
        ctx.fillStyle = '#dbeafe'; ctx.font = 'bold 14px sans-serif'; ctx.textAlign = 'left';
        ctx.fillText('PCIe x4 (64,000 COLAS)', 45, nvmeY + 25);
      }
    }
  };

  const animate = (time) => {
    if (!startTimeRef.current) startTimeRef.current = time;
    const elapsed = time - startTimeRef.current;
    let progSata = elapsed / DURATION_SATA;
    let progNvme = elapsed / DURATION_NVME;
    if (progSata > 1) progSata = 1; if (progNvme > 1) progNvme = 1;

    renderCanvas(progSata, progNvme, true);

    if (progSata < 1 || progNvme < 1) {
      requestRef.current = requestAnimationFrame(animate);
    } else {
      setIsRunning(false);
      renderCanvas(1, 1, false);
    }
  };

  const startBenchmark = () => {
    if (isRunning) return;
    setIsRunning(true);
    startTimeRef.current = null;
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
    requestRef.current = requestAnimationFrame(animate);
  };

  const resetBenchmark = () => {
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
    setIsRunning(false);
    renderCanvas(0, 0, false); 
  };

  useEffect(() => {
    renderCanvas(0, 0, false);
    return () => { if (requestRef.current) cancelAnimationFrame(requestRef.current); };
  }, [fileSize]); 

  return (
    <div className="w-full flex flex-col">
      <div className="flex flex-col xl:flex-row gap-8 w-full items-start justify-center">
        
        <div className="relative inline-block border-2 border-slate-700 rounded-[14px] shadow-[0_8px_30px_rgba(0,0,0,0.6)] overflow-hidden flex-[2] w-full">
           <canvas ref={canvasRef} width={1000} height={320} className="bg-[#0f172a] block w-full h-auto" />
        </div>

        <div className="w-full xl:w-80 flex flex-col gap-6">
          <div className="bg-[#141c25] border border-slate-700 p-5 rounded-xl shadow-inner">
            <h4 className="text-sm font-bold text-blue-400 mb-3 uppercase tracking-wider flex items-center gap-2">
              <Gauge size={16} /> Parámetros de Prueba
            </h4>
            <div className="flex flex-col gap-3 mt-2">
              <label className="text-xs text-slate-300 font-semibold flex justify-between">
                Tamaño de archivo:
                <span className="text-blue-400 font-bold font-mono text-sm">{fileSize} GB</span>
              </label>
              <input 
                type="range" min="1" max="50" value={fileSize}
                onChange={(e) => { setFileSize(Number(e.target.value)); resetBenchmark(); }}
                disabled={isRunning}
                className="w-full accent-blue-500 bg-[#0b1016] h-2 rounded-lg cursor-pointer disabled:opacity-50"
              />
              <span className="text-[10px] text-slate-500 font-mono text-right">Volumen: {dataMB.toLocaleString()} MB</span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button 
              onClick={startBenchmark} disabled={isRunning}
              className={`w-full py-4 px-4 rounded-lg font-bold flex items-center justify-center gap-2 transition-all shadow-lg ${
                isRunning ? 'bg-[#0b1016] text-slate-500 cursor-not-allowed border border-slate-700 shadow-none' : 'bg-blue-600 hover:bg-blue-500 text-white hover:shadow-blue-500/25'
              }`}
            >
              <Activity size={20} className={isRunning ? 'animate-pulse text-blue-400' : ''} />
              {isRunning ? 'Evaluando Rendimiento...' : 'Iniciar Simulación'}
            </button>
            {!isRunning && (
              <button 
                onClick={resetBenchmark}
                className="w-full py-3 px-4 rounded-lg text-xs font-semibold bg-[#0b1016] hover:bg-slate-800 text-slate-300 flex items-center justify-center gap-2 border border-slate-700 transition-colors"
              >
                <RotateCcw size={14} /> Limpiar Resultados
              </button>
            )}
          </div>

          <div className="bg-[#141c25] border border-slate-700 border-l-4 border-l-blue-500 p-4 rounded-lg">
             <h4 className="text-blue-400 font-bold text-xs uppercase mb-1 flex items-center gap-1"><Info size={14} /> Cuello de Botella</h4>
             <p className="text-[11px] text-slate-300 leading-relaxed text-justify">
               Sin importar la velocidad de la memoria Flash, el bus <strong>SATA</strong> y el protocolo <strong>AHCI</strong> (1 cola) limitan el rendimiento. <strong>NVMe</strong> vía PCIe procesa miles de colas en paralelo.
             </p>
          </div>
        </div>
      </div>

      <div className="w-full mt-8 bg-[#141c25] border border-slate-700 rounded-xl p-6 shadow-lg">
        <h4 className="text-sm font-bold text-slate-300 uppercase tracking-widest border-b border-slate-700 pb-2 mb-4">
          Comparativa Técnica de Protocolos
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#0b1016] border-l-4 border-cyan-500 p-4 rounded-lg shadow-md">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-3 block">Protocolo SATA / AHCI (Legado)</span>
            <div className="flex justify-between items-baseline border-b border-slate-800 pb-2 mb-2"><span className="text-xs text-slate-400">Ancho de banda:</span><span className="text-sm font-mono text-cyan-400 font-bold">Máx 600 MB/s</span></div>
            <div className="flex justify-between items-baseline border-b border-slate-800 pb-2 mb-2"><span className="text-xs text-slate-400">Colas de comandos:</span><span className="text-sm font-mono text-cyan-400 font-bold">1 Cola</span></div>
            <div className="flex justify-between items-baseline"><span className="text-xs text-slate-400">Profundidad de cola:</span><span className="text-sm font-mono text-cyan-400 font-bold">32 comandos</span></div>
          </div>
          <div className="bg-[#0b1016] border-l-4 border-blue-500 p-4 rounded-lg shadow-md">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-3 block">Protocolo NVMe / PCIe (Actual)</span>
            <div className="flex justify-between items-baseline border-b border-slate-800 pb-2 mb-2"><span className="text-xs text-slate-400">Ancho de banda:</span><span className="text-sm font-mono text-blue-400 font-bold">3,500 - 7,000+ MB/s</span></div>
            <div className="flex justify-between items-baseline border-b border-slate-800 pb-2 mb-2"><span className="text-xs text-slate-400">Colas de comandos:</span><span className="text-sm font-mono text-blue-400 font-bold">64,000 Colas</span></div>
            <div className="flex justify-between items-baseline"><span className="text-xs text-slate-400">Profundidad de cola:</span><span className="text-sm font-mono text-blue-400 font-bold">64,000 comandos</span></div>
          </div>
        </div>
      </div>

    </div>
  );
}