import './Perfil.css';
export default function Perfil({ usuario, cerrarSesion, navegar, mensaje }) {
  return <section className="form-card profile"><div className="avatar">GH</div><h1>Mi perfil</h1>{usuario ? <><h2>{usuario.nombre}</h2><p className="muted">{usuario.email}</p><span className="pill">Miembro GameHub</span><button className="btn secondary full" onClick={cerrarSesion}>Cerrar sesión</button></> : <><p className="muted">Aún no tienes una cuenta registrada.</p><button className="btn" onClick={() => navegar('registro')}>Crear cuenta</button></>}{mensaje && <p className="success">{mensaje}</p>}</section>;
}
