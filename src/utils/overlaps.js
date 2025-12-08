// src/utils/overlaps.js
export function overlaps(aInicio, aFin, bInicio, bFin) {
  return aInicio <= bFin && aFin >= bInicio;
}
