import React, { useEffect, useState } from "react";
import axios from "axios";

export default function Admin() {
  // ✅ Hooks must be at top level (always)
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  // Example: get user from localStorage (adjust if you store differently)
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  })();

  // ✅ useEffect must NOT be inside if
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        // If you added "proxy" in package.json, this works:
        const { data } = await axios.get("/api/products");
        setProducts(Array.isArray(data) ? data : []);
      } catch (e) {
        setMsg(
          e?.response?.data?.message ||
            e?.message ||
            "Failed to load products"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // ✅ Conditions/returns AFTER hooks
  if (!user || !user.isAdmin) {
    return <h2 style={{ padding: 20 }}>Not authorized</h2>;
  }

  const addProduct = async (e) => {
    e.preventDefault();
    setMsg("");

    try {
      setLoading(true);

      // Adjust if your backend expects different fields
      const body = { name, price: Number(price) };

      // If your backend requires token, add Authorization header here
      const config = user?.token
        ? { headers: { Authorization: `Bearer ${user.token}` } }
        : {};

      const { data } = await axios.post("/api/products", body, config);

      // Refresh list: if API returns created product, push it
      if (data) setProducts((prev) => [data, ...prev]);

      setName("");
      setPrice("");
      setMsg("Product added ✅");
    } catch (e) {
      setMsg(
        e?.response?.data?.message ||
          e?.message ||
          "Failed to add product"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Admin</h1>

      {msg ? <p>{msg}</p> : null}

      <form onSubmit={addProduct} style={{ marginBottom: 20 }}>
        <input
          placeholder="Product name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ marginRight: 10 }}
        />
        <input
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          style={{ marginRight: 10 }}
        />
        <button type="submit" disabled={loading || !name || !price}>
          {loading ? "Please wait..." : "Add Product"}
        </button>
      </form>

      <h3>Products</h3>
      {loading && products.length === 0 ? (
        <p>Loading...</p>
      ) : products.length === 0 ? (
        <p>No products</p>
      ) : (
        <ul>
          {products.map((p) => (
            <li key={p._id || p.id}>
              {p.name} — ₹{p.price}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}