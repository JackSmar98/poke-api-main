// src/componentes/registro/index.jsx
import { useState } from 'react';
import { supabase } from '../../supabase'; // Asegúrate que la ruta sea correcta
import { useNavigate } from 'react-router-dom';

function Registro() {
  const [formulario, setFormulario] = useState({
    nombre: '',
    correo: '',
    password: '',
    fechaNacimiento: '',
    telefono: '',
  });
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormulario({ ...formulario, [e.target.name]: e.target.value });
  };

  const handleRegistro = async (e) => {
    e.preventDefault();
    setError(null);

    // 1. Crear usuario en Auth
    const { data: authData, error: errorAuth } = await supabase.auth.signUp({
      email: formulario.correo,
      password: formulario.password,
    });

    if (errorAuth) {
      setError(errorAuth.message);
      return;
    }

    // 2. Insertar en tabla "usuario"
    if (authData.user) {
      const { error: errorInsert } = await supabase.from('usuario').insert([
        {
          id: authData.user.id, // Usar el id del usuario creado en Auth
          nombre: formulario.nombre,
          correo: formulario.correo,
          // No guardamos la contraseña aquí, Supabase Auth la maneja.
          fecha_nacimiento: formulario.fechaNacimiento,
          telefono: formulario.telefono,
          roll: 'usuario', // Rol por defecto
        },
      ]);

      if (errorInsert) {
        setError('Usuario creado en Auth pero hubo un error al guardar datos adicionales: ' + errorInsert.message);
        // Aquí podrías considerar eliminar el usuario de Auth si la inserción falla para mantener consistencia
        // await supabase.auth.api.deleteUser(authData.user.id) // Ejemplo, revisar la API actual para esto.
      } else {
        alert('Registro exitoso. Por favor, revisa tu correo para confirmar la cuenta.');
        navigate('/login'); // Redirige al login después del registro
      }
    } else {
        setError('No se pudo crear el usuario en Supabase Auth.');
    }
  };

  return (
    <section>
      <h2>Registro</h2>
      <form onSubmit={handleRegistro}>
        <input type="text" name="nombre" placeholder="Nombre" value={formulario.nombre} onChange={handleChange} required />
        <input type="email" name="correo" placeholder="Correo" value={formulario.correo} onChange={handleChange} required />
        <input type="password" name="password" placeholder="Contraseña" value={formulario.password} onChange={handleChange} required />
        <input type="date" name="fechaNacimiento" value={formulario.fechaNacimiento} onChange={handleChange} required />
        <input type="text" name="telefono" placeholder="Teléfono" value={formulario.telefono} onChange={handleChange} required />
        <button type="submit">Registrarse</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div>
        <p>Ya tengo cuenta y quiero loguearme</p>
        <button onClick={() => navigate('/login')}>Login</button>
      </div>
    </section>
  );
}

export default Registro;