import { Navigate, Outlet } from "react-router-dom";
import {jwtDecode} from "jwt-decode"; // fix import (no curly braces)

export default function ProtectedRoute() {
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  if (!token) return <Navigate to="/login" />;

  try {
    const decoded = jwtDecode(token);

    // make sure it checks "role" instead of "usertype"
    if (decoded.role === "admin" || decoded.role === "superadmin" || decoded.role === "teacher") {
      return <Outlet />;
    }

    return <Navigate to="/login" />;
  } catch (error) {
    return <Navigate to="/login" />;
  }
}
