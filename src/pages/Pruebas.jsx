import { useEffect, useState } from "react";
import { listarCabanas, crearReserva, checkInReserva, reporteOcupacion } from "../api";

export default function Pruebas() {
  const token = localStorage.getItem("token");

  const [cabanas, setCabanas] = useState([]);
  const [resultado, setResultado] = useState(null);

  async function cargarCabanas() {
    const data = await listarCabanas(token);
    setCabanas(data);
  }

  async function crearDemo() {
    const reserva = await crearReserva(token, {
      cabana_id: 1,
      user_id: 1,
      fecha_inicio: "2025-11-12",
      fecha_fin: "2025-11-14",
      estado: "confirmada",
      senia_monto: 50000,
    });

    await checkInReserva(token, reserva.id);

    const reporte = await reporteOcupacion(token);
    setResultado(reporte);
  }

  useEffect(() => cargarCabanas(), []);

  return (
    <div style={{ padding: 20 }}>
      <h1 className="text-3xl font-bold text-blue-600">Tailwind OK</h1>
        <div className="mt-4 p-4 rounded-xl bg-blue-100 text-blue-800">
        Caja de prueba con Tailwind
        </div>


      <button onClick={cargarCabanas}>Listar cabañas</button>
      <button onClick={crearDemo}>Crear reserva demo + Check-in + Reporte</button>

      <pre>{JSON.stringify(cabanas, null, 2)}</pre>
      <pre>{JSON.stringify(resultado, null, 2)}</pre>
    </div>
  );
}
