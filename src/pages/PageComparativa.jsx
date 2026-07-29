import { useState } from 'react';
import { ArrowRight } from 'lucide-react';

// Base de datos exacta del código original de tu compañero
const comparisons = {
  floppy: {
    classic: { symbol: "FD", name: "Disco flexible", description: "Medio magnético removible, económico pero lento y de muy poca capacidad.", specs: [["Capacidad", "1,44 MB"], ["Acceso", "≈ 100–300 ms"], ["Transferencia", "≈ 0,05 MB/s"], ["Mecánica", "Flexible y móvil"]] },
    modern: { symbol: "HDD", name: "Disco duro", description: "Almacenamiento magnético sellado, con mayor densidad, velocidad y confiabilidad.", specs: [["Capacidad", "GB a TB"], ["Acceso", "≈ 8–15 ms"], ["Transferencia", "≈ 150 MB/s"], ["Mecánica", "Platos rígidos"]] },
    improvements: {
      speed: ["Miles de veces más transferencia", "El HDD mueve bloques mucho mayores por segundo."],
      capacity: ["De megabytes a terabytes", "La densidad magnética permite almacenar millones de veces más datos."],
      efficiency: ["Menos cambios de medio", "Más datos permanecen disponibles en una sola unidad."]
    }
  },
  hdd: {
    classic: { symbol: "HDD", name: "Disco duro", description: "Usa platos giratorios y un cabezal que debe posicionarse físicamente.", specs: [["Capacidad", "1–20 TB"], ["Acceso", "≈ 8–15 ms"], ["Transferencia", "≈ 150 MB/s"], ["Partes móviles", "Sí"]] },
    modern: { symbol: "SSD", name: "SSD SATA", description: "Utiliza memoria flash, sin movimiento mecánico y con acceso electrónico.", specs: [["Capacidad", "250 GB–8 TB"], ["Acceso", "≈ 0,1 ms"], ["Transferencia", "≈ 550 MB/s"], ["Partes móviles", "No"]] },
    improvements: {
      speed: ["Acceso decenas de veces menor", "Desaparecen el seek time y la latencia rotacional."],
      capacity: ["Alta densidad en poco espacio", "La memoria flash permite formatos compactos y resistentes."],
      efficiency: ["Menor consumo y ruido", "No necesita motores ni movimiento del cabezal."]
    }
  },
  ssd: {
    classic: { symbol: "SATA", name: "SSD SATA", description: "Memoria flash limitada por la interfaz SATA y el protocolo AHCI.", specs: [["Enlace", "SATA III"], ["Ancho de banda", "6 Gb/s"], ["Colas", "1"], ["Comandos/cola", "32"]] },
    modern: { symbol: "NVMe", name: "SSD NVMe", description: "Memoria flash conectada a PCIe mediante un protocolo diseñado para alto paralelismo.", specs: [["Enlace", "PCI Express"], ["Transferencia", "GB/s"], ["Colas", "Hasta 65.535"], ["Comandos/cola", "Hasta 65.536"]] },
    improvements: {
      speed: ["Varios GB/s", "PCIe ofrece más ancho de banda que SATA."],
      capacity: ["Escala con más líneas PCIe", "Las generaciones y configuraciones del enlace aumentan el caudal."],
      efficiency: ["Más paralelismo, menos latencia", "NVMe procesa muchas solicitudes simultáneas con menor sobrecarga."]
    }
  },
  firmware: {
    classic: { symbol: "BIOS", name: "BIOS", description: "Firmware tradicional que inicializa el hardware y arranca usando mecanismos heredados.", specs: [["Interfaz", "16 bits"], ["Particiones", "MBR"], ["Disco típico", "Hasta 2 TB con MBR"], ["Extensión", "Limitada"]] },
    modern: { symbol: "UEFI", name: "UEFI", description: "Firmware moderno, modular y preparado para hardware y sistemas actuales.", specs: [["Interfaz", "32/64 bits"], ["Particiones", "GPT"], ["Discos", "Mayores de 2 TB"], ["Seguridad", "Secure Boot"]] },
    improvements: {
      speed: ["Inicialización más flexible", "UEFI puede optimizar el proceso de arranque del hardware moderno."],
      capacity: ["Compatibilidad con GPT", "Permite arrancar desde discos de gran capacidad y usar más particiones."],
      efficiency: ["Entorno modular y extensible", "Incluye controladores, servicios y una interfaz más avanzada."]
    }
  },
  bus: {
    classic: { symbol: "SATA", name: "Bus SATA", description: "Enlace serial dedicado principalmente a dispositivos de almacenamiento.", specs: [["SATA III", "6 Gb/s"], ["Topología", "Punto a punto"], ["Protocolo común", "AHCI"], ["Uso", "HDD y SSD SATA"]] },
    modern: { symbol: "PCIe", name: "PCI Express", description: "Interconexión serial de propósito general con múltiples líneas y alta escalabilidad.", specs: [["Enlace", "Varias líneas"], ["Escalabilidad", "Por generación"], ["Protocolo SSD", "NVMe"], ["Uso", "GPU, red, SSD"]] },
    improvements: {
      speed: ["Mayor ancho de banda", "PCIe suma líneas y mejora su velocidad en cada generación."],
      capacity: ["Más dispositivos y configuraciones", "La arquitectura admite diferentes cantidades de líneas por dispositivo."],
      efficiency: ["Acceso más directo", "Un SSD NVMe evita la capa SATA/AHCI y aprovecha colas paralelas."]
    }
  }
};

