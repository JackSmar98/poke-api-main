// src/App.jsx
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AppProvider } from './contexto/contexto';
import { supabase } from "./supabase"; // Asegúrate que la ruta sea correcta

import Menu from './componentes/menu';
import Aleatorios from './componentes/aleatorios';
import Listas from './componentes/listas'; // Asumo que este es tu componente principal de listas
import Capturados from './componentes/capturados';
import Favoritos from './componentes/favoritos';
import Usuarios from './componentes/usuario'; // Este será el perfil del usuario o el admin
import Pokemon from './componentes/pokemon'; // Asumo que este es tu componente de detalle
import Login from './componentes/login'; // Importa el componente Login
import Registro from './componentes/registro'; // Importa el componente Registro (lo crearás luego)
import Administrador from './componentes/administrador'; // Importa el componente Administrador (lo crearás luego)


import './App.css';

function App() {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [rolUsuario, setRolUsuario] = useState(null);


  useEffect(() => {
    async function verificarSesion() {
      const { data: { session } } = await supabase.auth.getSession();
      setUsuario(session?.user ?? null);
      if (session?.user) {
        const { data: perfil } = await supabase
          .from('usuario')
          .select('roll')
          .eq('id', session.user.id)
          .single();
        setRolUsuario(perfil?.roll);
      }
      setCargando(false);
    }

    verificarSesion();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUsuario(session?.user ?? null);
      if (session?.user) {
        const { data: perfil } = await supabase
          .from('usuario')
          .select('roll')
          .eq('id', session.user.id)
          .single();
        setRolUsuario(perfil?.roll);
      } else {
        setRolUsuario(null);
      }
      setCargando(false); // Actualiza cargando aquí también
    });

    // Limpiar el listener cuando el componente se desmonte
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  if (cargando) return <p>Cargando...</p>;

  return (
    <AppProvider>
      <Router>
        {usuario && <Menu />}
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} /> {/* Añade la ruta de registro */}

          <Route path="/" element={usuario ? <Listas /> : <Navigate to="/login" />} />
          {/* El componente Usuarios se usará para el perfil del usuario logueado */}
          <Route path="/usuarios" element={usuario ? <Usuarios /> : <Navigate to="/login" />} />
          <Route path="/aleatorios" element={usuario ? <Aleatorios /> : <Navigate to="/login" />} />
          <Route path="/capturados" element={usuario ? <Capturados /> : <Navigate to="/login" />} />
          <Route path="/favoritos" element={usuario ? <Favoritos /> : <Navigate to="/login" />} />
          <Route path="/Pokemon/:name" element={usuario ? <Pokemon /> : <Navigate to="/login" />} /> {/* Ajustado de /detalle/:name a /Pokemon/:name como en tu código original */}

          {/* Ruta para el administrador */}
          <Route path="/administrador" element={usuario && rolUsuario === 'admin' ? <Administrador /> : <Navigate to="/" />} />

        </Routes>
      </Router>
    </AppProvider>
  );
}

export default App;