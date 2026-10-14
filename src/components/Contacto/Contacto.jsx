import './Contacto.css';
export default function Contacto({ enviarContacto, mensaje }) {
  return <section className="form-card"><h1>Contacto y soporte</h1><form onSubmit={enviarContacto}><label>Nombre *<input required name="nombre"/></label><label>Correo electrónico *<input required type="email" name="email"/></label><label>Mensaje *<textarea required name="mensaje" rows="4"/></label><button className="btn full">Enviar mensaje</button></form>{mensaje && <p className="success" role="status">{mensaje}</p>}</section>;
}
