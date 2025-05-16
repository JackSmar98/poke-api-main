// src/componentes/login/index.jsx
import { useState } from 'react';
import { supabase } from '../../supabase'; // Asegúrate que la ruta sea correcta
import { useNavigate } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert("Usuario o contraseña no válido"); // O un manejo de errores más sofisticado
    } else {
      // El estado del usuario se actualizará globalmente gracias al onAuthStateChange en App.jsx
      navigate("/"); // Redirige al home o a la página principal
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Iniciar sesión</button>
      </form>
      {/* Botón para ir a Registro */}
      <div>
        <p>No tiene cuenta?</p>
        <button onClick={() => navigate("/registro")}>Regístrese</button>
      </div>
    </div>
  );
}

export default Login;