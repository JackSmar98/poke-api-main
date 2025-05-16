// src/componentes/administrador/index.jsx
import { useEffect, useState } from "react";
import { supabase } from "../../supabase";
import { useNavigate } from "react-router-dom";

function Administrador() {
  const [usuarios, setUsuarios] = useState([]);
  // No necesitamos un estado separado para 'fotos' aquí, ya que se anidarán en 'usuarios'
  const [loading, setLoading] = useState(true);
  // accesoPermitido se maneja por la ruta en App.jsx, pero puedes tener una doble verificación.
  const navigate = useNavigate();

  useEffect(() => {
    // La verificación de acceso ya la hace App.jsx,
    // pero si quieres doble seguridad o lógica específica de admin aquí:
    async function verificarAdminYObtenerDatos() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            navigate("/login"); // No debería llegar aquí si App.jsx funciona bien
            return;
        }
        const { data: perfilAdmin, error: errorAdmin } = await supabase
            .from('usuario')
            .select('roll')
            .eq('id', user.id)
            .single();

        if (errorAdmin || !perfilAdmin || perfilAdmin.roll !== 'admin') {
            navigate("/"); // Redirigir si no es admin
            return;
        }

        // Si es admin, obtener datos
        obtenerDatosAdmin();
    }

    verificarAdminYObtenerDatos();

  }, [navigate]);

  const obtenerDatosAdmin = async () => {
    setLoading(true);
    try {
      const { data: usuariosData, error: usuariosError } = await supabase
        .from("usuario")
        .select("id, nombre, correo, roll, telefono, fecha_nacimiento"); // Añade fecha_nacimiento

      const { data: fotosData, error: fotosError } = await supabase
        .from("multimedia")
        .select("id, url, usuarioid");

      if (usuariosError || fotosError) {
        console.error("Error al obtener datos:", usuariosError, fotosError);
        setLoading(false);
        return;
      }

      const usuariosConFotos = usuariosData.map((usuario) => ({
        ...usuario,
        fotos: fotosData.filter((foto) => foto.usuarioid === usuario.id),
      }));

      setUsuarios(usuariosConFotos);
    } catch (error) {
      console.error("Error general al obtener los datos:", error);
    }
    setLoading(false);
  };


  const handleUsuarioChange = (e, usuarioId, campo) => {
    const newValue = e.target.value;
    setUsuarios((prevUsuarios) =>
      prevUsuarios.map((usr) =>
        usr.id === usuarioId ? { ...usr, [campo]: newValue } : usr
      )
    );
  };

  const guardarCambiosUsuario = async (usuario) => {
    const { fotos, ...datosUsuario } = usuario; // Excluir 'fotos' del objeto a actualizar
    // También excluye 'roll' si no quieres que se pueda cambiar desde aquí
    const { roll, ...datosParaActualizar} = datosUsuario;

    const { error } = await supabase
      .from("usuario")
      .update(datosParaActualizar)
      .eq("id", usuario.id);

    if (error) {
      alert(`Error al actualizar usuario ${usuario.nombre}: ${error.message}`);
      console.error(error);
    } else {
      alert(`Usuario ${usuario.nombre} actualizado.`);
    }
  };

  const eliminarImagenAdmin = async (imagenId, usuarioId) => {
    const { error } = await supabase
      .from("multimedia")
      .delete()
      .eq("id", imagenId);

    if (error) {
      alert(`Error al eliminar la imagen: ${error.message}`);
      console.error(error);
    } else {
      // Actualizar el estado local para reflejar la eliminación
      setUsuarios((prevUsuarios) =>
        prevUsuarios.map((usr) =>
          usr.id === usuarioId
            ? { ...usr, fotos: usr.fotos.filter((foto) => foto.id !== imagenId) }
            : usr
        )
      );
      alert("Imagen eliminada.");
    }
  };


  if (loading) return <div>Cargando datos de administrador...</div>;

  return (
    <div className="admin-container" style={{ paddingBottom: '80px' }}> {/* Añadir padding si el menú es fijo */}
      <h1>Administrador - Gestión de Usuarios y Multimedia</h1>
      <table>
        <thead>
          <tr>
            <th>ID Usuario</th>
            <th>Nombre</th>
            <th>Correo</th>
            <th>Teléfono</th>
            <th>Fecha Nacimiento</th>
            <th>Rol</th>
            <th>Fotos</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((usuario) => (
            <tr key={usuario.id}>
              <td>{usuario.id}</td>
              <td>
                <input
                  type="text"
                  value={usuario.nombre}
                  onChange={(e) => handleUsuarioChange(e, usuario.id, "nombre")}
                />
              </td>
               <td>
                <input
                  type="email"
                  value={usuario.correo}
                  onChange={(e) => handleUsuarioChange(e, usuario.id, "correo")}
                />
              </td>
              <td>
                <input
                  type="tel"
                  value={usuario.telefono}
                  onChange={(e) => handleUsuarioChange(e, usuario.id, "telefono")}
                />
              </td>
               <td>
                <input
                  type="date"
                  value={usuario.fecha_nacimiento}
                  onChange={(e) => handleUsuarioChange(e, usuario.id, "fecha_nacimiento")}
                />
              </td>
              <td>
                 <input
                  type="text"
                  value={usuario.roll}
                  onChange={(e) => handleUsuarioChange(e, usuario.id, "roll")} // Permitir editar rol
                />
              </td>
              <td>
                {usuario.fotos.map((foto) => (
                  <div key={foto.id} style={{ display: "inline-block", marginRight: "10px", textAlign: 'center' }}>
                    <img
                      src={foto.url}
                      alt={`Foto de ${usuario.nombre}`}
                      style={{ width: "100px", height: "auto", marginBottom: "5px", display: 'block' }}
                    />
                    <button onClick={() => eliminarImagenAdmin(foto.id, usuario.id)}>Eliminar</button>
                  </div>
                ))}
              </td>
              <td>
                <button onClick={() => guardarCambiosUsuario(usuario)}>
                  Guardar Cambios
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Administrador;