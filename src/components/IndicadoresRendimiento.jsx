import { useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  Save,
  HardDrive,
  Server,
  Zap,
  Timer,
  RotateCcw,
  Play,
} from "lucide-react";

const devices = [
  {
    id: "floppy",
    name: "Disquete (Floppy)",
    icon: Save,
    color: "text-slate-400",
    bg: "bg-slate-500",
    simTime: 4000,
    realTime: "100,000 µs (100 ms)",
    desc: "Búsqueda magnética extremadamente lenta.",
  },
  {
    id: "hdd",
    name: "Disco Duro (HDD)",
    icon: HardDrive,
    color: "text-cyan-400",
    bg: "bg-cyan-500",
    simTime: 1800,
    realTime: "10,000 µs (10 ms)",
    desc: "Depende de RPM y movimiento del cabezal.",
  },
  {
    id: "sata",
    name: "SSD SATA",
    icon: Server,
    color: "text-blue-400",
    bg: "bg-blue-500",
    simTime: 400,
    realTime: "100 µs (0.1 ms)",
    desc: "Acceso eléctrico, limitado por protocolo AHCI.",
  },
  {
    id: "nvme",
    name: "SSD NVMe",
    icon: Zap,
    color: "text-indigo-400",
    bg: "bg-indigo-500",
    simTime: 100,
    realTime: "20 µs (0.02 ms)",
    desc: "Acceso directo a Flash vía PCI Express.",
  },
];

export default function IndicadoresRendimiento() {
  const [isRunning, setIsRunning] = useState(false);
  const [finished, setFinished] = useState({});
  const [simKey, setSimKey] = useState(0);

  const timeoutsRef = useRef([]);

  const startBenchmark = () => {
    if (isRunning) return;

    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];

    // Resetear estados al instante
    setFinished({});
    setIsRunning(false);
    setSimKey((prev) => prev + 1);

    const t0 = setTimeout(() => {
      setIsRunning(true);

      devices.forEach((dev) => {
        const t = setTimeout(() => {
          setFinished((prev) => ({ ...prev, [dev.id]: true }));
        }, dev.simTime);
        timeoutsRef.current.push(t);
      });

      const tEnd = setTimeout(() => {
        setIsRunning(false);
      }, 4000);
      timeoutsRef.current.push(tEnd);
    }, 50);

    timeoutsRef.current.push(t0);
  };

  const resetBenchmark = () => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];

    setIsRunning(false);
    setFinished({});
    setSimKey((prev) => prev + 1);
  };

  return (
    <div className="w-full flex flex-col gap-6 text-slate-200">
      {/* PANEL DE CONTROLES */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-[#141c25] border border-slate-800 p-6 rounded-xl shadow-lg">
        <div>
          <h3 className="text-lg font-bold text-blue-400 flex items-center gap-2">
            <Timer size={20} /> Banco de Pruebas: Tiempo de Acceso
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Esta animación utiliza tiempos simulados a escala para visualizar la
            abismal diferencia que existe en la latencia al intentar acceder a
            un solo bloque de datos.
          </p>
        </div>

        <div className="flex gap-3 shrink-0">
          <button
            onClick={startBenchmark}
            disabled={isRunning}
            className="py-3 px-6 rounded-lg font-bold flex items-center gap-2 transition-all shadow-lg bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play size={18} /> Iniciar Prueba
          </button>

          <button
            onClick={resetBenchmark}
            className="py-3 px-4 rounded-lg font-bold bg-[#0b1016] hover:bg-slate-800 text-slate-300 border border-slate-700 transition-colors flex items-center gap-2"
          >
            <RotateCcw size={18} />
          </button>
        </div>
      </div>

      {/* PISTAS DE CARRERA (BARRAS DE PROGRESO ANIMADAS) */}
      <div className="bg-[#141c25] border border-slate-800 rounded-xl p-6 shadow-xl flex flex-col gap-6">
        {devices.map((dev) => (
          <div key={dev.id} className="flex flex-col gap-1.5">
            <div className="flex justify-between items-end mb-1">
              <div className="flex items-center gap-2">
                <dev.icon size={18} className={dev.color} />
                <span className={`text-sm font-bold ${dev.color}`}>
                  {dev.name}
                </span>
              </div>
              <span
                className={`text-xs font-mono font-bold ${finished[dev.id] ? dev.color : "text-slate-500"}`}
              >
                {finished[dev.id]
                  ? dev.realTime
                  : isRunning
                    ? "Buscando dato..."
                    : "En espera"}
              </span>
            </div>

            <div className="w-full h-4 bg-[#0b1016] rounded-full border border-slate-800 overflow-hidden shadow-inner">
              <motion.div
                key={simKey} // Forzar el reinicio al cambiar la clave
                className={`h-full ${dev.bg} shadow-[0_0_10px_currentColor]`}
                initial={{ width: "0%" }}
                animate={{
                  width: isRunning || finished[dev.id] ? "100%" : "0%",
                }}
                transition={{ duration: dev.simTime / 1000, ease: "linear" }}
              />
            </div>

            {/* Texto corregido para que no se superponga */}
            <span className="text-[11px] text-slate-400 mt-1">{dev.desc}</span>
          </div>
        ))}
      </div>

      {/* CONCLUSIONES CONCEPTUALES */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
        <div className="bg-[#0b1016] border-l-4 border-l-cyan-500 border border-slate-800 p-6 rounded-xl shadow-lg">
          <h4 className="text-cyan-400 font-bold text-sm uppercase tracking-widest mb-3 flex items-center gap-2">
            <HardDrive size={16} /> Medios Mecánicos
          </h4>
          <p className="text-sm text-slate-300 leading-relaxed text-justify mb-3">
            El <strong>Disquete</strong> y el <strong>HDD</strong> sufren de un
            cuello de botella físico imperdonable: dependen de motores
            giratorios y brazos lectores mecánicos.
          </p>
          <p className="text-xs text-slate-400 bg-[#141c25] p-3 rounded border border-slate-700">
            Un HDD moderno (10ms) es 10 veces más rápido que un disquete antiguo
            (100ms), pero sigue siendo una eternidad para la CPU.
          </p>
        </div>

        <div className="bg-[#0b1016] border-l-4 border-l-blue-500 border border-slate-800 p-6 rounded-xl shadow-lg">
          <h4 className="text-blue-400 font-bold text-sm uppercase tracking-widest mb-3 flex items-center gap-2">
            <Zap size={16} /> Estado Sólido (Electrónico)
          </h4>
          <p className="text-sm text-slate-300 leading-relaxed text-justify mb-3">
            El <strong>SSD SATA</strong> elimina la mecánica reduciendo el
            tiempo a microsegundos, pero choca con la limitación del cable SATA.
            El <strong>SSD NVMe</strong> va directo al procesador vía PCIe.
          </p>
          <p className="text-xs text-slate-400 bg-[#141c25] p-3 rounded border border-slate-700">
            El NVMe (0.02ms) es 500 veces más rápido buscando un dato que un HDD
            mecánico. ¡La información fluye casi a la velocidad de la RAM!
          </p>
        </div>
      </div>
    </div>
  );
}
