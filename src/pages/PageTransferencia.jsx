import RecorridoDatos from '../components/RecorridoDatos';

export default function PageTransferencia() {
  return (
    <div className="w-full">
      {/* Título Principal y Subtítulo */}
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-extrabold text-white">Recorrido de la Información</h2>
        <p className="text-sm text-slate-400 mt-2">
          Análisis del flujo de datos: Almacenamiento → Controlador → Memoria RAM → CPU
        </p>
      </div>

      {/* Inyección del Componente Reactivo */}
      <RecorridoDatos />
    </div>
  );
}