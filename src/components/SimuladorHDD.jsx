import { useState, useEffect, useRef } from 'react';
import { Activity, Disc, Info } from 'lucide-react';

const CANVAS_W = 700;
const CANVAS_H = 500;
const CENTER_X = 210;
const CENTER_Y = (CANVAS_H / 2) - 35; 
const TRACK_RADII = [50, 72, 95, 118, 142]; 
const TRACK_ANGLES = [0.62, 0.72, 0.83, 0.93, 1.05];
const TOTAL_SECTORES_GEOMETRICOS = 16;
const PIVOT_X = CENTER_X + 230;
const PIVOT_Y = CENTER_Y + 110;
const ARM_LENGTH = 230;

export default function SimuladorHDD() {
  const canvasRef = useRef(null);
  const requestRef = useRef();
  const tooltipRef = useRef(null);

  const [stats, setStats] = useState({
    pistaActual: 1,
    seekTime: '0.0',
    latencia: '4.17',
    pistasRecorridas: 0,
    rpm: 7200
  });

  const physicsState = useRef({
    targetTrackIndex: 0,
    currentTrackIndex: 0,
    totalPistasRecorridas: 0,
    currentArmAngle: TRACK_ANGLES[0],
    platterRotation: 0,
    settlingFrames: 0,
    rpm: 7200,
    msPorVuelta: 8.33,
    rotationSpeed: 0.05
  });

  const handleRPMChange = (e) => {
    const newRPM = parseInt(e.target.value);
    const s = physicsState.current;
    
    s.rpm = newRPM;
    s.msPorVuelta = Number((60000 / newRPM).toFixed(2));
    s.rotationSpeed = Number((0.05 * (newRPM / 7200)).toFixed(4));
    
    const latencia = (s.msPorVuelta * 0.5).toFixed(2);
    setStats(prev => ({ ...prev, rpm: newRPM, latencia }));
  };

  const solicitarLectura = (trackIndex) => {
    const s = physicsState.current;
    if (trackIndex === s.targetTrackIndex) return;

    const saltos = Math.abs(trackIndex - s.targetTrackIndex);
    s.totalPistasRecorridas += saltos;
    
    const seekTimeActual = (saltos * 3).toFixed(1);
    const latenciaActual = ((Math.random() * 0.5 + 0.25) * s.msPorVuelta).toFixed(2);

    s.targetTrackIndex = trackIndex;
    s.settlingFrames = 60;

    setStats(prev => ({
      ...prev,
      pistaActual: trackIndex + 1,
      seekTime: seekTimeActual,
      latencia: latenciaActual,
      pistasRecorridas: s.totalPistasRecorridas
    }));
  };

  const getElementUnderCursor = (mouseX, mouseY) => {
    const s = physicsState.current;
    const dxPlatter = mouseX - CENTER_X;
    const dyPlatter = mouseY - CENTER_Y;
    const distPlatter = Math.hypot(dxPlatter, dyPlatter);
    let rawAngle = Math.atan2(dyPlatter, dxPlatter);
    if (rawAngle < 0) rawAngle += Math.PI * 2;

    if (distPlatter <= 35) return { title: "Husillo (Eje del Motor)", desc: "Motor concéntrico que hace girar los platos magnéticos a la velocidad de RPM seleccionada." };
    
    const isOuterRadius = distPlatter >= 132 && distPlatter <= 152;
    const isInGreenArc = rawAngle >= 2.1 && rawAngle <= 4.45;
    if (isOuterRadius && isInGreenArc) return { title: "Cluster (Bloque de Datos)", desc: "Agrupación contigua de varios sectores magnéticos." };

    const activeRadius = TRACK_RADII[s.targetTrackIndex];
    if (Math.abs(distPlatter - activeRadius) <= 8) return { title: `Pista ${s.targetTrackIndex + 1} (Track)`, desc: "Anillo concéntrico de material magnético donde se almacenan datos." };

    const isSectorRadius = distPlatter > 35 && distPlatter <= 152;
    const isInBlueArc = rawAngle >= 4.8 || rawAngle <= 0.35;
    if (isSectorRadius && isInBlueArc) return { title: "Sector Geométrico", desc: "Corte angular del disco que cruza todas las pistas." };
    if (distPlatter <= 160) return { title: "Plato Magnético", desc: "Disco rígido recubierto con material magnético." };

    const headX = PIVOT_X - Math.cos(s.currentArmAngle) * ARM_LENGTH;
    const headY = PIVOT_Y - Math.sin(s.currentArmAngle) * ARM_LENGTH;
    const distPivot = Math.hypot(mouseX - PIVOT_X, mouseY - PIVOT_Y);
    
    const A = mouseX - PIVOT_X, B = mouseY - PIVOT_Y;
    const C = headX - PIVOT_X, D = headY - PIVOT_Y;
    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let param = -1;
    if (lenSq !== 0) param = dot / lenSq;

    let xx, yy;
    if (param < 0) { xx = PIVOT_X; yy = PIVOT_Y; }
    else if (param > 1) { xx = headX; yy = headY; }
    else { xx = PIVOT_X + param * C; yy = PIVOT_Y + param * D; }

    if (distPivot <= 28 || Math.hypot(mouseX - xx, mouseY - yy) <= 16) return { title: "Brazo Actuador (VCM)", desc: "Mueve el cabezal lector mediante electromagnetismo (Genera el Seek Time)." };
    if (mouseX >= 620 && mouseY >= 40 && mouseY <= 360) return { title: "Conectores SATA & Power", desc: "Puertos para la transferencia de datos a la placa base y alimentación eléctrica." };
    if (mouseX >= 25 && mouseX <= 285 && mouseY >= 370 && mouseY <= 482) return { title: "Esquema Lateral (Cilindros)", desc: "Muestra los 3 platos alineados. La misma pista en los 3 platos forma un Cilindro." };
    if (mouseX >= 490 && mouseX <= 570 && mouseY >= 100 && mouseY <= 260) return { title: "Preamplificador y Cable Flex", desc: "Amplifica las señales magnéticas y las transmite a la placa lógica." };

    return null;
  };

  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    const tooltip = tooltipRef.current;
    if (!canvas || !tooltip) return;

    const rect = canvas.getBoundingClientRect();
    const cssX = e.clientX - rect.left;
    const cssY = e.clientY - rect.top;

    const scaleX = CANVAS_W / rect.width;
    const scaleY = CANVAS_H / rect.height;
    
    const internalX = cssX * scaleX;
    const internalY = cssY * scaleY;

    const info = getElementUnderCursor(internalX, internalY);

    if (info) {
      tooltip.style.display = 'block';
      const tooltipEstimatedWidth = 240; 
      const tooltipEstimatedHeight = 100; 
      
      let posX = cssX + 15;
      let posY = cssY + 15;

      if (posX + tooltipEstimatedWidth > rect.width) {
        posX = cssX - tooltipEstimatedWidth + 20; 
      }
      if (posY + tooltipEstimatedHeight > rect.height) {
        posY = cssY - tooltipEstimatedHeight + 20;
      }

      tooltip.style.left = `${posX}px`;
      tooltip.style.top = `${posY}px`;
      tooltip.innerHTML = `<strong style="color: #3b82f6; display: block; margin-bottom: 4px; font-size: 13px;">${info.title}</strong>${info.desc}`;
      canvas.style.cursor = 'pointer';
    } else {
      tooltip.style.display = 'none';
      canvas.style.cursor = 'default';
    }
  };

  const drawScrew = (ctx, x, y, radius = 6) => {
    ctx.save(); ctx.translate(x, y); ctx.beginPath(); ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fillStyle = '#666'; ctx.fill(); ctx.strokeStyle = '#222'; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-radius + 2, 0); ctx.lineTo(radius - 2, 0);
    ctx.moveTo(0, -radius + 2); ctx.lineTo(0, radius - 2);
    ctx.strokeStyle = '#111'; ctx.lineWidth = 1.5; ctx.stroke(); ctx.restore();
  };

  const drawChassis = (ctx) => {
    ctx.save();
    ctx.fillStyle = '#0f172a'; // bg-slate-900 Tailwind
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(20, 20, CANVAS_W - 40, CANVAS_H - 40, 15);
    ctx.fill(); ctx.stroke();
    
    drawScrew(ctx, 35, 35, 7); drawScrew(ctx, CANVAS_W - 35, 35, 7);
    drawScrew(ctx, 35, CANVAS_H - 35, 7); drawScrew(ctx, CANVAS_W - 35, CANVAS_H - 35, 7);

    const connX = CANVAS_W - 55; const connY = 50;
    ctx.fillStyle = '#020617'; ctx.fillRect(connX, connY, 30, 310);
    ctx.strokeStyle = '#000000'; ctx.strokeRect(connX, connY, 30, 310);

    ctx.fillStyle = '#000'; ctx.fillRect(connX + 5, connY + 10, 20, 150);
    ctx.fillStyle = '#020617'; ctx.fillRect(connX + 5, connY + 150, 10, 8);
    ctx.fillStyle = '#d97706'; for (let i = 0; i < 15; i++) ctx.fillRect(connX + 9, connY + 15 + (i * 9.2), 12, 5);

    ctx.fillStyle = '#000'; ctx.fillRect(connX + 5, connY + 175, 20, 85);
    ctx.fillStyle = '#020617'; ctx.fillRect(connX + 5, connY + 250, 10, 6);
    ctx.fillStyle = '#d97706'; for (let i = 0; i < 7; i++) ctx.fillRect(connX + 9, connY + 182 + (i * 10.2), 12, 5.5);

    ctx.fillStyle = '#1e293b'; ctx.fillRect(connX + 5, connY + 270, 20, 30);
    ctx.fillStyle = '#fbbf24'; ctx.fillRect(connX + 8, connY + 275, 14, 4);
    ctx.fillRect(connX + 8, connY + 283, 14, 4); ctx.fillRect(connX + 8, connY + 291, 14, 4);

    ctx.fillStyle = '#94a3b8'; ctx.font = '9px Arial';
    ctx.save(); ctx.translate(connX - 6, connY + 30); ctx.rotate(-Math.PI / 2);
    ctx.fillText('POWER (15-PIN)', -100, 0); ctx.fillText('BUS DATOS (SATA)', -225, 0); ctx.fillText('JUMPER', -270, 0);
    ctx.restore(); ctx.restore();
  };

  const drawPlatter = (ctx, s) => {
    ctx.save(); ctx.translate(CENTER_X, CENTER_Y);
    ctx.beginPath(); ctx.arc(4, 4, 160, 0, Math.PI * 2); ctx.fillStyle = 'rgba(0, 0, 0, 0.6)'; ctx.fill();
    ctx.beginPath(); ctx.arc(0, 0, 160, 0, Math.PI * 2);
    
    const metalGrad = ctx.createRadialGradient(0, 0, 15, 0, 0, 160);
    metalGrad.addColorStop(0, '#e2e8f0'); metalGrad.addColorStop(0.5, '#94a3b8'); metalGrad.addColorStop(1, '#475569');
    ctx.fillStyle = metalGrad; ctx.fill(); ctx.strokeStyle = '#334155'; ctx.lineWidth = 2; ctx.stroke();

    ctx.beginPath(); ctx.moveTo(0, 0);
    ctx.arc(0, 0, 148, (13 * Math.PI * 2) / TOTAL_SECTORES_GEOMETRICOS, (15 * Math.PI * 2) / TOTAL_SECTORES_GEOMETRICOS, false);
    ctx.fillStyle = 'rgba(59, 130, 246, 0.4)'; ctx.fill();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)'; ctx.lineWidth = 1;
    for (let i = 0; i < TOTAL_SECTORES_GEOMETRICOS; i++) {
      const angle = (i * Math.PI * 2) / TOTAL_SECTORES_GEOMETRICOS;
      ctx.beginPath(); ctx.moveTo(35 * Math.cos(angle), 35 * Math.sin(angle)); ctx.lineTo(152 * Math.cos(angle), 152 * Math.sin(angle)); ctx.stroke();
    }

    ctx.beginPath(); ctx.arc(0, 0, TRACK_RADII[s.targetTrackIndex], 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.8)'; ctx.lineWidth = 12; ctx.stroke();

    const drawSector = (trIdx, secIdx, color) => {
      const r = TRACK_RADII[trIdx], a1 = (secIdx * Math.PI * 2) / TOTAL_SECTORES_GEOMETRICOS, a2 = ((secIdx + 1) * Math.PI * 2) / TOTAL_SECTORES_GEOMETRICOS;
      ctx.beginPath(); ctx.arc(0, 0, r - 6, a1, a2, false); ctx.arc(0, 0, r + 6, a2, a1, true);
      ctx.fillStyle = color; ctx.fill(); ctx.strokeStyle = 'rgba(0,0,0,0.3)'; ctx.stroke();
    };
    drawSector(s.targetTrackIndex, 13, '#8b5cf6');
    drawSector(4, 9, '#10b981'); drawSector(4, 10, '#10b981'); drawSector(4, 11, '#10b981');

    ctx.save(); ctx.rotate(s.platterRotation);
    for (let i = 0; i < 2; i++) {
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, 152, (i * Math.PI) + 0.2, (i * Math.PI) + 0.8);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)'; ctx.fill();
    }
    
    ctx.beginPath(); ctx.arc(0, 0, 35, 0, Math.PI * 2);
    const spindleGrad = ctx.createRadialGradient(-8, -8, 2, 0, 0, 35);
    spindleGrad.addColorStop(0, '#fff'); spindleGrad.addColorStop(0.2, '#cbd5e1'); spindleGrad.addColorStop(1, '#334155');
    ctx.fillStyle = spindleGrad; ctx.fill(); ctx.strokeStyle = '#0f172a'; ctx.stroke();
    for (let i = 0; i < 5; i++) drawScrew(ctx, Math.cos((i * Math.PI * 2) / 5) * 20, Math.sin((i * Math.PI * 2) / 5) * 20, 3);
    ctx.restore(); ctx.restore();
  };

  const drawArm = (ctx, s) => {
    ctx.save();
    const headX = PIVOT_X - Math.cos(s.currentArmAngle) * ARM_LENGTH;
    const headY = PIVOT_Y - Math.sin(s.currentArmAngle) * ARM_LENGTH;

    ctx.fillStyle = '#1e293b'; ctx.fillRect(CANVAS_W - 25, 40, 8, 330);
    const flexX = CANVAS_W - 160, flexY = CANVAS_H - 360; 

    ctx.beginPath(); ctx.moveTo(PIVOT_X + 5, PIVOT_Y + 5);
    ctx.bezierCurveTo(PIVOT_X + 30, PIVOT_Y + 50, flexX - 30, flexY + 60, flexX, flexY - 10);
    ctx.strokeStyle = '#d97706'; ctx.lineWidth = 14; ctx.stroke();
    ctx.strokeStyle = '#b45309'; ctx.lineWidth = 2; ctx.stroke();

    ctx.save(); ctx.translate(flexX, flexY); ctx.rotate((Math.PI * 3) / 2);
    ctx.fillStyle = '#cbd5e1'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(35, 0); ctx.lineTo(35, 10); ctx.lineTo(55, 10); ctx.lineTo(55, 35); ctx.lineTo(0, 35); ctx.fill();
    ctx.fillStyle = '#475569'; ctx.fillRect(5, 4, 12, 10);
    for (let r = 0; r < 2; r++) for (let c = 0; c < 3; c++) ctx.fillRect(5 + (c * 16), 16 + (r * 8), 12, 6);
    ctx.restore();

    const perpAngle = s.currentArmAngle + Math.PI / 2;
    const p1X = PIVOT_X + Math.cos(perpAngle) * 12, p1Y = PIVOT_Y + Math.sin(perpAngle) * 12;
    const p2X = PIVOT_X - Math.cos(perpAngle) * 12, p2Y = PIVOT_Y - Math.sin(perpAngle) * 12;
    const flexureLen = ARM_LENGTH - 35;
    const pX = PIVOT_X - Math.cos(s.currentArmAngle) * flexureLen, pY = PIVOT_Y - Math.sin(s.currentArmAngle) * flexureLen;
    const p3X = pX - Math.cos(perpAngle) * 3, p3Y = pY - Math.sin(perpAngle) * 3;
    const p4X = pX + Math.cos(perpAngle) * 3, p4Y = pY + Math.sin(perpAngle) * 3;

    ctx.beginPath(); ctx.moveTo(p1X, p1Y); ctx.lineTo(p2X, p2Y); ctx.lineTo(p3X, p3Y); ctx.lineTo(p4X, p4Y);
    const armGrad = ctx.createLinearGradient(p1X, p1Y, p2X, p2Y);
    armGrad.addColorStop(0, '#f1f5f9'); armGrad.addColorStop(0.5, '#94a3b8'); armGrad.addColorStop(1, '#475569');
    ctx.fillStyle = armGrad; ctx.fill(); ctx.stroke();

    ctx.beginPath(); ctx.moveTo(pX, pY); ctx.lineTo(headX, headY); ctx.strokeStyle = '#64748b'; ctx.lineWidth = 2.5; ctx.stroke();

    ctx.save(); ctx.translate(headX, headY); ctx.rotate(s.currentArmAngle - Math.PI / 2);
    ctx.fillStyle = '#111'; ctx.fillRect(-3, -6, 6, 9);
    ctx.beginPath(); ctx.arc(0, -6, 2, 0, Math.PI * 2); ctx.fillStyle = '#3b82f6'; ctx.fill(); ctx.restore();

    ctx.beginPath(); ctx.arc(PIVOT_X, PIVOT_Y, 18, 0, Math.PI * 2); ctx.fillStyle = '#1e293b'; ctx.fill();
    drawScrew(ctx, PIVOT_X, PIVOT_Y, 7);
    ctx.restore();
  };

  const drawSideView = (ctx, s, x, y, width, height) => {
    ctx.save();
    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)'; ctx.strokeStyle = '#334155';
    ctx.beginPath(); ctx.roundRect(x, y, width, height, 8); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#94a3b8'; ctx.font = '10px monospace'; ctx.fillText('ESQUEMA LATERAL (CILINDROS)', x + 12, y + 16);

    const spindleX = x + 35, spindleTop = y + 24, spindleBot = y + height - 16;
    ctx.fillStyle = '#475569'; ctx.fillRect(spindleX - 4, spindleTop, 8, spindleBot - spindleTop);

    [y + 36, y + 58, y + 80].forEach((pY) => {
      ctx.fillStyle = '#cbd5e1'; ctx.fillRect(spindleX + 4, pY - 2, 195, 4);
      const activeX = spindleX + 30 + (s.targetTrackIndex * 32);
      ctx.fillStyle = '#3b82f6'; ctx.fillRect(activeX - 3, pY - 7, 6, 4); ctx.fillRect(activeX - 3, pY + 3, 6, 4);
    });

    const cylinderX = spindleX + 30 + (s.targetTrackIndex * 32);
    ctx.beginPath(); ctx.setLineDash([2, 2]); ctx.moveTo(cylinderX, y + 26); ctx.lineTo(cylinderX, y + 90);
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.8)'; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = '#3b82f6'; ctx.fillText(`Cilindro ${s.targetTrackIndex + 1}`, cylinderX - 20, y + 102);
    ctx.restore();
  };

  const render = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const s = physicsState.current;

    s.platterRotation += s.rotationSpeed;
    const targetAngle = TRACK_ANGLES[s.targetTrackIndex];
    const distance = targetAngle - s.currentArmAngle;

    if (Math.abs(distance) < 0.03 && s.settlingFrames > 0) {
      s.currentArmAngle = targetAngle + (Math.random() - 0.5) * 0.04;
      s.settlingFrames--;
    } else if (Math.abs(distance) >= 0.001) {
      s.currentArmAngle += distance * 0.12;
    } else {
      s.currentArmAngle = targetAngle;
    }

    let minDiff = Infinity;
    TRACK_ANGLES.forEach((ang, idx) => {
      if (Math.abs(s.currentArmAngle - ang) < minDiff) { minDiff = Math.abs(s.currentArmAngle - ang); s.currentTrackIndex = idx; }
    });

    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
    drawChassis(ctx);
    drawPlatter(ctx, s);
    drawArm(ctx, s);
    drawSideView(ctx, s, 25, 370, 260, 112);

    requestRef.current = requestAnimationFrame(render);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(requestRef.current);
  }, []);

  return (
    <div className="w-full flex flex-col items-center">
      <div className="flex flex-col xl:flex-row gap-6 w-full items-start justify-center">
        
        {/* ÁREA VISUAL PRINCIPAL (CANVAS) */}
        <div className="relative inline-block border-2 border-slate-700 rounded-[14px] shadow-[0_8px_30px_rgba(0,0,0,0.6)]">
          <canvas 
            ref={canvasRef} 
            width={CANVAS_W} 
            height={CANVAS_H} 
            onMouseMove={handleMouseMove}
            onMouseLeave={() => tooltipRef.current && (tooltipRef.current.style.display = 'none')}
            className="bg-[#0f172a] block max-w-full h-auto rounded-[12px]"
          />
          <div 
            ref={tooltipRef} 
            className="absolute hidden bg-slate-900/95 border border-blue-500 rounded-lg p-3 text-xs text-slate-200 pointer-events-none shadow-2xl z-50 w-max max-w-[240px] backdrop-blur-sm"
          ></div>
        </div>

        {/* CONTROLES Y DASHBOARD */}
        <div className="w-full xl:w-80 flex flex-col gap-6">
          
          <div className="bg-[#141c25] border border-slate-800 p-5 rounded-xl shadow-inner">
            <label className="block text-sm font-bold text-blue-400 mb-3 uppercase tracking-wider">
              <Activity size={16} className="inline mr-2" />
              Velocidad del Motor (RPM)
            </label>
            <select 
              className="w-full bg-[#0b1016] text-slate-200 border border-slate-700 hover:border-blue-500 rounded-lg p-3 outline-none transition-colors cursor-pointer"
              value={stats.rpm}
              onChange={handleRPMChange}
            >
              <option value="5400">5,400 RPM (Laptops / Eco)</option>
              <option value="7200">7,200 RPM (PC Estándar)</option>
              <option value="10000">10,000 RPM (Alto rendimiento)</option>
              <option value="15000">15,000 RPM (Empresariales)</option>
            </select>
          </div>

          <div className="bg-[#141c25] border border-slate-800 p-5 rounded-xl shadow-inner">
            <h4 className="text-sm font-bold text-blue-400 mb-3 uppercase tracking-wider flex items-center gap-2">
              <Disc size={16} /> Navegar Cilindros
            </h4>
            <div className="flex flex-col gap-2">
              {[0, 1, 2, 3, 4].map((track) => (
                <button
                  key={track}
                  onClick={() => solicitarLectura(track)}
                  className={`py-3 px-4 rounded-lg font-semibold text-sm transition-all border ${
                    stats.pistaActual === track + 1 
                      ? 'bg-blue-600 border-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.4)]' 
                      : 'bg-[#0b1016] border-slate-800 text-slate-400 hover:border-blue-500 hover:text-blue-400'
                  }`}
                >
                  Pista {track + 1} / Cilindro {track + 1}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-[#141c25] border border-slate-800 border-l-4 border-l-blue-500 p-4 rounded-lg">
             <h4 className="text-blue-400 font-bold text-xs uppercase mb-1 flex items-center gap-1">
               <Info size={14} /> Concepto de Cilindro
             </h4>
             <p className="text-[11px] text-slate-300 leading-relaxed text-justify">
               En un disco de múltiples platos, un <strong>Cilindro</strong> es el conjunto de pistas superpuestas verticalmente. Mover el cabezal a una pista equivale a leer/escribir en todo el cilindro simultáneamente.
             </p>
          </div>

        </div>
      </div>

      {/* DASHBOARD INFERIOR (MÉTRICAS) */}
      <div className="w-full grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <div className="bg-[#141c25] border border-slate-800 border-l-4 border-l-blue-500 p-4 rounded-lg shadow-md">
          <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Cilindro Actual</div>
          <div className="text-2xl font-bold text-slate-100 mt-1">{stats.pistaActual}</div>
        </div>
        <div className="bg-[#141c25] border border-slate-800 border-l-4 border-l-blue-500 p-4 rounded-lg shadow-md">
          <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Seek Time (Búsqueda)</div>
          <div className="text-2xl font-bold text-slate-100 mt-1">{stats.seekTime} <span className="text-sm font-normal text-slate-400">ms</span></div>
        </div>
        <div className="bg-[#141c25] border border-slate-800 border-l-4 border-l-blue-500 p-4 rounded-lg shadow-md">
          <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Latencia Rotacional</div>
          <div className="text-2xl font-bold text-slate-100 mt-1">{stats.latencia} <span className="text-sm font-normal text-slate-400">ms</span></div>
        </div>
        <div className="bg-[#141c25] border border-slate-800 border-l-4 border-l-blue-500 p-4 rounded-lg shadow-md">
          <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Pistas Recorridas</div>
          <div className="text-2xl font-bold text-slate-100 mt-1">{stats.pistasRecorridas}</div>
        </div>
      </div>

    </div>
  );
}