import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HardDrive, Cpu, Microchip, MemoryStick, Play, RotateCcw, CheckCircle2 } from 'lucide-react';

const deviceProfiles = {
  hdd: { name: "HDD", interface: "SATA III", bus: "Bus SATA", blockTime: 2.8 },
  sata: { name: "SSD SATA", interface: "SATA / AHCI", bus: "Bus SATA", blockTime: 1.4 },
  nvme: { name: "SSD NVMe", interface: "PCIe / NVMe", bus: "PCI Express", blockTime: 0.55 }
};

export default function SimuladorDMA() {
  const [config, setConfig] = useState({ mode: 'dma', blocks: 8, device: 'sata', speed: 2 });
  
  const [simState, setSimState] = useState({
    running: false,
    phase: 0,
    transferred: 0,
    cpuInterventions: 0,
    elapsed: 0,
    parallel: 0,
    activeNodes: [],
    states: { storage: 'En espera', controller: 'En espera', ram: '0 / 8', cpu: 'Libre' }
  });

  const [packet, setPacket] = useState(null);
  
  const containerRef = useRef(null);
  const nodesRef = {
    storage: useRef(null),
    controller: useRef(null),
    ram: useRef(null),
    cpu: useRef(null)
  };
  const isCancelled = useRef(false);

  const getCenter = (nodeName) => {
    if (!containerRef.current || !nodesRef[nodeName].current) return { x: 0, y: 0 };
    const parentRect = containerRef.current.getBoundingClientRect();
    const nodeRect = nodesRef[nodeName].current.getBoundingClientRect();
    return {
      x: (nodeRect.left - parentRect.left) + (nodeRect.width / 2),
      y: (nodeRect.top - parentRect.top) + (nodeRect.height / 2)
    };
  };

  const animatePacket = (from, to, type, durationMs) => {
    return new Promise((resolve) => {
      if (isCancelled.current) return resolve();
      const realDuration = durationMs / config.speed;
      
      setPacket({
        id: Date.now(),
        fromCoords: getCenter(from),
        toCoords: getCenter(to),
        type,
        duration: realDuration / 1000 
      });

      setTimeout(() => {
        setPacket(null);
        resolve();
      }, realDuration);
    });
  };

  const delay = (ms) => new Promise(res => setTimeout(res, ms / config.speed));

  const startSimulation = async () => {
    if (simState.running) return;
    isCancelled.current = false;
    const profile = deviceProfiles[config.device];
    const isDMA = config.mode === 'dma';

    setSimState(s => ({
      ...s, running: true, phase: 1, transferred: 0, cpuInterventions: 0, elapsed: 0, parallel: 0,
      activeNodes: ['cpu', 'controller'],
      states: { storage: 'En espera', controller: 'Recibiendo orden', ram: `0 / ${config.blocks}`, cpu: 'Configurando' }
    }));

    await animatePacket('cpu', 'controller', 'control', 400);
    await delay(300);
    if (isCancelled.current) return;

    setSimState(s => ({
      ...s, phase: 2,
      states: { ...s.states, storage: 'Leyendo', controller: 'Transfiriendo', cpu: isDMA ? 'Trabajo paralelo' : 'Copiando' }
    }));

    let currentElapsed = 0;
    let currentCpuInt = 1;

    for (let i = 1; i <= config.blocks; i++) {
      if (isCancelled.current) return;
      
      const nodes = ['storage', 'controller', 'ram'];
      if (!isDMA) nodes.push('cpu');
      setSimState(s => ({ ...s, activeNodes: nodes }));

      await animatePacket('storage', 'controller', 'data', 300);
      if (!isDMA) {
        await animatePacket('controller', 'cpu', 'data', 300);
        await animatePacket('cpu', 'ram', 'data', 300);
        currentCpuInt++;
      } else {
        await animatePacket('controller', 'ram', 'data', 400);
      }

      currentElapsed += profile.blockTime * (isDMA ? 1 : 1.6);
      
      setSimState(s => ({
        ...s,
        transferred: i,
        elapsed: currentElapsed,
        cpuInterventions: currentCpuInt,
        parallel: isDMA ? Math.min(100, (i / config.blocks) * 100) : 0,
        states: { ...s.states, ram: `${i} / ${config.blocks}` }
      }));
      await delay(100);
    }

    if (isDMA) {
      setSimState(s => ({ ...s, phase: 3, activeNodes: ['controller', 'cpu'], states: { ...s.states, controller: 'Interrumpiendo', cpu: 'Atendiendo IRQ' } }));
      currentCpuInt++;
      await animatePacket('controller', 'cpu', 'interrupt', 400);
      await delay(300);
    }
    if (isCancelled.current) return;

    setSimState(s => ({
      ...s, running: false, phase: 4, activeNodes: ['ram', 'cpu'], cpuInterventions: currentCpuInt, parallel: isDMA ? 100 : 0,
      states: { storage: 'Completo', controller: 'Completo', ram: `${config.blocks} / ${config.blocks}`, cpu: 'Procesando RAM' }
    }));
  };

  const resetSimulation = () => {
    isCancelled.current = true;
    setPacket(null);
    setSimState({
      running: false, phase: 0, transferred: 0, cpuInterventions: 0, elapsed: 0, parallel: 0, activeNodes: [],
      states: { storage: 'En espera', controller: 'En espera', ram: `0 / ${config.blocks}`, cpu: 'Libre' }
    });
  };

  const progressPercent = Math.round((simState.transferred / config.blocks) * 100);

  const getPhaseData = () => {
    switch(simState.phase) {
      case 0: return { title: "Preparación", desc: "Selecciona un método y pulsa “Iniciar transferencia”." };
      case 1: return { title: "Configuración de la operación", desc: "La CPU indica el origen, destino y cantidad de bloques." };
      case 2: return { title: "Transferencia de bloques", desc: config.mode === 'dma' ? "El controlador DMA mueve los datos directamente hacia la memoria RAM." : "La CPU lee cada bloque y luego lo escribe en la memoria." };
      case 3: return { title: "Interrupción de finalización", desc: "El controlador avisa a la CPU que los bloques están listos en RAM." };
      case 4: return { title: "Datos listos para procesar", desc: "La información reside en la memoria RAM y la CPU puede utilizarla." };
      default: return { title: "", desc: "" };
    }
  };

  return (
    <div className="w-full flex flex-col gap-6 text-slate-200">
      
      {/* CONTENEDOR PRINCIPAL: DASHBOARD */}
      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* PANEL DE CONTROL (IZQUIERDA) */}
        <aside className="w-full lg:w-[320px] bg-[#141c25] border border-slate-800 rounded-xl p-6 shadow-xl flex flex-col gap-6 shrink-0">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <div className="w-2.5 h-2.5 bg-blue-500 rounded-full shadow-[0_0_8px_#3b82f6]"></div>
            <h3 className="font-bold text-slate-200">Panel de control</h3>
          </div>

          <div className="flex flex-col gap-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Método de Transferencia</span>
            
            <label className={`flex flex-col p-4 rounded-xl border cursor-pointer transition-all ${config.mode === 'dma' ? 'border-blue-500 bg-blue-900/10' : 'border-slate-800 bg-[#0b1016] hover:border-slate-600'}`}>
              <div className="flex items-center gap-3 mb-1">
                <input type="radio" checked={config.mode === 'dma'} onChange={() => {setConfig({...config, mode: 'dma'}); resetSimulation();}} disabled={simState.running} className="accent-blue-500 w-4 h-4" />
                <strong className={`text-sm ${config.mode === 'dma' ? 'text-blue-400' : 'text-slate-200'}`}>Con DMA</strong>
              </div>
              <span className="text-xs text-slate-400 pl-7 leading-relaxed">La CPU configura y continúa trabajando.</span>
            </label>

            <label className={`flex flex-col p-4 rounded-xl border cursor-pointer transition-all ${config.mode === 'cpu' ? 'border-blue-500 bg-blue-900/10' : 'border-slate-800 bg-[#0b1016] hover:border-slate-600'}`}>
              <div className="flex items-center gap-3 mb-1">
                <input type="radio" checked={config.mode === 'cpu'} onChange={() => {setConfig({...config, mode: 'cpu'}); resetSimulation();}} disabled={simState.running} className="accent-blue-500 w-4 h-4" />
                <strong className={`text-sm ${config.mode === 'cpu' ? 'text-blue-400' : 'text-slate-200'}`}>Sin DMA</strong>
              </div>
              <span className="text-xs text-slate-400 pl-7 leading-relaxed">La CPU mueve cada bloque hacia la RAM.</span>
            </label>
          </div>

          <div className="flex flex-col gap-3 mt-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex justify-between">
              Bloques por transferir <span className="text-blue-400 font-mono text-sm">{config.blocks}</span>
            </label>
            <input type="range" min="4" max="16" value={config.blocks} disabled={simState.running} onChange={(e) => {setConfig({...config, blocks: Number(e.target.value)}); resetSimulation();}} className="w-full accent-blue-500 h-2 bg-[#0b1016] rounded-lg cursor-pointer" />
          </div>

          <div className="flex flex-col gap-3 mt-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Dispositivo de Origen</label>
            <select value={config.device} disabled={simState.running} onChange={(e) => {setConfig({...config, device: e.target.value}); resetSimulation();}} className="bg-[#0b1016] border border-slate-700 text-slate-200 p-3 rounded-lg outline-none focus:border-blue-500 text-sm">
              <option value="hdd">HDD por SATA</option>
              <option value="sata">SSD por SATA</option>
              <option value="nvme">SSD NVMe por PCI Express</option>
            </select>
          </div>

          <div className="flex flex-col gap-3 mt-auto pt-4">
            <button onClick={startSimulation} disabled={simState.running} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm shadow-[0_0_15px_rgba(59,130,246,0.2)]">
              Iniciar transferencia
            </button>
            <button onClick={resetSimulation} className="w-full bg-transparent hover:bg-slate-800 border border-slate-700 text-slate-300 font-bold py-3.5 rounded-lg transition-colors text-sm">
              Reiniciar
            </button>
          </div>
        </aside>

        {/* PANEL DE SIMULACIÓN (DERECHA) */}
        <div className="flex-1 flex flex-col gap-6 overflow-hidden">
          
          <div className="bg-[#141c25] border border-slate-800 rounded-xl p-4 md:p-6 shadow-xl flex flex-col flex-1">
            
            {/* HEADER SIMULACIÓN */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Estado del Sistema</span>
                <strong className={`block text-lg mt-1 ${simState.phase === 4 ? 'text-blue-400' : 'text-slate-200'}`}>
                  {simState.phase === 4 ? 'Transferencia completada' : simState.phase > 0 ? 'Transferencia en curso' : 'Listo para iniciar'}
                </strong>
              </div>
              <div className="flex flex-wrap gap-3 text-[10px] md:text-[11px] font-bold text-slate-400 bg-[#0b1016] px-4 py-2 rounded-lg border border-slate-800">
                <span className="flex items-center gap-2"><div className="w-3 h-1 bg-cyan-400 rounded-full"></div> Datos</span>
                <span className="flex items-center gap-2"><div className="w-3 h-1 bg-blue-500 rounded-full"></div> Control</span>
                <span className="flex items-center gap-2"><div className="w-3 h-1 bg-amber-500 rounded-full"></div> Interrupción</span>
              </div>
            </div>

            {/* DIAGRAMA DE ARQUITECTURA (CON OVERFLOW PARA MÓVILES) */}
            <div className="w-full overflow-x-auto pb-4 custom-scrollbar">
              <div className="bg-[#0b1016] border border-slate-800 rounded-xl p-6 relative min-h-[300px] min-w-[750px] flex items-center justify-center" ref={containerRef}>
                
                <AnimatePresence>
                  {packet && (
                    <motion.div
                      key={packet.id}
                      initial={{ left: packet.fromCoords.x, top: packet.fromCoords.y, opacity: 0, scale: 0.5 }}
                      animate={{ left: packet.toCoords.x, top: packet.toCoords.y, opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      transition={{ duration: packet.duration, ease: "linear" }}
                      className={`absolute z-50 transform -translate-x-1/2 -translate-y-1/2 ${
                        packet.type === 'data' ? 'w-4 h-3 bg-cyan-400 border border-cyan-200 shadow-[0_0_10px_#22d3ee] rounded-sm' : 
                        packet.type === 'control' ? 'w-3 h-3 bg-blue-500 shadow-[0_0_10px_#3b82f6] rounded-full' : 
                        'w-4 h-4 bg-amber-500 shadow-[0_0_15px_#f59e0b] rounded-full animate-pulse'}`
                      }
                    />
                  )}
                </AnimatePresence>

                <div className="w-full max-w-3xl grid grid-cols-[1fr_60px_1fr_60px_1fr] grid-rows-[auto_40px_auto] items-center relative z-10">
                  
                  {/* FILA 1: DISCO -> DMA -> RAM */}
                  <div ref={nodesRef.storage} className={`relative flex items-center gap-3 p-3 rounded-xl border bg-[#141c25] transition-all col-start-1 row-start-1 ${simState.activeNodes.includes('storage') ? 'border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.15)]' : 'border-slate-700'}`}>
                    <div className="w-10 h-10 rounded border border-slate-600 flex items-center justify-center bg-[#0b1016] text-blue-400 shrink-0"><HardDrive size={20}/></div>
                    <div className="flex flex-col"><span className="text-[10px] text-slate-400 uppercase">Origen</span><strong className="text-sm text-slate-200 leading-tight">{deviceProfiles[config.device].name}</strong><span className="text-[9px] text-slate-500">{deviceProfiles[config.device].interface}</span></div>
                    <span className={`absolute -top-3 right-2 px-2 py-0.5 rounded text-[9px] font-bold border ${simState.states.storage === 'Completo' ? 'bg-blue-900/50 text-blue-400 border-blue-800' : 'bg-[#0b1016] text-slate-400 border-slate-700'}`}>{simState.states.storage}</span>
                  </div>

                  <div className="col-start-2 row-start-1 flex flex-col items-center justify-center w-full relative">
                    <span className="absolute -top-4 text-[9px] text-slate-500 whitespace-nowrap">{deviceProfiles[config.device].bus}</span>
                    <div className="w-full h-1 bg-slate-700 relative"><div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-y-4 border-y-transparent border-l-[6px] border-l-slate-700"></div></div>
                  </div>

                  <div ref={nodesRef.controller} className={`relative flex items-center gap-3 p-3 rounded-xl border bg-[#141c25] transition-all col-start-3 row-start-1 ${simState.activeNodes.includes('controller') ? 'border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.15)]' : 'border-slate-700'}`}>
                    <div className="w-10 h-10 rounded border border-slate-600 flex items-center justify-center bg-[#0b1016] text-cyan-400 font-bold text-xs shrink-0">DMA</div>
                    <div className="flex flex-col"><span className="text-[10px] text-slate-400 uppercase">Intermediario</span><strong className="text-sm text-slate-200 leading-tight">Controlador</strong><span className="text-[9px] text-slate-500 leading-tight mt-0.5">{config.mode === 'dma' ? 'Gestiona transferencia' : 'Entrega bloque a CPU'}</span></div>
                    <span className={`absolute -top-3 right-2 px-2 py-0.5 rounded text-[9px] font-bold border ${simState.states.controller === 'Completo' ? 'bg-blue-900/50 text-blue-400 border-blue-800' : 'bg-[#0b1016] text-slate-400 border-slate-700'}`}>{simState.states.controller}</span>
                  </div>

                  <div className="col-start-4 row-start-1 flex flex-col items-center justify-center w-full relative">
                    <span className="absolute -top-4 text-[9px] text-slate-500 whitespace-nowrap">Bus del sistema</span>
                    <div className="w-full h-1 bg-slate-700 relative"><div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-y-4 border-y-transparent border-l-[6px] border-l-slate-700"></div></div>
                  </div>

                  <div ref={nodesRef.ram} className={`relative flex items-center gap-3 p-3 rounded-xl border bg-[#141c25] transition-all col-start-5 row-start-1 ${simState.activeNodes.includes('ram') ? 'border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.15)]' : 'border-slate-700'}`}>
                    <div className="w-10 h-10 rounded border border-slate-600 flex items-center justify-center bg-[#0b1016] text-blue-400 shrink-0"><MemoryStick size={20}/></div>
                    <div className="flex flex-col"><span className="text-[10px] text-slate-400 uppercase">Destino</span><strong className="text-sm text-slate-200 leading-tight">Memoria RAM</strong><span className="text-[9px] text-slate-500">Buffer de lectura</span></div>
                    <span className={`absolute -top-3 right-2 px-2 py-0.5 rounded text-[9px] font-bold border ${simState.states.ram.split(' ')[0] === simState.states.ram.split(' ')[2] && simState.states.ram !== `0 / ${config.blocks}` ? 'bg-emerald-900/50 text-emerald-400 border-emerald-800' : 'bg-[#0b1016] text-slate-400 border-slate-700'}`}>{simState.states.ram}</span>
                  </div>

                  {/* FILA 2: CONEXIÓN VERTICAL CPU */}
                  <div className="col-start-3 row-start-2 flex justify-center items-center w-full h-full relative">
                    <div className="w-[2px] h-full bg-slate-700"></div>
                    <span className="absolute bg-[#0b1016] px-2 text-[10px] text-blue-400 whitespace-nowrap z-10 text-center">
                      {config.mode === 'dma' ? 'Configura una vez' : 'Copia cada bloque'}
                    </span>
                  </div>

                  {/* FILA 3: CPU */}
                  <div ref={nodesRef.cpu} className={`relative flex items-center gap-3 p-3 rounded-xl border bg-[#141c25] transition-all col-start-3 row-start-3 mx-auto w-full ${simState.activeNodes.includes('cpu') ? 'border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.15)]' : 'border-slate-700'}`}>
                    <div className="w-10 h-10 rounded border border-slate-600 flex items-center justify-center bg-[#0b1016] text-blue-400 font-bold text-xs shrink-0">CPU</div>
                    <div className="flex flex-col"><span className="text-[10px] text-slate-400 uppercase">Procesador</span><strong className="text-sm text-slate-200 leading-tight">Unidad central</strong><span className="text-[9px] text-slate-500 leading-tight mt-0.5">{config.mode === 'dma' ? 'Disponible otras tareas' : 'Ocupada moviendo datos'}</span></div>
                    <span className={`absolute -top-3 right-2 px-2 py-0.5 rounded text-[9px] font-bold border ${simState.states.cpu === 'Libre' || simState.states.cpu === 'Trabajo paralelo' ? 'bg-emerald-900/50 text-emerald-400 border-emerald-800' : 'bg-[#0b1016] text-slate-400 border-slate-700'}`}>{simState.states.cpu}</span>
                  </div>

                </div>
              </div>
            </div>

            {/* FASE Y PROGRESO */}
            <div className="mt-4 flex flex-col gap-4">
              <div className="flex items-center gap-4 bg-[#0b1016] border border-slate-800 p-4 rounded-xl">
                <div className="w-10 h-10 bg-blue-900/20 text-blue-400 rounded-lg flex items-center justify-center font-black text-lg border border-blue-900/50 shrink-0">
                  {simState.phase}
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Fase actual</span>
                  <strong className="block text-sm text-slate-200">{getPhaseData().title}</strong>
                  <p className="text-xs text-slate-400 mt-0.5">{getPhaseData().desc}</p>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Progreso de transferencia</span>
                  <span className="text-xs font-bold text-slate-200">{progressPercent}%</span>
                </div>
                <div className="h-2 bg-[#0b1016] rounded-full overflow-hidden border border-slate-800">
                  <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${progressPercent}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MÉTRICAS INFERIORES */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#141c25] border border-slate-800 p-5 rounded-xl flex flex-col">
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Bloques Transferidos</span>
          <strong className="text-2xl font-black text-slate-100 mt-1">{simState.transferred} <span className="text-sm font-normal text-slate-500">/ {config.blocks}</span></strong>
        </div>
        <div className="bg-[#141c25] border border-slate-800 p-5 rounded-xl flex flex-col">
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Intervenciones CPU</span>
          <strong className="text-2xl font-black text-blue-400 mt-1">{simState.cpuInterventions}</strong>
          <span className="text-[9px] text-slate-500 mt-1">{config.mode === 'dma' ? 'Inicio + interrupción final' : 'Una intervención por bloque'}</span>
        </div>
        <div className="bg-[#141c25] border border-slate-800 p-5 rounded-xl flex flex-col">
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Tiempo Simulado</span>
          <strong className="text-2xl font-black text-amber-400 mt-1">{simState.elapsed.toFixed(1)} <span className="text-sm font-normal text-slate-500">ms</span></strong>
          <span className="text-[9px] text-slate-500 mt-1">Escala conceptual</span>
        </div>
        <div className="bg-[#141c25] border border-slate-800 p-5 rounded-xl flex flex-col">
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Trabajo Paralelo CPU</span>
          <strong className="text-2xl font-black text-emerald-400 mt-1">{Math.round(simState.parallel)}%</strong>
          <span className="text-[9px] text-slate-500 mt-1">Disponible para otras tareas</span>
        </div>
      </div>

      {/* CONCLUSIÓN */}
      {simState.phase === 4 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`p-6 border rounded-xl flex items-start gap-4 shadow-lg ${config.mode === 'dma' ? 'bg-blue-900/10 border-blue-500/50' : 'bg-slate-800 border-slate-600'}`}>
          <CheckCircle2 size={32} className={`mt-1 flex-shrink-0 ${config.mode === 'dma' ? 'text-blue-400' : 'text-slate-400'}`}/>
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest block mb-1">Conclusión del experimento</span>
            <h4 className={`text-lg font-bold ${config.mode === 'dma' ? 'text-blue-300' : 'text-slate-200'}`}>
              {config.mode === 'dma' ? 'DMA liberó a la CPU durante la transferencia' : 'La transferencia programada mantuvo ocupada a la CPU'}
            </h4>
            <p className="text-sm text-slate-300 mt-2 leading-relaxed text-justify">
              {config.mode === 'dma' 
                ? `Tal como exige el proyecto, el simulador muestra conceptualmente cómo el controlador DMA permite que los datos sean transferidos desde el dispositivo de almacenamiento hacia la memoria RAM sin requerir la intervención constante del procesador. Para ${config.blocks} bloques, la CPU solo intervino ${simState.cpuInterventions} veces.`
                : `Para ${config.blocks} bloques, la CPU intervino ${simState.cpuInterventions} veces y no pudo solapar la copia con otro trabajo. El dispositivo no se hizo más lento: aumentó la carga del procesador de forma ineficiente.`}
            </p>
          </div>
        </motion.div>
      )}

    </div>
  );
}