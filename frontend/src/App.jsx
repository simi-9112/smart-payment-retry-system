import { Routes, Route } from "react-router-dom";
import AdminLogin from "./pages/AdminLogin";
import AdminPanel from "./pages/AdminPanel";

export default function App() {
  return (
    <Routes>
      <Route path="/admin-login" element={<AdminLogin />} />
      <Route path="/admin" element={<AdminPanel />} />
    </Routes>
  );
}
