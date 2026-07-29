import { Link, useLocation } from 'react-router-dom';
import { HardDrive, Cpu, Zap, Server, Activity, Layers } from 'lucide-react';

const NavLink = ({ to, icon: Icon, children }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link 
      to={to} 
      className={`flex items-center gap-2 pb-1 transition-colors text-sm ${
        isActive 
          ? 'text-blue-400 font-bold border-b-2 border-blue-400' 
          : 'text-slate-400 hover:text-blue-300'
      }`}
    >
      <Icon size={16} /> {children}
    </Link>
  );
};

export default function Navbar() {
  return (
    <nav className="bg-[#0b1016] p-4 shadow-xl border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex flex-col text-center md:text-left">
          <Link to="/" className="text-xl font-bold text-blue-400 hover:text-blue-300 transition-colors">
            Simulador de Almacenamiento
          </Link>
          <span className="text-xs text-slate-400">Organización del Computador - Grupo 4</span>
        </div>
        
        {/* LOS 6 BOTONES REQUERIDOS POR LA RÚBRICA */}
        <div className="flex flex-wrap justify-center gap-4 md:gap-6">
          <NavLink to="/hdd" icon={HardDrive}>Magnético</NavLink>
          <NavLink to="/ssd" icon={Zap}>Sólido (SSD)</NavLink>
          <NavLink to="/transferencia" icon={Activity}>Transferencia</NavLink>
          <NavLink to="/dma" icon={Cpu}>DMA</NavLink>
          <NavLink to="/rendimiento" icon={Server}>Rendimiento</NavLink>
          <NavLink to="/comparativa" icon={Layers}>Comparativa</NavLink>
        </div>
      </div>
    </nav>
  );
}