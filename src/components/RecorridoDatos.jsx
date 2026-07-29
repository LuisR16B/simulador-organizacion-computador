import { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, Info, Zap } from 'lucide-react';

export default function RecorridoDatos() {
  const canvasRef = useRef(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [statusText, setStatusText] = useState('Esperando solicitud...');
  const [currentSimType, setCurrentSimType] = useState(null); 

  const activeSimRef = useRef(null);
  const requestRef = useRef();
  const startTimeRef = useRef(null);

  const DURATION_SATA = 6000;
  const DURATION_NVME = 1500;

  const renderCanvas = (type, fracSata, fracNvme) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // 1. Fondo (Grid)
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = 'rgba(51, 65, 85, 0.4)';
    ctx.lineWidth = 1;
    for (let i = 0; i < width; i += 20) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, height); ctx.stroke();
    }
    for (let i = 0; i < height; i += 20) {
      ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(width, i); ctx.stroke();
    }

    // 2. Coordenadas fijas (SATA en Cian, NVMe en Azul)
    const nodes = {
      hdd: { x: 50, y: 50, w: 90, h: 60, label: 'HDD 3.5"', color: '#06b6d4' },
      chipset: { x: 280, y: 50, w: 80, h: 60, label: 'Chipset SATA', color: '#06b6d4' },
      nvme: { x: 50, y: 190, w: 90, h: 40, label: 'M.2 NVMe', color: '#3b82f6' },
      pcie: { x: 280, y: 180, w: 80, h: 60, label: 'Bus PCIe', color: '#3b82f6' },
      ram: { x: 500, y: 80, w: 60, h: 140, label: 'DIMM RAM', color: '#8b5cf6' },
      cpu: { x: 680, y: 90, w: 90, h: 90, label: 'SOCKET CPU', color: '#f59e0b' }
    };

    // 3. Dibujar Cables
    ctx.beginPath();
    ctx.setLineDash([5, 5]);
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.5)'; // Cian para SATA
    ctx.lineWidth = 2;
    ctx.moveTo(nodes.hdd.x + nodes.hdd.w, nodes.hdd.y + 30);
    ctx.lineTo(nodes.chipset.x, nodes.chipset.y + 30);
    ctx.lineTo(nodes.ram.x, nodes.chipset.y + 30);
    ctx.stroke();

    ctx.setLineDash([]);
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.4)'; // Azul para NVMe
    for(let i = -6; i <= 6; i+=4) {
      ctx.beginPath();
      ctx.moveTo(nodes.nvme.x + nodes.nvme.w, nodes.nvme.y + 20 + i);
      ctx.lineTo(nodes.ram.x, nodes.nvme.y + 20 + i);
      ctx.stroke();
    }

    ctx.beginPath();
    ctx.strokeStyle = 'rgba(139, 92, 246, 0.5)';
    ctx.lineWidth = 4;
    ctx.moveTo(nodes.ram.x + nodes.ram.w, nodes.ram.y + 70);
    ctx.lineTo(nodes.cpu.x, nodes.cpu.y + 45);
    ctx.stroke();

    // 4. Dibujar Nodos Físicos
    Object.values(nodes).forEach(node => {
      ctx.fillStyle = '#0b1016';
      ctx.strokeStyle = node.color;
      ctx.lineWidth = 2;
      ctx.setLineDash([]);
      
      ctx.beginPath();
      ctx.roundRect(node.x, node.y, node.w, node.h, 8);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#e2e8f0';
      ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(node.label, node.x + (node.w / 2), node.y + (node.h / 2));
    });

    // 5. Motor de Dibujo de Paquetes
    const drawPacket = (simType, progress) => {
      if (progress <= 0 || progress >= 1) return;

      const packetColor = simType === 'sata' ? '#06b6d4' : '#3b82f6';
      
      const waypoints = simType === 'sata' 
        ? [
            {x: nodes.hdd.x + nodes.hdd.w, y: nodes.hdd.y + 30},
            {x: nodes.chipset.x + (nodes.chipset.w / 2), y: nodes.chipset.y + 30},
            {x: nodes.ram.x + (nodes.ram.w / 2), y: nodes.hdd.y + 30}, 
            {x: nodes.ram.x + (nodes.ram.w / 2), y: nodes.ram.y + 70}, 
            {x: nodes.cpu.x + 10, y: nodes.cpu.y + 45}
          ]
        : [
            {x: nodes.nvme.x + nodes.nvme.w, y: nodes.nvme.y + 20},
            {x: nodes.pcie.x + (nodes.pcie.w / 2), y: nodes.nvme.y + 20},
            {x: nodes.ram.x + (nodes.ram.w / 2), y: nodes.nvme.y + 20}, 
            {x: nodes.ram.x + (nodes.ram.w / 2), y: nodes.ram.y + 70}, 
            {x: nodes.cpu.x + 10, y: nodes.cpu.y + 45} 
          ];

      const totalSegments = 4;
      const segmentProgress = progress * totalSegments;
      const currentSegment = Math.min(Math.floor(segmentProgress), 3);
      const segmentFraction = segmentProgress - currentSegment;

      const p1 = waypoints[currentSegment];
      const p2 = waypoints[currentSegment + 1];

      const currentX = p1.x + (p2.x - p1.x) * segmentFraction;
      const currentY = p1.y + (p2.y - p1.y) * segmentFraction;

      ctx.shadowColor = packetColor;
      ctx.shadowBlur = 15;
      ctx.fillStyle = packetColor;
      
      if (simType === 'nvme' && currentSegment < 2) {
        ctx.fillRect(currentX - 10, currentY - 6, 20, 4);
        ctx.fillRect(currentX - 10, currentY, 20, 4);
        ctx.fillRect(currentX - 10, currentY + 6, 20, 4);
      } else {
        ctx.fillRect(currentX - 8, currentY - 8, 16, 16);
      }
      ctx.shadowBlur = 0; 
    };

    if (type === 'sata' || type === 'both') drawPacket('sata', fracSata);
    if (type === 'nvme' || type === 'both') drawPacket('nvme', fracNvme);
  };

  const animate = (time) => {
    if (!startTimeRef.current) startTimeRef.current = time;
    const elapsed = time - startTimeRef.current;
    
    const type = activeSimRef.current;
    
    const fracSata = (type === 'sata' || type === 'both') ? Math.min(elapsed / DURATION_SATA, 1) : 0;
    const fracNvme = (type === 'nvme' || type === 'both') ? Math.min(elapsed / DURATION_NVME, 1) : 0;

    renderCanvas(type, fracSata, fracNvme);

    if (type === 'sata') {
      if (fracSata < 0.25) setStatusText("Buscando en sectores magnéticos...");
      else if (fracSata < 0.50) setStatusText("Cuello de botella en Controlador SATA (1 Cola)...");
      else if (fracSata < 0.75) setStatusText("Transfiriendo a RAM y consolidando datos (DMA)...");
      else setStatusText("CPU procesando datos a través del bus...");
    } else if (type === 'nvme') {
      if (fracNvme < 0.25) setStatusText("Extracción en paralelo de Memoria Flash...");
      else if (fracNvme < 0.50) setStatusText("Pasando por Bus PCI Express...");
      else if (fracNvme < 0.75) setStatusText("Copiado directo a RAM y consolidación (DMA Integrado)...");
      else setStatusText("CPU procesando datos a través del bus...");
    } else if (type === 'both') {
      if (fracNvme < 1) setStatusText("Competición: NVMe liderando, HDD buscando sectores...");
      else if (fracSata < 1) setStatusText("NVMe finalizó. HDD sufre cuello de botella en AHCI...");
      else setStatusText("CPU terminó de procesar ambos buses.");
    }

    const isDone = type === 'both' ? fracSata === 1 : (type === 'sata' ? fracSata === 1 : fracNvme === 1);

    if (!isDone) {
      requestRef.current = requestAnimationFrame(animate);
    } else {
      setIsSimulating(false);
      if (type === 'sata') setStatusText('Lectura completada (Alta latencia)');
      else if (type === 'nvme') setStatusText('Lectura completada (Ultrarrápida)');
      else setStatusText('Comparativa completada (NVMe es ~4x más rápido)');
    }
  };

  const startSimulation = (type) => {
    if (isSimulating) return;
    setIsSimulating(true);
    setCurrentSimType(type);
    activeSimRef.current = type;
    startTimeRef.current = null;
    
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
    requestRef.current = requestAnimationFrame(animate);
  };

  const resetSimulation = () => {
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
    setIsSimulating(false);
    setCurrentSimType(null);
    activeSimRef.current = null;
    setStatusText('Esperando solicitud...');
    renderCanvas(null, 0, 0); 
  };

  useEffect(() => {
    renderCanvas(null, 0, 0);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  return (
    <div className="flex flex-col xl:flex-row gap-6 w-full text-slate-200">
      
      {/* COLUMNA IZQUIERDA: CANVAS Y CONTROLES */}
      <div className="flex-[2] bg-[#141c25] border border-slate-700 rounded-xl p-6 shadow-xl flex flex-col gap-6">
        
        <div className="w-full overflow-x-auto flex justify-center bg-[#0b1016] rounded-lg border border-slate-800 shadow-inner">
          <canvas 
            ref={canvasRef} 
            width={800} 
            height={300} 
            className="max-w-full h-auto rounded-lg"
          />
        </div>

        <div className="text-center p-3 bg-[#0b1016] border border-slate-800 rounded-lg">
          <span className="text-xs font-mono text-slate-500 uppercase tracking-widest">Estado del Sistema: </span>
          <span className={`text-sm font-bold ml-2 ${currentSimType === 'nvme' ? 'text-blue-400' : currentSimType === 'sata' ? 'text-cyan-400' : currentSimType === 'both' ? 'text-purple-400' : 'text-slate-300'}`}>
            {statusText}
          </span>
        </div>

        <div className="flex flex-wrap justify-center gap-4 mt-2">
          <button 
            onClick={() => startSimulation('sata')} disabled={isSimulating}
            className="py-3 px-6 rounded-lg font-bold flex items-center gap-2 transition-all shadow-lg bg-cyan-600 hover:bg-cyan-500 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play size={18} /> Ruta SATA (HDD)
          </button>
          
          <button 
            onClick={() => startSimulation('nvme')} disabled={isSimulating}
            className="py-3 px-6 rounded-lg font-bold flex items-center gap-2 transition-all shadow-lg bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play size={18} /> Ruta PCIe (NVMe)
          </button>

          <button 
            onClick={() => startSimulation('both')} disabled={isSimulating}
            className="py-3 px-6 rounded-lg font-bold flex items-center gap-2 transition-all shadow-lg bg-purple-600 hover:bg-purple-500 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Zap size={18} /> Comparar Rutas
          </button>

          <button 
            onClick={resetSimulation}
            className="py-3 px-4 rounded-lg font-bold bg-[#0b1016] hover:bg-slate-800 text-slate-300 border border-slate-700 transition-colors flex items-center gap-2"
          >
            <RotateCcw size={18} />
          </button>
        </div>
      </div>

      {/* COLUMNA DERECHA: EXPLICACIÓN TEÓRICA */}
      <div className="flex-1 bg-[#141c25] border border-slate-700 rounded-xl p-6 shadow-xl flex flex-col gap-6 overflow-y-auto max-h-[600px]">
        
        <h3 className="text-lg font-bold text-blue-400 border-b border-slate-700 pb-2 flex items-center gap-2">
          <Info size={20} /> Impacto en el Rendimiento
        </h3>

        <div className="space-y-5">
          <div className="bg-[#0b1016] p-4 rounded-lg border border-slate-800 border-l-4 border-l-cyan-500">
            <h4 className="text-cyan-400 font-semibold text-sm">Recorrido HDD (SATA)</h4>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed text-justify">
              Los datos viajan desde el disco hacia el <strong>Controlador SATA</strong>. Debido a la naturaleza mecánica y a la única cola de comandos del protocolo AHCI, se genera un cuello de botella antes de pasar por la memoria RAM hacia el procesador[cite: 8].
            </p>
          </div>

          <div className="bg-[#0b1016] p-4 rounded-lg border border-slate-800 border-l-4 border-l-blue-500">
            <h4 className="text-blue-400 font-semibold text-sm">Recorrido SSD NVMe</h4>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed text-justify">
              El protocolo NVMe omite el controlador heredado. Se comunica de manera directa usando carriles <strong>PCI Express</strong>, permitiendo un flujo paralelo ininterrumpido hacia la memoria RAM y la CPU, logrando velocidades exponenciales[cite: 8].
            </p>
          </div>

          <div className="p-4 bg-[#0b1016] border border-slate-700 rounded-lg shadow-inner border-l-4 border-l-purple-500">
            <h4 className="text-purple-400 font-semibold text-sm border-b border-slate-800 pb-2 mb-3">Integración DMA (Direct Memory Access)</h4>
            <p className="text-xs text-slate-300 leading-relaxed text-justify">
              Ambos recorridos utilizan DMA. Al transferir información, el controlador toma el control del bus y envía los datos directamente a la <strong>Memoria RAM</strong> sin que la CPU intervenga byte por byte. La CPU se activa únicamente al recibir la interrupción de finalización, mejorando la eficiencia general[cite: 8].
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}