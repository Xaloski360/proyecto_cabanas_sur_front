// src/components/MiCuentaButton.jsx
import { useNavigate } from "react-router-dom";
import { getToken } from "../api";

export default function MiCuentaButton() {
  const navigate = useNavigate();

  const handleClick = () => {
    const token = getToken();

    if (!token) {
      navigate("/login?redirect=/cuenta");
      return;
    }

    const roles = JSON.parse(localStorage.getItem("user_roles") || "[]");

    if (roles.includes("admin")) {
      navigate("/admin");
    } else if (roles.includes("recepcionista")) {
      // si luego creas /recepcion, cambia esto
      navigate("/admin");
    } else {
      navigate("/cuenta");
    }
  };

  return (
    <button
      onClick={handleClick}
      className="text-sm px-3 py-1.5 rounded bg-blue-600 text-white hover:bg-blue-700"
    >
      Mi cuenta
    </button>
  );
}