export default function PageComparativa() {
  const [activeTab, setActiveTab] = useState('floppy');
  const activeComp = comparisons[activeTab];

  return (
    <div className="w-full flex flex-col text-slate-200">
      
      {/* CABECERA */}
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-extrabold text-white">Evolución Tecnológica</h2>
        <p className="text-sm text-slate-400 mt-2 max-w-2xl mx-auto">
          De los medios clásicos al almacenamiento moderno. Selecciona una comparación para revisar cómo evolucionaron la velocidad, capacidad y eficiencia.
        </p>
      </div>

      <div className="bg-[#141c25] border border-slate-800 rounded-2xl p-6 md:p-8 shadow-xl">
        
        {/* PESTAÑAS DE NAVEGACIÓN */}
        <div className="flex flex-wrap gap-3 mb-8 border-b border-slate-800 pb-6 justify-center">
          {[
            { id: 'floppy', label: 'Disquete → HDD' },
            { id: 'hdd', label: 'HDD → SSD SATA' },
            { id: 'ssd', label: 'SSD SATA → NVMe' },
            { id: 'firmware', label: 'BIOS → UEFI' },
            { id: 'bus', label: 'SATA → PCI Express' }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all border shadow-sm ${
                activeTab === tab.id 
                  ? 'bg-blue-600 border-blue-500 text-white shadow-[0_0_10px_rgba(59,130,246,0.3)]' 
                  : 'bg-[#0b1016] text-slate-400 border-slate-700 hover:border-blue-500 hover:text-blue-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TARJETAS COMPARATIVAS */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-6 items-stretch">
          
          {/* Tarjeta Tecnología Clásica */}
          <div className="bg-[#0b1016] border border-slate-800 p-6 md:p-8 rounded-xl relative shadow-inner flex flex-col">
            <span className="absolute top-0 right-0 bg-slate-800 text-slate-400 text-[10px] font-bold px-4 py-1.5 rounded-bl-xl rounded-tr-xl uppercase tracking-widest">Tecnología Clásica</span>
            
            <div className="w-14 h-14 bg-slate-900 border border-slate-700 rounded-xl flex items-center justify-center font-black text-slate-500 mb-5 text-xl">
              {activeComp.classic.symbol}
            </div>
            <h3 className="text-2xl font-bold text-slate-200">{activeComp.classic.name}</h3>
            <p className="text-sm text-slate-400 mt-3 min-h-[50px] leading-relaxed">
              {activeComp.classic.description}
            </p>
            
            <div className="grid grid-cols-2 gap-3 mt-6 pt-6 border-t border-slate-800 mt-auto">
              {activeComp.classic.specs.map((spec, index) => (
                 <div key={index} className="bg-[#141c25] p-3 rounded-lg border border-slate-700/50">
                   <span className="block text-[10px] uppercase text-slate-500 font-bold tracking-wider">{spec[0]}</span>
                   <span className="block text-sm font-mono text-slate-300 mt-1">{spec[1]}</span>
                 </div>
              ))}
            </div>
          </div>

          {/* Flecha Central */}
          <div className="flex items-center justify-center opacity-70 py-4 lg:py-0">
            <div className="flex flex-col items-center text-blue-500">
              <span className="text-[10px] font-bold tracking-[0.2em] mb-2 hidden lg:block rotate-180" style={{ writingMode: 'vertical-rl' }}>EVOLUCIÓN</span>
              <ArrowRight size={36} className="hidden lg:block" />
              <ArrowRight size={36} className="block lg:hidden rotate-90" />
            </div>
          </div>

          {/* Tarjeta Tecnología Actual */}
          <div className="bg-blue-950/10 border border-blue-900/40 p-6 md:p-8 rounded-xl relative shadow-lg flex flex-col">
            <span className="absolute top-0 right-0 bg-blue-900/60 text-blue-300 text-[10px] font-bold px-4 py-1.5 rounded-bl-xl rounded-tr-xl uppercase tracking-widest">Tecnología Actual</span>
            
            <div className="w-14 h-14 bg-blue-900/20 border border-blue-700 rounded-xl flex items-center justify-center font-black text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.2)] mb-5 text-xl">
              {activeComp.modern.symbol}
            </div>
            <h3 className="text-2xl font-bold text-blue-100">{activeComp.modern.name}</h3>
            <p className="text-sm text-blue-200/80 mt-3 min-h-[50px] leading-relaxed">
              {activeComp.modern.description}
            </p>
            
            <div className="grid grid-cols-2 gap-3 mt-6 pt-6 border-t border-blue-900/30 mt-auto">
              {activeComp.modern.specs.map((spec, index) => (
                 <div key={index} className="bg-blue-950/30 p-3 rounded-lg border border-blue-900/40">
                   <span className="block text-[10px] uppercase text-blue-400 font-bold tracking-wider">{spec[0]}</span>
                   <span className="block text-sm font-mono text-blue-200 mt-1">{spec[1]}</span>
                 </div>
              ))}
            </div>
          </div>
        </div>

        {/* RESUMEN DE MEJORAS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-8 border-t border-slate-800 pt-8">
           
           <div className="bg-[#0b1016] p-5 border border-slate-800 rounded-xl flex gap-4 items-start shadow-sm hover:border-slate-700 transition-colors">
             <div className="w-12 h-12 rounded-lg bg-blue-900/20 text-blue-400 flex items-center justify-center font-black shrink-0 text-xl">↗</div>
             <div>
               <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1 tracking-widest">Mejora en Velocidad</span>
               <strong className="text-sm font-bold text-slate-200 block leading-tight">{activeComp.improvements.speed[0]}</strong>
               <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{activeComp.improvements.speed[1]}</p>
             </div>
           </div>
           
           <div className="bg-[#0b1016] p-5 border border-slate-800 rounded-xl flex gap-4 items-start shadow-sm hover:border-slate-700 transition-colors">
             <div className="w-12 h-12 rounded-lg bg-blue-900/20 text-blue-400 flex items-center justify-center font-black shrink-0 text-xl">▦</div>
             <div>
               <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1 tracking-widest">Mejora en Capacidad</span>
               <strong className="text-sm font-bold text-slate-200 block leading-tight">{activeComp.improvements.capacity[0]}</strong>
               <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{activeComp.improvements.capacity[1]}</p>
             </div>
           </div>
           
           <div className="bg-[#0b1016] p-5 border border-slate-800 rounded-xl flex gap-4 items-start shadow-sm hover:border-slate-700 transition-colors">
             <div className="w-12 h-12 rounded-lg bg-blue-900/20 text-blue-400 flex items-center justify-center font-black shrink-0 text-xl">⚡</div>
             <div>
               <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1 tracking-widest">Mejora en Eficiencia</span>
               <strong className="text-sm font-bold text-slate-200 block leading-tight">{activeComp.improvements.efficiency[0]}</strong>
               <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{activeComp.improvements.efficiency[1]}</p>
             </div>
           </div>

        </div>
      </div>
    </div>
  );
}