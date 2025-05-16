// src/componentes/usuario/index.jsx
import { useEffect, useState, useContext } from "react"; // Agrega useContext si lo usas de AppContext
import { supabase } from "../../supabase"; // Asegúrate que la ruta sea correcta
import { AppContext } from '../../contexto/contexto'; // Si necesitas el usuario del contexto
import { useNavigate } from 'react-router-dom';


function Usuarios() { // Cambiado de Usuario a Usuarios para coincidir con tu App.jsx
  const [usuarioAuth, setUsuarioAuth] = useState(null); // Para el usuario de Supabase Auth
  const [perfil, setPerfil] = useState(null); // Para los datos de la tabla 'usuario'
  const [form, setForm] = useState({
    nombre: "",
    correo: "",
    fecha_nacimiento: "",
    telefono: "",
    roll: "", // El rol no debería ser editable por el usuario normalmente
  });
  const [nuevaUrl, setNuevaUrl] = useState("");
  const [imagenes, setImagenes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const navigate = useNavigate();


  // Obtener datos del usuario logueado
  useEffect(() => {
    async function fetchUsuario() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUsuarioAuth(user);
        const { data, error } = await supabase
          .from("usuario")
          .select("*")
          .eq("id", user.id)
          .single();

        if (data) {
          setPerfil(data);
          setForm(data);
          fetchImagenes(user.id);
        } else {
          console.error("Error al obtener perfil:", error);
        }
      }
      setCargando(false);
    }
    fetchUsuario();
  }, []);

  const fetchImagenes = async (usuarioid) => {
    const { data, error } = await supabase
      .from("multimedia")
      .select("*")
      .eq("usuarioid", usuarioid);
    if (data) setImagenes(data);
    else console.error("Error al obtener imágenes:", error)
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleUpdate = async () => {
    if (!perfil) return;
    // Excluir el correo y el rol de la actualización directa por el usuario si es necesario
    const datosActualizar = {
        nombre: form.nombre,
        fecha_nacimiento: form.fecha_nacimiento,
        telefono: form.telefono,
    };

    const { error } = await supabase
      .from("usuario")
      .update(datosActualizar)
      .eq("id", perfil.id);

    if (error) alert("Error al actualizar");
    else alert("Datos actualizados");
  };

  const handleAgregarUrl = async () => {
    if (!nuevaUrl.trim() || !perfil) return;
    const { error } = await supabase
      .from("multimedia")
      .insert([{ url: nuevaUrl, usuarioid: perfil.id }]);

    if (error) {
      alert("Error al agregar la imagen");
      console.error(error);
    } else {
      setNuevaUrl("");
      fetchImagenes(perfil.id);
    }
  };

  const handleEliminarImagen = async (id) => {
    const { error } = await supabase
      .from("multimedia")
      .delete()
      .eq("id", id);

    if (error) {
      alert("Error al eliminar imagen");
      console.error(error);
    } else {
      setImagenes(imagenes.filter((img) => img.id !== id));
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    // setUsuario(null) // El estado global se actualiza por onAuthStateChange
    // setTareas([]) // Si tienes tareas específicas del usuario
    navigate('/login'); // Redirige al login
  };


  if (cargando) return <p>Cargando perfil...</p>;
  if (!perfil && !usuarioAuth) return <p>No estás logueado o no se pudo cargar el perfil.</p>;
  // Muestra un mensaje si el usuario está autenticado pero el perfil aún no se ha cargado
  if (usuarioAuth && !perfil) return <p>Cargando datos del perfil...</p>;


  return (
    <div>
      <h2>Perfil de Usuario</h2>
      {perfil && (
        <>
          <label>Nombre:
            <input name="nombre" value={form.nombre || ''} onChange={handleChange} />
          </label><br />
          <label>Correo:
            <input name="correo" value={form.correo || ''} readOnly /> {/* El correo usualmente no se edita */}
          </label><br />
          <label>Fecha de nacimiento:
            <input type="date" name="fecha_nacimiento" value={form.fecha_nacimiento || ''} onChange={handleChange} />
          </label><br />
          <label>Teléfono:
            <input name="telefono" value={form.telefono || ''} onChange={handleChange} />
          </label><br />
          <label>Rol:
            <input name="roll" value={form.roll || ''} readOnly /> {/* El rol no debería ser editable */}
          </label><br />
          <button onClick={handleUpdate}>Guardar cambios</button>
        </>
      )}
      <hr />
      <h3>Agregar imagen</h3>
      <input
        type="text"
        placeholder="URL de la imagen"
        value={nuevaUrl}
        onChange={(e) => setNuevaUrl(e.target.value)}
      />
      <button onClick={handleAgregarUrl}>Agregar</button>
      <h3>Imágenes guardadas</h3>
      <ul>
        {imagenes.map((img) => (
          <li key={img.id}>
            <img src={img.url} alt="Imagen de usuario" width="150" />
            <br />
            <button onClick={() => handleEliminarImagen(img.id)}>Eliminar</button>
          </li>
        ))}
      </ul>
      <hr />
      <h2>Quiero cerrar sesión</h2>
      <button onClick={handleLogout}>Cerrar sesión</button>
      <br /><br /><br /><br /><br /> {/* Espacio para el menú fijo */}
    </div>
  );
}

export default Usuarios;