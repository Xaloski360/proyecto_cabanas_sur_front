import Header from "../components/Header";
import Footer from "../components/Footer";

export default function Politicas() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      
      <main className="flex-1 max-w-4xl mx-auto px-6 py-12 w-full">
        <h1 className="text-4xl font-extrabold text-slate-800 mb-8 border-b-2 border-emerald-500 pb-4">
          Políticas de Cancelación y Uso
        </h1>

        <div className="space-y-8 text-slate-700">
          
          <section className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold text-emerald-800 mb-4 flex items-center gap-2">
              📅 Reservas y Pagos
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Para confirmar la reserva se requiere el pago del <strong>50% del total</strong> por adelantado.</li>
              <li>El 50% restante debe ser cancelado al momento del Check-in.</li>
              <li>Aceptamos transferencias bancarias, tarjetas de débito y crédito.</li>
            </ul>
          </section>

          <section className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold text-emerald-800 mb-4 flex items-center gap-2">
              ❌ Políticas de Cancelación
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Cancelación gratuita:</strong> Hasta 15 días antes de la fecha de llegada.</li>
              <li><strong>Cancelación tardía:</strong> Si cancelas con menos de 15 días de anticipación, el abono del 50% no será reembolsable.</li>
              <li><strong>No Show:</strong> En caso de no presentarse sin aviso, se cobrará el 100% de la estadía.</li>
            </ul>
          </section>

          <section className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold text-emerald-800 mb-4 flex items-center gap-2">
              ⏰ Horarios
            </h2>
            <div className="flex gap-8">
              <div>
                <p className="font-bold text-slate-900">Check-in</p>
                <p>Desde las 15:00 hrs.</p>
              </div>
              <div>
                <p className="font-bold text-slate-900">Check-out</p>
                <p>Hasta las 11:00 hrs.</p>
              </div>
            </div>
          </section>

          <section className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold text-emerald-800 mb-4 flex items-center gap-2">
              🐾 Mascotas y Convivencia
            </h2>
            <p className="mb-2">Amamos a los animales, pero para asegurar la tranquilidad de todos:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Se admiten mascotas solo en cabañas seleccionadas (Cabaña Coihue y Lenga).</li>
              <li>Se prohíben fiestas o ruidos molestos después de las 23:00 hrs.</li>
            </ul>
          </section>

        </div>
      </main>

      <Footer />
    </div>
  );
}