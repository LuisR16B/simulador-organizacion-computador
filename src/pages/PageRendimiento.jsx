import IndicadoresRendimiento from '../components/IndicadoresRendimiento';

export default function PageRendimiento() {
  return (
    <div className="w-full">
      {/* Título Principal y Subtítulo corporativo */}
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-extrabold text-white">Indicadores de Rendimiento</h2>
        <p className="text-sm text-slate-400 mt-2 max-w-2xl mx-auto">
          Comparación conceptual de los tiempos de acceso entre las diferentes generaciones de almacenamiento magnético y de estado sólido.
        </p>
      </div>

      {/* Inyección del Componente Reactivo */}
      <IndicadoresRendimiento />
    </div>
  );
}