import './Registro.css';
export default function Registro({ registrar, mensaje }) {
  return <section className="form-card"><h1>Crear cuenta</h1><form onSubmit={registrar}><label>Nombre completo *<input name="nombre" required placeholder="Tu nombre"/></label><label>Correo electrónico *<input name="email" type="email" required placeholder="usuario@correo.com"/></label><label>Contraseña *<input name="clave" type="password" minLength="6" required/></label><label>Confirmar contraseña *<input name="confirmar" type="password" required/></label><button className="btn full">Registrarme</button></form>{mensaje && <p className="success" role="status">{mensaje}</p>}</section>;
}
