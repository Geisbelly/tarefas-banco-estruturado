import { Navigate, Outlet } from "react-router-dom";

const useAuth = () => {
  // Aqui você coloca sua lógica real de autenticação
  // Pode ser context, localStorage, cookie, etc.
  const user = localStorage.getItem("user"); // só um exemplo tosco
  return !!user; // true se tem user, false se não
};

const PrivateRoute = () => {
  const isAuth = useAuth();
  return isAuth ? <Outlet /> : <Navigate to="/auth" replace />;
};

export default PrivateRoute;
