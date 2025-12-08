import React from "react";
import { Link } from "react-router-dom";

export default function CabinCard({ cabin }) {
  return (
    <div className="rounded-2xl border bg-white shadow-sm overflow-hidden hover:shadow-md transition">
      <img
        src={cabin.portada_url || "/images/placeholder-cabin.jpg"}
        alt={cabin.nombre}
        className="h-48 w-full object-cover"
        loading="lazy"
      />
      <div className="p-4">
        <h3 className="text-lg font-semibold">{cabin.nombre}</h3>
        <p className="text-sm text-slate-600">
          Capacidad {cabin.capacidad} · {cabin.estado === "disponible" ? "Disponible" : "Ocupada"}
        </p>
        {cabin.tarifa_desde && (
          <p className="mt-1 text-sm">
            Desde <span className="font-semibold">${cabin.tarifa_desde.toLocaleString("es-CL")}</span> /noche
          </p>
        )}

        <div className="mt-3 flex gap-2">
          <Link
            to={`/cabanas/${cabin.id}`}
            className="inline-flex items-center rounded-lg bg-blue-600 px-3 py-2 text-white text-sm hover:bg-blue-700"
          >
            Ver detalle
          </Link>
          <Link
            to={`/cabanas/${cabin.id}?reservar=1`}
            className="inline-flex items-center rounded-lg bg-emerald-600 px-3 py-2 text-white text-sm hover:bg-emerald-700"
          >
            Reservar
          </Link>
        </div>
      </div>
    </div>
  );
}
