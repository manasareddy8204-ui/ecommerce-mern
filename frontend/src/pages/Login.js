import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Login failed");
        return;
      }

      // ✅ Save token
      localStorage.setItem("token", data.token);

      // ✅ Save user (for admin)
      localStorage.setItem("user", JSON.stringify(data.user));

      navigate("/products");
    } catch (err) {
      alert("Server error");
    }
  };

  return (
    <div style={{ padding: 20, maxWidth: 350, margin: "auto" }}>
      <h2>Login</h2>

      <form onSubmit={handleLogin}>
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: "100%", padding: 8 }}
        />
        <br /><br />

        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: "100%", padding: 8 }}
        />
        <br /><br />

        <button style={{ width: "100%", padding: 10 }}>
          Login
        </button>
      </form>
    </div>
  );
}
