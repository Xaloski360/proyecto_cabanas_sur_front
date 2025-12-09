// src/pages/Register.jsx
import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { registerUser } from "../api";

// ---------------------
// Helpers RUT chileno
// ---------------------
function calcularDv(rutNumero) {
  // rutNumero: string solo dígitos, sin guion ni puntos
  const reversed = rutNumero.split("").reverse();
  let suma = 0;
  let multiplicador = 2;

  for (const d of reversed) {
    suma += parseInt(d, 10) * multiplicador;
    multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
  }

  const resto = 11 - (suma % 11);
  if (resto === 11) return "0";
  if (resto === 10) return "K";
  return String(resto);
}

function limpiarRut(value) {
  // dejamos solo dígitos y K/k
  return value.replace(/[^0-9kK]/g, "").toUpperCase();
}

function formatearRut(rutLimpio) {
  // rutLimpio: solo dígitos y opcionalmente DV al final
  if (!rutLimpio) return "";

  if (rutLimpio.length <= 8) {
    // solo base sin DV → calculamos
    const dv = calcularDv(rutLimpio);
    return `${rutLimpio}-${dv}`;
  }

  // viene base + dv escrito por el usuario (ej: 18293829K)
  const base = rutLimpio.slice(0, -1);
  const dvIngresado = rutLimpio.slice(-1);
  const dvCorrecto = calcularDv(base);

  if (dvIngresado !== dvCorrecto) {
    // avisamos pero corregimos al DV correcto
    toast.error(
      `El dígito verificador ingresado no es válido. Se corrigió a ${dvCorrecto}.`
    );
  }

  return `${base}-${dvCorrecto}`;
}

// ---------------------
// Componente
// ---------------------
export default function Register() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const redirectTo = searchParams.get("redirect") || "/cuenta";

  const [form, setForm] = useState({
    name: "",
    email: "",
    email_confirmation: "",
    rut: "",
    password: "",
    password_confirmation: "",
  });

  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleRutChange(e) {
    const limpio = limpiarRut(e.target.value);
    // mientras escribe, no forzamos guion, solo limpiamos caracteres
    setForm((prev) => ({ ...prev, rut: limpio }));
  }

  function handleRutBlur() {
    if (!form.rut) return;
    const limpio = limpiarRut(form.rut);

    if (!/^[0-9]{7,8}[0-9K]?$/i.test(limpio)) {
      toast.error("Ingresa un RUT válido (solo números, sin puntos).");
      return;
    }

    const rutFormateado = formatearRut(limpio);
    setForm((prev) => ({ ...prev, rut: rutFormateado }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (loading) return;

    // ---------------- Front validations extra ----------------
    // 1) Correos iguales
    if (form.email.trim() !== form.email_confirmation.trim()) {
      toast.error("Los correos ingresados no coinciden.");
      return;
    }

    // 2) Password fuerte:
    //    - mínimo 8 caracteres
    //    - al menos una mayúscula
    //    - al menos un símbolo de este set: . - * ) (
    const passwordPattern = /^(?=.*[A-Z])(?=.*[.\-\*\)\(]).{8,}$/;

    if (!passwordPattern.test(form.password)) {
      toast.error(
        "La contraseña debe tener mínimo 8 caracteres, al menos una mayúscula y un símbolo (. - * ) ()."
      );
      return;
    }

    if (form.password !== form.password_confirmation) {
      toast.error("Las contraseñas no coinciden.");
      return;
    }

    // 3) Normalizar RUT antes de enviar
    let rutLimpio = limpiarRut(form.rut);
    if (!rutLimpio) {
      toast.error("Debes ingresar tu RUT.");
      return;
    }

    // Si aún no está en formato con guion, lo formateamos
    if (!rutLimpio.includes("-")) {
      const rutFormateado = formatearRut(rutLimpio);
      rutLimpio = rutFormateado;
      setForm((prev) => ({ ...prev, rut: rutFormateado }));
    }

    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      email_confirmation: form.email_confirmation.trim(),
      rut: rutLimpio, // ej: "18293829-7"
      password: form.password,
      password_confirmation: form.password_confirmation,
    };

    setLoading(true);
    try {
      await registerUser(payload);
      toast.success("Cuenta creada. Sesión iniciada correctamente.");
      navigate(redirectTo, { replace: true });
    } catch (err) {
      console.error(err);
      toast.error(err.message || "No se pudo crear la cuenta");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-emerald-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-center text-emerald-700 mb-6">
          Crear cuenta
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* NOMBRE */}
          <div>
            <input
              name="name"
              type="text"
              placeholder="Nombre completo"
              value={form.name}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          {/* EMAIL */}
          <div>
            <input
              name="email"
              type="email"
              placeholder="Correo electrónico"
              value={form.email}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          {/* EMAIL CONFIRM */}
          <div>
            <input
              name="email_confirmation"
              type="email"
              placeholder="Repite tu correo electrónico"
              value={form.email_confirmation}
              onChange={handleChange}
              onPaste={(e) => e.preventDefault()}
              onCopy={(e) => e.preventDefault()}
              onCut={(e) => e.preventDefault()}
              onDrop={(e) => e.preventDefault()}
              onContextMenu={(e) => e.preventDefault()}
              autoComplete="off"
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
            <p className="mt-1 text-[11px] text-slate-500">
              Debes escribir el correo nuevamente. No se permite copiar y pegar.
            </p>
          </div>

          {/* RUT */}
          <div>
            <input
              name="rut"
              type="text"
              placeholder="RUT (sin puntos, ej: 18293829-7)"
              value={form.rut}
              onChange={handleRutChange}
              onBlur={handleRutBlur}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
            <p className="mt-1 text-[11px] text-slate-500">
              Ingresa tu RUT sin puntos. El guion y el dígito verificador se
              ajustan automáticamente.
            </p>
          </div>

          {/* PASSWORD */}
          <div>
            <input
              name="password"
              type="password"
              placeholder="Contraseña"
              value={form.password}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
              minLength={8}
            />
            <p className="mt-1 text-[11px] text-slate-500">
              Mínimo 8 caracteres, al menos una mayúscula y un símbolo
              (. - * ) ().
            </p>
          </div>

          {/* PASSWORD CONFIRM */}
          <div>
            <input
              name="password_confirmation"
              type="password"
              placeholder="Repite la contraseña"
              value={form.password_confirmation}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
              minLength={8}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full mt-2 py-2 rounded-lg text-white font-semibold transition ${
              loading
                ? "bg-emerald-400 cursor-not-allowed"
                : "bg-emerald-600 hover:bg-emerald-700"
            }`}
          >
            {loading ? "Creando cuenta…" : "Crear cuenta"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-600">
          ¿Ya tienes cuenta?{" "}
          <Link
            to={`/login?redirect=${encodeURIComponent(redirectTo)}`}
            className="text-emerald-700 font-medium hover:underline"
          >
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
