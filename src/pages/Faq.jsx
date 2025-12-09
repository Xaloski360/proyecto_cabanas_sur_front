import Header from "../components/Header";
import Footer from "../components/Footer";

const FAQS = [
  {
    q: "¿Cómo llego si no tengo vehículo propio?",
    a: "Ofrecemos servicio de transporte privado desde el aeropuerto y terminal de buses. También puedes llegar en transporte público (Micros línea 20 hacia Niebla) que te dejan a 500 metros de la entrada."
  },
  {
    q: "¿Incluyen desayuno?",
    a: "El arriendo base no incluye desayuno, pero puedes contratar nuestras 'Canastas de Desayuno' con productos locales en la sección de Servicios > Ventas."
  },
  {
    q: "¿Hay conexión a internet?",
    a: "Sí, todas nuestras cabañas cuentan con conexión Wi-Fi de alta velocidad (Fibra óptica), ideal si necesitas trabajar o ver películas."
  },
  {
    q: "¿Las cabañas tienen calefacción?",
    a: "Absolutamente. Todas las cabañas cuentan con estufa a combustión lenta (bosca) y proveemos leña inicial de cortesía. Puedes comprar sacos adicionales en recepción."
  },
  {
    q: "¿Cuentan con estacionamiento?",
    a: "Sí, cada cabaña dispone de un estacionamiento privado gratuito justo al lado de la entrada."
  }
];

export default function Faq() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      
      <main className="flex-1 max-w-3xl mx-auto px-6 py-12 w-full">
        <h1 className="text-4xl font-extrabold text-slate-800 mb-2 text-center">
          Preguntas Frecuentes
        </h1>
        <p className="text-center text-slate-500 mb-10">
          Resolvemos tus dudas para que solo te preocupes de descansar.
        </p>

        <div className="space-y-4">
          {FAQS.map((item, index) => (
            <div key={index} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="font-bold text-emerald-800 text-lg mb-2 flex items-start gap-3">
                <span className="text-2xl opacity-50">Q.</span> 
                {item.q}
              </h3>
              <p className="text-slate-600 pl-8 leading-relaxed">
                {item.a}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center bg-emerald-100 p-8 rounded-2xl border border-emerald-200">
          <p className="font-bold text-emerald-900 mb-2">¿No encuentras tu respuesta?</p>
          <a href="mailto:contacto@bosqueyrio.cl" className="text-emerald-700 underline hover:text-emerald-500">
            Escríbenos a contacto@bosqueyrio.cl
          </a>
        </div>
      </main>

      <Footer />
    </div>
  );
}