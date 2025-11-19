"use client";

import { useState } from "react";

export default function Login() {
  const [token, setToken] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const login = async () => {
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "admin", password: "1234" }),
    });
    const data = await res.json();
    setToken(data.token);
  };

  const getProfile = async () => {
    if (!token) return;
    const res = await fetch("/api/profile", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setMessage(JSON.stringify(data));
  };

  return (
    <div style={{ textAlign: "center", marginTop: 40 }}>
      <button onClick={login}>Login</button>
      <button onClick={getProfile} disabled={!token}>
        Get Profile
      </button>
      <p>{message}</p>
    </div>
  );
}