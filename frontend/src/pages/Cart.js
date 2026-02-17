import { useEffect, useState } from "react";
import api from "../api/api";
import { useNavigate } from "react-router-dom";

export default function Cart() {
  const [cart, setCart] = useState(null);
  const navigate = useNavigate();

  const loadCart = async () => {
    try {
      const res = await api.get("/cart");
      setCart(res.data.cart);
    } catch {
      alert("Failed to load cart");
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  // ✅ Remove item
  const removeItem = async (productId) => {
    try {
      await api.delete(`/cart/remove/${productId}`);
      loadCart();
    } catch (err) {
      alert(err.response?.data?.message || "Remove failed");
    }
  };

  // ✅ Update quantity
  const updateQty = async (productId, qty) => {
    if (qty < 1) return removeItem(productId);

    try {
      await api.put(`/cart/update/${productId}`, { quantity: qty });
      loadCart();
    } catch (err) {
      alert(err.response?.data?.message || "Update failed");
    }
  };

  if (!cart) return <p style={{ padding: 20 }}>Loading...</p>;

  return (
    <div style={{ padding: 20 }}>
      <h2>Cart</h2>

      {cart.items.length === 0 ? (
        <p>Cart is empty</p>
      ) : (
        <>
          {cart.items.map((i) => (
            <div key={i.product._id} style={{ marginBottom: 10 }}>
              <b>{i.product.title}</b>

              <div>
                <button onClick={() => updateQty(i.product._id, i.quantity - 1)}>
                  -
                </button>

                <span style={{ margin: "0 10px" }}>{i.quantity}</span>

                <button onClick={() => updateQty(i.product._id, i.quantity + 1)}>
                  +
                </button>
              </div>

              ₹ {i.itemTotal}

              <button
                onClick={() => removeItem(i.product._id)}
                style={{ marginLeft: 10 }}
              >
                Remove
              </button>
            </div>
          ))}

          <h3>Subtotal: ₹ {cart.subtotal}</h3>

          <button onClick={() => navigate("/checkout")}>Checkout</button>
        </>
      )}
    </div>
  );
}
