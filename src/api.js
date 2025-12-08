// src/api.js

// ======================
// URL base del backend
// ======================
export const API_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

// ----------------------
// Manejo de token
// ----------------------
export function getToken() {
  return (
    localStorage.getItem("auth_token") || localStorage.getItem("token") || null
  );
}

export function setToken(token) {
  // usamos "auth_token" como estándar nuevo, pero dejamos "token" vivo si lo ocupas en otros lados
  localStorage.setItem("auth_token", token);
  localStorage.setItem("token", token);
}

export function clearToken() {
  localStorage.removeItem("auth_token");
  localStorage.removeItem("token");
}

// ----------------------
// Helper base: api()
// ----------------------
export async function api(path, options = {}) {
  const method = options.method || "GET";
  const body = options.body ?? null;
  const explicitToken = options.token;

  const token = explicitToken || getToken();

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const fetchOptions = {
    method,
    headers,
  };

  if (body !== null && body !== undefined) {
    fetchOptions.body = typeof body === "string" ? body : JSON.stringify(body);
  }

  const res = await fetch(`${API_URL}${path}`, fetchOptions);

  // puede que el back devuelva vacío (204, por ejemplo)
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || "Error en la solicitud");
  }

  return data;
}

// ======================================================
// AUTH
// ======================================================
export function loginUser(payload) {
  return api("/api/login", {
    method: "POST",
    body: payload,
  }).then((data) => {
    if (data.token) setToken(data.token);
    return data;
  });
}

export function registerUser(payload) {
  return api("/api/register", {
    method: "POST",
    body: payload,
  }).then((data) => {
    if (data.token) setToken(data.token);
    return data;
  });
}

export function fetchMe() {
  return api("/api/me", { method: "GET" });
}

export function logoutUser() {
  // si en tu api.php no la tienes, este fetch fallará pero igual
  // hacemos clearToken en finally
  return api("/logout", { method: "POST" }).finally(() => {
    clearToken();
  });
}

// ======================================================
// CABAÑAS
// ======================================================
export function fetchCabanas() {
  return api("/api/cabanas");
}

export function fetchCabana(id) {
  return api(`/api/cabanas/${id}`);
}

export function fetchDisponibilidad(desde, hasta) {
  return api(`/api/disponibilidad?desde=${desde}&hasta=${hasta}`);
}

// Helpers ADMIN para CRUD de cabañas
export function createCabana(payload) {
  return api("/api/cabanas", {
    method: "POST",
    body: payload,
  });
}

export function updateCabana(id, payload) {
  return api(`/api/cabanas/${id}`, {
    method: "PUT",
    body: payload,
  });
}

export function deleteCabana(id) {
  return api(`/api/cabanas/${id}`, {
    method: "DELETE",
  });
}

// Alias viejo para compatibilidad con Pruebas.jsx
export function listarCabanas() {
  return fetchCabanas();
}

// ======================================================
// RESERVAS
// ======================================================

// Preview / cotización de reserva
export function previewReserva(payload) {
  return api("/api/reservas/preview", {
    method: "POST",
    body: payload,
  });
}

// Crear reserva (flujo normal usuario)
export function createReserva(payload) {
  return api("/api/reservas", {
    method: "POST",
    body: payload,
  });
}

// Alias legado (usado en Pruebas.jsx)
export function crearReserva(payload) {
  return createReserva(payload);
}

// Mis reservas (dashboard usuario)
export function fetchMisReservas() {
  return api("/api/mis-reservas", { method: "GET" });
}

// 🔹 Listado general (admin/recepción) con filtros opcionales
export function fetchReservasAdmin(params = {}) {
  const qs = new URLSearchParams(params).toString();
  const url = qs ? `/api/reservas?${qs}` : "/api/reservas";

  return api(url, { method: "GET" });
}

// Alias antiguo: lo mantenemos para no romper nada
export function fetchReservasUser() {
  return fetchReservasAdmin();
}

// Cambiar estado a cancelada (dashboard usuario)
export function cancelarReserva(id) {
  return api(`/api/reservas/${id}`, {
    method: "PUT",
    body: { estado: "cancelada" },
  });
}

// Actualizar reserva (cambiar fechas, estado, etc.)
export function updateReserva(id, payload) {
  return api(`/api/reservas/${id}`, {
    method: "PUT",
    body: payload,
  });
}

// Check-in (panel admin/recepción)
export function checkInReserva(reservaId) {
  return api(`/api/reservas/${reservaId}/checkin`, {
    method: "POST",
  });
}



// ======================================================
// REPORTES
// ======================================================
export function fetchReporteOcupacion() {
  return api("/api/reportes/ocupacion", { method: "GET" });
}

// Alias para compatibilidad
export function reporteOcupacion() {
  return fetchReporteOcupacion();
}

// ======================================================
// PAGOS (JSON)
// ======================================================
export function registrarPago(payload) {
  // payload esperado: { reserva_id, monto, metodo, referencia }
  return api("/api/pagos", {
    method: "POST",
    body: payload,
  });
}

// Validar pago (ADMIN)
export function validarPago(pagoId) {
  // Back: POST /api/pagos/{pago}/validar
  return api(`/api/pagos/${pagoId}/validar`, {
    method: "POST",
  });
}

// ======================================================
// SUBIR COMPROBANTE DE PAGO (archivo multipart/form-data)
// ======================================================
export async function subirComprobantePago(formData) {
  const token = getToken();

  const headers = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  // NO pongas "Content-Type": "application/json" aquí, fetch lo calcula solo.

  const res = await fetch(`${API_URL}/api/pagos`, {
    method: "POST",
    headers,
    body: formData,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg =
      data.message ||
      (data.errors
        ? Object.values(data.errors).flat().join(" ")
        : "Error al subir comprobante");
    throw new Error(msg);
  }

  return data;
}

// ======================================================
// HUÉSPEDES
// ======================================================
export function addHuesped(reservaId, payload) {
  return api(`/api/reservas/${reservaId}/huespedes`, {
    method: "POST",
    body: payload,
  });
}

export function deleteHuesped(huespedId) {
  return api(`/api/huespedes/${huespedId}`, {
    method: "DELETE",
  });
}

// 👇 FALTA ESTA: la que está pidiendo GuestManager.jsx
export function fetchHuespedesReserva(reservaId) {
  return api(`/api/reservas/${reservaId}/huespedes`, {
    method: "GET",
  });
}
