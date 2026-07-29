import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';

// Importación de las Páginas
import PageHDD from './pages/PageHDD';
import PageSSD from './pages/PageSSD'; 
import PageTransferencia from './pages/PageTransferencia';
import PageDMA from './pages/PageDMA';
import PageRendimiento from './pages/PageRendimiento';
import PageComparativa from './pages/PageComparativa';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#0a0f15] text-slate-100 font-sans pb-10">
        <Navbar />
        <main className="max-w-7xl mx-auto p-6 mt-4">
          <Routes>
            <Route path="/" element={
              <div className="text-center mt-20">
                <h2 className="text-4xl font-extrabold text-white">Bienvenido al Laboratorio Interactivo</h2>
                <p className="text-slate-400 mt-4">Selecciona un módulo en el menú superior para comenzar la simulación.</p>
              </div>
            } />
            
            {/* LAS 6 RUTAS */}
            <Route path="/hdd" element={<PageHDD />} />
            <Route path="/ssd" element={<PageSSD />} />
            <Route path="/transferencia" element={<PageTransferencia />} />
            <Route path="/dma" element={<PageDMA />} />
            <Route path="/rendimiento" element={<PageRendimiento />} />
            <Route path="/comparativa" element={<PageComparativa />} />
            
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;