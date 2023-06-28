import { useState, useEffect } from "react";
import { client } from "./client";

const App = () => {
  const [message, setMessage] = useState("");
  const [secretMessage, setSecretMessage] = useState("");
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      const res = await client.api.message.$get();
      const data = await res.json();
      setMessage(data.message);
    };
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const res = await client.api.login.$post({
      form,
    });
    const data = await res.json();
    if (data.status !=="success") {
      data.message && setMessage(data.message);
    }
    if (data.status === "success") {
      localStorage.setItem("token", data.token);
      setMessage("Logged in successfully!");
    }
  };

  return (
    <div>
      <h1>{message}</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <button type="submit">Submit</button>
      </form>
      <h2>{secretMessage}</h2>
      <button
        onClick={async () => {
          const res = await client.api.auth.message.$get();
          const data = await res.json();
          setSecretMessage(data.message);
        }}
      >
        Get Secret Message
      </button>
      <pre>
        <code>{JSON.stringify(user, null, 2)}</code>
      </pre>
      <button
        onClick={async () => {
          const res = await client.api.auth.user.$get();
          const data = await res.json();
          setUser(data.user);
        }}
      >
        Get User
      </button>
    </div>
  );
};

export default App;
