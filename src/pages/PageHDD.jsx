import SimuladorHDD from '../components/SimuladorHDD';

export default function PageHDD() {
  return (
    <div className="w-full">
      {/* Título Principal de la Página (Igual a la imagen) */}
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-extrabold text-white">Simulador de Disco Duro (HDD)</h2>
        <p className="text-sm text-slate-400 mt-2">Estructura mecánica, cilindros y latencia rotacional</p>
      </div>

      {/* Inyección del Componente Reactivo */}
      <SimuladorHDD />
    </div>
  );
}