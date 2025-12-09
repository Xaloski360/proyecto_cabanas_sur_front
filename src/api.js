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
  localStorage.setItem("auth_token", token);
  localStorage.setItem("token", token);
}

export function clearToken() {
  localStorage.removeItem("auth_token");
  localStorage.removeItem("token");
}

// ----------------------
// Helper base: api()
// Para llamadas JSON estándar
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
export function updateProfile(payload) {
  return api("/api/me", {
    method: "PUT",
    body: payload,
  });
}
export function logoutUser() {
  return api("/api/logout", { method: "POST" }).finally(() => {
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


export function fetchDisponibilidad(desde, hasta, huespedes) {
  // Agregamos &huespedes=${huespedes} a la URL
  return api(`/api/disponibilidad?desde=${desde}&hasta=${hasta}&huespedes=${huespedes}`);
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

// Alias viejo para compatibilidad
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

export function crearReserva(payload) {
  return createReserva(payload);
}

// Mis reservas (dashboard usuario)
export function fetchMisReservas() {
  return api("/api/mis-reservas", { method: "GET" });
}

// Listado general (admin/recepción) con filtros opcionales
export function fetchReservasAdmin(params = {}) {
  const qs = new URLSearchParams(params).toString();
  const url = qs ? `/api/reservas?${qs}` : "/api/reservas";
  return api(url, { method: "GET" });
}

export function fetchReservasUser() {
  return fetchReservasAdmin();
}

// Cambiar estado a cancelada
export function cancelarReserva(id) {
  return api(`/api/reservas/${id}`, {
    method: "PUT",
    body: { estado: "cancelada" },
  });
}

// Actualizar reserva
export function updateReserva(id, payload) {
  return api(`/api/reservas/${id}`, {
    method: "PUT",
    body: payload,
  });
}

// Check-in
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

export function reporteOcupacion() {
  return fetchReporteOcupacion();
}

// ======================================================
// PAGOS (JSON)
// ======================================================
export function registrarPago(payload) {
  return api("/api/pagos", {
    method: "POST",
    body: payload,
  });
}

export function validarPago(pagoId) {
  return api(`/api/pagos/${pagoId}/validar`, {
    method: "POST",
  });
}

// ======================================================
// SUBIR COMPROBANTE DE PAGO (Multipart)
// ======================================================
export async function subirComprobantePago(formData) {
  const token = getToken();
  const headers = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  
  // Fetch directo para que el navegador maneje el Boundary del FormData
  const res = await fetch(`${API_URL}/api/pagos`, {
    method: "POST",
    headers,
    body: formData,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg = data.message || "Error al subir comprobante";
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

export function fetchHuespedesReserva(reservaId) {
  return api(`/api/reservas/${reservaId}/huespedes`, {
    method: "GET",
  });
}

export function fetchServicios() {
  return api("/api/servicios");
}

// ======================================================
// IMÁGENES DE CABAÑA (NUEVO y CORREGIDO)
// ======================================================

// Subir imagen (Usa fetch directo para soportar archivos)
export async function uploadCabanaImagen(cabanaId, file, titulo = "") {
  const token = getToken();
  
  const form = new FormData();
  form.append("imagen", file);
  if (titulo) form.append("titulo", titulo);

  const headers = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  // Usamos fetch directo, igual que en subirComprobantePago
  // para evitar que el helper 'api()' fuerce JSON.stringify
  const res = await fetch(`${API_URL}/api/cabanas/${cabanaId}/imagenes`, {
    method: "POST",
    headers,
    body: form,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || "Error al subir imagen");
  }
  return data;
}

// Obtener imágenes (Usa api helper estándar)
export async function fetchCabanaImagenes(cabanaId) {
  // Asegúrate de usar /api/ al principio si tu ruta es api.php
  return api(`/api/cabanas/${cabanaId}/imagenes`, {
    method: "GET"
  });
}

// Eliminar imagen (Usa api helper estándar)
export async function deleteCabanaImagen(imagenId) {
    // La ruta debe coincidir con routes/api.php
    // Si en Laravel es Route::delete('/cabana-imagenes/{imagen}'...)
    return api(`/api/cabana-imagenes/${imagenId}`, {
       method: "DELETE"
   });
}
// src/api.js

export function fetchServiciosAdmin() {
  return api("/api/admin/servicios");
}

export async function createServicio(formData) {
  const token = getToken();
  const res = await fetch(`${API_URL}/api/admin/servicios`, {
    method: "POST",
    headers: { "Authorization": `Bearer ${token}` }, // No content-type (FormData)
    body: formData,
  });
  if (!res.ok) throw new Error("Error creando servicio");
  return res.json();
}

export async function updateServicio(id, formData) {
  const token = getToken();
  // Truco: Laravel a veces no lee archivos en PUT directos. Usamos POST con _method
  formData.append("_method", "PUT"); 
  const res = await fetch(`${API_URL}/api/admin/servicios/${id}`, {
    method: "POST", 
    headers: { "Authorization": `Bearer ${token}` },
    body: formData,
  });
  if (!res.ok) throw new Error("Error actualizando servicio");
  return res.json();
}

export function deleteServicio(id) {
  return api(`/api/admin/servicios/${id}`, { method: "DELETE" });
}
