import { useState } from "react";
import { motion } from "framer-motion";
import { Zap, Microchip, HardDrive, Cpu, AlertCircle } from "lucide-react";

export default function ChipFlash() {
  const [activeChip, setActiveChip] = useState(null);
  const [activeBlock, setActiveBlock] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [hddStatus, setHddStatus] = useState("En espera");
  const [ssdStatus, setSsdStatus] = useState("En espera");
  const [metrics, setMetrics] = useState({
    seek: "0.0 ms",
    latency: "0.00 ms",
  });

  const chipsNand = [0, 1, 2, 3];
  const blocksPerChip = [0, 1, 2, 3];

  const iniciarComparativa = () => {
    if (isSimulating) return;
    setIsSimulating(true);
    setActiveChip(null);
    setActiveBlock(null);
    setSsdStatus("Buscando...");
    setHddStatus("Buscando...");
    setMetrics({ seek: "Calculando...", latency: "Calculando..." });

    setTimeout(() => {
      setActiveChip(Math.floor(Math.random() * 4));
      setSsdStatus("Señal en bus...");
    }, 150);

    setTimeout(() => {
      setActiveBlock(Math.floor(Math.random() * 4));
      setSsdStatus("¡Dato Leído! (0.1ms)");
      setMetrics((prev) => ({ ...prev, seek: "0.0 ms", latency: "0.02 ms" }));
    }, 400);

    setTimeout(() => {
      setHddStatus("Moviendo Cabezal (Seek Time)...");
    }, 1200);

    setTimeout(() => {
      setHddStatus("Rotando Plato (Latencia)...");
    }, 2800);

    setTimeout(() => {
      setHddStatus("¡Dato Leído! (12.5ms)");
      setIsSimulating(false);
    }, 4200);
  };

  const resetear = () => {
    setActiveChip(null);
    setActiveBlock(null);
    setIsSimulating(false);
    setSsdStatus("En espera");
    setHddStatus("En espera");
    setMetrics({ seek: "0.0 ms", latency: "0.00 ms" });
  };

  return (
    <div className="w-full flex flex-col">
      <div className="flex flex-col xl:flex-row gap-6 mb-6">
        {/* LADO IZQUIERDO: DISCO DURO MECÁNICO (HDD) */}
        <div className="flex-1 bg-[#141c25] border border-slate-700 p-6 rounded-xl flex flex-col items-center relative overflow-hidden shadow-lg">
          <h4 className="font-bold text-cyan-400 flex items-center gap-2 mb-6 uppercase tracking-widest text-sm border-b border-slate-700 pb-2 w-full justify-center">
            <HardDrive size={18} /> Disco Mecánico (HDD)
          </h4>

          <div className="relative w-48 h-48 flex items-center justify-center mt-2 mb-8">
            <motion.div
              className="w-44 h-44 rounded-full border-4 border-slate-600 bg-[conic-gradient(at_top_right,_var(--tw-gradient-stops))] from-slate-700 via-slate-600 to-slate-800 absolute shadow-[0_0_15px_rgba(0,0,0,0.5)]"
              animate={{
                rotate: isSimulating && !hddStatus.includes("¡Dato") ? 1440 : 0,
              }}
              transition={{ duration: 4.2, ease: "linear" }}
            >
              <div className="w-10 h-10 rounded-full bg-[#0b1016] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 border-2 border-slate-500 shadow-inner"></div>
            </motion.div>

            <motion.div
              className="absolute bottom-2 right-2 w-4 h-24 bg-gradient-to-b from-slate-400 to-slate-600 origin-bottom rounded-t-full shadow-lg border border-slate-400 z-10"
              initial={{ rotate: 15 }}
              animate={{ rotate: isSimulating ? [15, -30, 20, -15, 5] : 15 }}
              transition={{ duration: 4, times: [0, 0.3, 0.5, 0.8, 1] }}
            />
          </div>

          <div className="w-full bg-[#0b1016] p-4 rounded-lg text-center border border-slate-800 shadow-inner mt-auto">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2">
              Estado Físico:
            </span>
            <span
              className={`text-sm font-mono font-bold ${hddStatus.includes("¡Dato") ? "text-cyan-400" : "text-amber-400"}`}
            >
              {hddStatus}
            </span>
          </div>
        </div>

        {/* LADO DERECHO: UNIDAD DE ESTADO SÓLIDO (SSD) */}
        <div className="flex-[2] bg-blue-950/10 border border-blue-900/30 rounded-xl p-6 relative overflow-hidden flex flex-col shadow-inner">
          <h4 className="font-bold text-blue-400 flex items-center gap-2 mb-6 uppercase tracking-widest text-sm border-b border-blue-900/50 pb-2 w-full justify-center relative z-20">
            <Cpu size={18} /> Memoria Flash NAND (SSD)
          </h4>

          <div
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage: "radial-gradient(#3b82f6 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }}
          ></div>

          <div className="flex items-center justify-between w-full h-full relative z-10 px-4">
            <div className="flex flex-col items-center">
              <div
                className={`w-20 h-24 bg-[#0b1016] border-2 rounded-md flex items-center justify-center shadow-lg transition-colors duration-300 ${isSimulating && !ssdStatus.includes("¡Dato") ? "border-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.5)]" : "border-slate-700"}`}
              >
                <Microchip
                  size={36}
                  className={
                    isSimulating && !ssdStatus.includes("¡Dato")
                      ? "text-blue-400"
                      : "text-slate-500"
                  }
                />
              </div>
              <span className="text-xs text-blue-500/70 font-bold mt-2 bg-[#0b1016] px-2 py-1 rounded border border-blue-900/30">
                Controlador
              </span>
            </div>

            <div className="flex-1 h-40 relative mx-4">
              {chipsNand.map((chipId) => (
                <div
                  key={`bus-${chipId}`}
                  className="absolute w-full flex items-center"
                  style={{ top: `${chipId * 25 + 12}%` }}
                >
                  <div className="w-full h-0.5 bg-blue-900/30 relative overflow-hidden">
                    {activeChip === chipId && (
                      <motion.div
                        className="absolute h-full w-24 bg-gradient-to-r from-transparent via-blue-400 to-transparent shadow-[0_0_10px_#60a5fa]"
                        initial={{ left: "-100%" }}
                        animate={{ left: "100%" }}
                        transition={{ duration: 0.25, ease: "linear" }}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {chipsNand.map((chipId) => (
                <div
                  key={`chip-${chipId}`}
                  className="bg-[#0b1016] border border-slate-700 p-2 rounded flex flex-col items-center relative shadow-lg"
                >
                  <span className="text-[10px] text-slate-500 font-mono mb-2">
                    NAND {chipId}
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {blocksPerChip.map((blockId) => {
                      const isTarget =
                        activeChip === chipId && activeBlock === blockId;
                      return (
                        <motion.div
                          key={`c${chipId}-b${blockId}`}
                          className="w-6 h-6 rounded-sm border border-slate-800"
                          animate={{
                            backgroundColor: isTarget ? "#3b82f6" : "#1e293b",
                            boxShadow: isTarget
                              ? "0 0 15px 2px rgba(59,130,246,0.8)"
                              : "0 0 0 rgba(0,0,0,0)",
                          }}
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="w-full bg-[#0b1016] p-4 rounded-lg text-center border border-slate-800 shadow-inner mt-8 relative z-20">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2">
              Estado Lógico:
            </span>
            <span
              className={`text-sm font-mono font-bold ${ssdStatus.includes("¡Dato") ? "text-blue-400" : "text-blue-500/70"}`}
            >
              {ssdStatus}
            </span>
          </div>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <button
          onClick={iniciarComparativa}
          disabled={isSimulating}
          className={`flex items-center gap-2 px-8 py-4 rounded-lg font-bold transition-all ${
            isSimulating
              ? "bg-[#0b1016] text-slate-500 cursor-not-allowed border border-slate-700"
              : "bg-blue-600 hover:bg-blue-500 text-white shadow-lg hover:shadow-blue-500/25"
          }`}
        >
          <Zap
            size={20}
            className={isSimulating ? "animate-pulse text-blue-300" : ""}
          />
          {isSimulating
            ? "Procesando lectura simultánea..."
            : "Iniciar Comparativa de Lectura"}
        </button>

        {!isSimulating &&
          (activeChip !== null || hddStatus.includes("¡Dato")) && (
            <button
              onClick={resetear}
              className="px-6 py-4 rounded-lg font-bold bg-[#0b1016] hover:bg-slate-800 text-slate-300 border border-slate-700 transition-colors"
            >
              Reiniciar
            </button>
          )}
      </div>

      <div className="w-full bg-[#141c25] border border-slate-700 rounded-xl p-6 shadow-lg">
        <h4 className="text-lg font-bold text-blue-400 border-b border-slate-700 pb-2 mb-4 flex items-center gap-2">
          <AlertCircle size={20} /> Análisis de Rendimiento: HDD vs SSD
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#0b1016] border border-slate-800 p-4 rounded-lg flex flex-col relative overflow-hidden shadow-inner">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-3">
              Tiempo de Búsqueda (Seek Time)
            </span>
            <div className="flex justify-between items-end mb-2">
              <span className="text-xs text-slate-400">HDD Mecánico:</span>
              <span className="text-sm font-mono text-red-400/80">
                ~8.50 ms
              </span>
            </div>
            <div className="flex justify-between items-end">
              <span className="text-xs text-blue-400 font-bold">
                SSD Flash:
              </span>
              <span className="text-xl font-mono text-blue-400">
                {metrics.seek}
              </span>
            </div>
            <p className="mt-4 text-xs text-slate-400 border-t border-slate-800 pt-3 leading-relaxed text-justify">
              <strong>Ausencia de partes mecánicas:</strong> Al carecer de un
              brazo móvil, el SSD no necesita desplazarse físicamente a ninguna
              pista. Su velocidad de acceso es electrónicamente inmediata.
            </p>
          </div>

          <div className="bg-[#0b1016] border border-slate-800 p-4 rounded-lg flex flex-col relative overflow-hidden shadow-inner">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-3">
              Latencia Rotacional
            </span>
            <div className="flex justify-between items-end mb-2">
              <span className="text-xs text-slate-400">HDD (7200 RPM):</span>
              <span className="text-sm font-mono text-red-400/80">
                ~4.16 ms
              </span>
            </div>
            <div className="flex justify-between items-end">
              <span className="text-xs text-blue-400 font-bold">
                SSD Flash:
              </span>
              <span className="text-xl font-mono text-blue-400">
                {metrics.latency}
              </span>
            </div>
            <p className="mt-4 text-xs text-slate-400 border-t border-slate-800 pt-3 leading-relaxed text-justify">
              <strong>Menor latencia:</strong> El HDD debe esperar a que el
              sector correcto gire hasta el cabezal. El SSD utiliza una matriz
              de memoria Flash NAND para acceder directamente a la celda.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
