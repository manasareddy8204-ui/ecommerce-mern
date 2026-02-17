import { useState } from "react";
import api from "../api/api";
import { useNavigate } from "react-router-dom";

export default function Checkout() {
  const navigate = useNavigate();

  const [address, setAddress] = useState({
    fullName: "",
    phone: "",
    addressLine1: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
  });

  const [paymentMethod, setPaymentMethod] = useState("COD");

  const handleChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  const placeOrder = async () => {
    try {
      await api.post("/orders", {
        shippingAddress: address,
        paymentMethod,
      });

      alert("Order placed successfully");
      navigate("/orders");
    } catch (err) {
      alert(err.response?.data?.message || "Error");
    }
  };

  return (
    <div>
      <h2>Checkout</h2>

      <input name="fullName" placeholder="Full Name" onChange={handleChange} />
      <input name="phone" placeholder="Phone" onChange={handleChange} />
      <input name="addressLine1" placeholder="Address" onChange={handleChange} />
      <input name="city" placeholder="City" onChange={handleChange} />
      <input name="state" placeholder="State" onChange={handleChange} />
      <input name="pincode" placeholder="Pincode" onChange={handleChange} />

      <h3>Payment</h3>
      <select onChange={(e) => setPaymentMethod(e.target.value)}>
        <option value="COD">Cash on Delivery</option>
        <option value="ONLINE">Online (Fake)</option>
      </select>

      <button onClick={placeOrder}>Place Order</button>
    </div>
  );
}