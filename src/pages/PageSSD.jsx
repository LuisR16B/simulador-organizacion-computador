import { useState } from 'react';
import { Database, Network } from 'lucide-react';
import ChipFlash from '../components/ChipFlash';
import BusSataNvme from '../components/BusSataNvme';

export default function PageSSD() {
  const [activeTab, setActiveTab] = useState('flash');

  return (
    <div className="w-full flex flex-col text-slate-200">
      
      {/* Título Principal */}
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-extrabold text-white">Simulador de Estado Sólido (SSD)</h2>
        <p className="text-sm text-slate-400 mt-2">
          Representación conceptual del funcionamiento interno, gestión de memoria Flash y comparativas de interfaz.
        </p>
      </div>

      {/* Pestañas (Tabs) Azules */}
      <div className="flex justify-center gap-4 border-b border-slate-800 pb-0 mb-8">
        <button 
          onClick={() => setActiveTab('flash')} 
          className={`px-6 py-3 rounded-t-lg font-bold transition-all border border-b-0 ${
            activeTab === 'flash' 
              ? 'bg-[#141c25] text-blue-400 border-blue-500/50 relative top-[1px]' 
              : 'bg-[#0b1016] border-slate-800 text-slate-500 hover:text-slate-300'
          }`}
        >
          Latencia y Memoria Flash
        </button>
        <button 
          onClick={() => setActiveTab('comparativa')} 
          className={`px-6 py-3 rounded-t-lg font-bold transition-all border border-b-0 ${
            activeTab === 'comparativa' 
              ? 'bg-[#141c25] text-blue-400 border-blue-500/50 relative top-[1px]' 
              : 'bg-[#0b1016] border-slate-800 text-slate-500 hover:text-slate-300'
          }`}
        >
          Flujo de Datos: SATA vs NVMe
        </button>
      </div>

      {/* Grid Principal: Simulador Arriba, Explicación Abajo */}
      <div className="flex flex-col gap-6">
        
        {/* Renderizado del Componente Activo */}
        <div className="w-full">
          {activeTab === 'flash' ? <ChipFlash /> : <BusSataNvme />}
        </div>

        {/* Panel de Explicación Técnica a Ancho Completo */}
        <div className="bg-[#141c25] border border-slate-700 rounded-xl p-6 shadow-lg mt-2">
          <h3 className="text-lg font-bold text-blue-300 border-b border-slate-700 pb-3 mb-4 flex items-center gap-2">
            {activeTab === 'flash' ? <Database size={20} /> : <Network size={20} />}
            {activeTab === 'flash' ? 'Fundamentos Físicos del SSD' : 'Explicación Técnica del Flujo de Datos'}
          </h3>
          
          {activeTab === 'flash' ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[#0b1016] p-4 rounded-lg border border-slate-800">
                <h4 className="text-blue-400 font-semibold text-sm">Ausencia de partes mecánicas</h4>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed text-justify">
                  A diferencia de los platos giratorios y el cabezal móvil de un HDD, un SSD no tiene partes móviles. Los datos se leen enviando señales eléctricas.
                </p>
              </div>
              <div className="bg-[#0b1016] p-4 rounded-lg border border-slate-800">
                <h4 className="text-blue-400 font-semibold text-sm">Memoria Flash NAND</h4>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed text-justify">
                  La información se almacena en matrices de transistores de puerta flotante, permitiendo retener los datos a largo plazo sin necesidad de energía.
                </p>
              </div>
              <div className="bg-[#0b1016] p-4 rounded-lg border border-slate-800">
                <h4 className="text-blue-400 font-semibold text-sm">Menor Latencia</h4>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed text-justify">
                  Al eliminar el <em>Seek Time</em> (tiempo de mover el cabezal) y la latencia rotacional, el acceso a cualquier bloque es inmediato, superando drásticamente al HDD.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-[#0b1016] p-4 rounded-lg border border-slate-800">
                <h4 className="text-blue-400 font-semibold text-sm flex items-center gap-2"><span className="bg-blue-900/50 px-2 py-0.5 rounded text-xs">1</span> Dispositivo</h4>
                <p className="text-xs text-slate-300 mt-2">Las celdas NAND Flash liberan los bloques de datos solicitados hacia el controlador interno de la unidad.</p>
              </div>
              
              <div className="bg-[#0b1016] p-4 rounded-lg border border-slate-800">
                <h4 className="text-cyan-400 font-semibold text-sm flex items-center gap-2"><span className="bg-cyan-900/50 px-2 py-0.5 rounded text-xs">2</span> Controlador</h4>
                <p className="text-xs text-slate-300 mt-2">
                  <strong>AHCI:</strong> Cuello de botella. 1 cola de 32 cmds.<br/>
                  <strong>NVMe:</strong> Paralelismo puro. 64,000 colas vía PCI Express.
                </p>
              </div>

              <div className="bg-[#0b1016] p-4 rounded-lg border border-slate-800">
                <h4 className="text-purple-400 font-semibold text-sm flex items-center gap-2"><span className="bg-purple-900/50 px-2 py-0.5 rounded text-xs">3</span> RAM (vía DMA)</h4>
                <p className="text-xs text-slate-300 mt-2">El bus transfiere los datos a la RAM usando acceso directo a memoria (DMA), evitando sobrecargar la CPU.</p>
              </div>

              <div className="bg-[#0b1016] p-4 rounded-lg border border-slate-800">
                <h4 className="text-amber-400 font-semibold text-sm flex items-center gap-2"><span className="bg-amber-900/50 px-2 py-0.5 rounded text-xs">4</span> CPU</h4>
                <p className="text-xs text-slate-300 mt-2">La CPU lee los datos directamente desde la memoria principal a altísima velocidad para su procesamiento final.</p>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}