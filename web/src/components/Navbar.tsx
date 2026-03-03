import { useState } from "react";

type User = {
  username: string;
  role: string;
};

type Props = {
  responsible: string | null;
  setResponsible: (u: User | null) => void;
};

export default function Navbar({ responsible, setResponsible }: Props) {
  const [isSignup, setIsSignup] = useState(false);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();

    const url = isSignup
      ? "http://localhost:3000/users"
      : "http://localhost:3000/users/login";

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        password,
        role: "user",
      }),
    });

    if (!res.ok) {
      alert(isSignup ? "Erro ao criar conta" : "Login inválido");
      return;
    }

    // signup não retorna usuário → faz login automático
    if (isSignup) {
      setIsSignup(false);
      alert("Conta criada! Faça login.");
      return;
    }

    const data = await res.json();
    setResponsible(data);
  }

  function logout() {
    setResponsible(null);
  }

  return (
    <div className="navbar">
      <h2>Inventory System</h2>

      {!responsible ? (
        <form onSubmit={submit}>
          <input
            placeholder="usuário"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <input
            type="password"
            placeholder="senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button type="submit">
            {isSignup ? "Criar conta" : "Login"}
          </button>

          <button
            type="button"
            onClick={() => setIsSignup(!isSignup)}
          >
            {isSignup ? "Já tenho conta" : "Criar conta"}
          </button>
        </form>
      ) : (
        <div>
          👤 {responsible}
          <button onClick={logout}>Logout</button>
        </div>
      )}
    </div>
  );
}