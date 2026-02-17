import { useEffect, useState } from "react";
import api from "../api/api";
import { useNavigate } from "react-router-dom";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [reco, setReco] = useState([]);
  const [recoFor, setRecoFor] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      // ✅ Correct API call
      const res = await api.get("/products");
      setProducts(res.data.products || []);
    } catch (err) {
      console.log(err);
      alert("Failed to load products");
    }
  };

  const addToCart = async (p) => {
    try {
      // ✅ Correct cart route (assuming backend uses /api/cart/add)
      await api.post("/cart/add", {
        productId: p._id,
        quantity: 1,
      });

      navigate("/cart");
    } catch (err) {
      console.log(err);
      alert(err.response?.data?.message || "Add failed");
    }
  };

  const showSimilar = async (p) => {
    try {
      const res = await api.get(`/products/${p._id}/recommend`);
      setReco(res.data.products || []);
      setRecoFor(p.title);
    } catch (err) {
      console.log(err);
      alert("Failed to load recommendations");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Products</h2>

      {products.map((p) => (
        <div
          key={p._id}
          style={{
            border: "1px solid #ddd",
            padding: 12,
            marginBottom: 10,
            borderRadius: 8,
          }}
        >
          <h4>{p.title}</h4>
          <p>₹ {p.price}</p>

          <button onClick={() => addToCart(p)} style={{ marginRight: 8 }}>
            Add to Cart
          </button>

          <button onClick={() => showSimilar(p)}>Similar</button>
        </div>
      ))}

      <hr />

      <h3>Recommended for: {recoFor || "..."}</h3>
      {reco.length === 0 ? (
        <p>No recommendations</p>
      ) : (
        reco.map((r) => (
          <div key={r._id}>
            {r.title} — ₹ {r.price}
          </div>
        ))
      )}
    </div>
  );
}