import SimuladorDMA from '../components/SimuladorDMA';

export default function PageDMA() {
  return (
    <div className="w-full">
      {/* Título Principal y Subtítulo corporativo */}
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-extrabold text-white">Transferencia de Datos con DMA</h2>
        <p className="text-sm text-slate-400 mt-2 max-w-2xl mx-auto">
          Observa cómo un controlador puede mover bloques desde el almacenamiento hasta la RAM sin mantener ocupada a la CPU durante toda la operación.
        </p>
      </div>

      {/* Inyección del Componente Reactivo del Laboratorio */}
      <SimuladorDMA />
    </div>
  );
}