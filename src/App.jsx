import { Routes, Route, Navigate } from "react-router-dom";

// Auth
import Login from "./pages/Login";
import Register from "./pages/Register";
import Account from "./pages/Account";

// Páginas públicas
import HomePublic from "./pages/HomePublic";
import Disponibilidad from "./pages/Disponibilidad"; 
import CabanaDetalle from "./pages/CabanaDetalle";
import Transporte from "./pages/Transporte"; 
import Experiencias from "./pages/Experiencias";
import Ventas from "./pages/Ventas";

// NUEVAS PÁGINAS IMPORTADAS
import Politicas from "./pages/Politicas";
import Faq from "./pages/Faq";

// Admin
import AdminDashboard from "./pages/AdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePublic />} />
      <Route path="/disponibilidad" element={<Disponibilidad />} />
      <Route path="/cabanas/:id" element={<CabanaDetalle />} />
      
      <Route path="/servicios/transporte" element={<Transporte />} />
      <Route path="/servicios/experiencias" element={<Experiencias />} /> 
      <Route path="/servicios/ventas" element={<Ventas />} />

      {/* NUEVAS RUTAS DE INFORMACIÓN */}
      <Route path="/informacion/politicas" element={<Politicas />} />
      <Route path="/informacion/faq" element={<Faq />} />
    
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/cuenta" element={<Account />} />
      </Route>

      <Route element={<AdminRoute />}>
        <Route path="/admin" element={<AdminDashboard />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}