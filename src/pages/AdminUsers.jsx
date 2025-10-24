import { useState } from "react";
import { createUser } from "../api";

export default function AdminUsers() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("recepcionista");
  const [msg, setMsg] = useState("");

  const handleCreate = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const data = await createUser(token, { name, email, password, role });
    setMsg(data.message || "Error al crear usuario");
  };

  return (
    <div>
      <h1>Crear Empleado</h1>
      <form onSubmit={handleCreate}>
        <input type="text" placeholder="Nombre" value={name} onChange={(e) => setName(e.target.value)} />
        <input type="email" placeholder="Correo" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} />
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="recepcionista">Recepcionista</option>
          <option value="admin">Admin</option>
        </select>
        <button type="submit">Crear</button>
      </form>
      <p>{msg}</p>
    </div>
  );
}
