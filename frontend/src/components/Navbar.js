import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // ❌ If not logged in → hide navbar
  if (!token) return null;

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div style={{ padding: 10, borderBottom: "1px solid #ddd", display: "flex", gap: 12 }}>
      <Link to="/products">Products</Link>
      <Link to="/cart">Cart</Link>
      <Link to="/orders">My Orders</Link>
      <Link to="/admin">Admin</Link>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
