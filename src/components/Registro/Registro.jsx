import "./Registro.css";

export default function Registro({
  registrar,
  navegar,
  mensaje,
  errorAuth,
  autenticando = false,
}) {
  return (
    <section className="form-card">
      <h1>Crear cuenta</h1>
      <form onSubmit={registrar}>
        <label>
          Nombre *
          <input name="nombre" required placeholder="Tu nombre" />
        </label>
        <label>
          Apellido *
          <input name="apellido" required placeholder="Tu apellido" />
        </label>
        <label>
          RUT *
          <input
            name="rut"
            required
            placeholder="12345678-9"
            pattern="^\d{7,8}-[\dkK]$"
            title="Formato esperado: 12345678-9"
          />
        </label>
        <label>
          Teléfono *
          <input
            name="telefono"
            required
            placeholder="+56 912345678"
            pattern="^(\+56)?\s?9\d{8}$"
            title="Formato esperado: +56 9XXXXXXXX"
          />
        </label>
        <label>
          Correo electrónico *
          <input
            name="email"
            type="email"
            required
            placeholder="usuario@correo.com"
          />
        </label>
        <label>
          Contraseña *
          <input name="clave" type="password" minLength="6" required />
        </label>
        <label>
          Confirmar contraseña *
          <input name="confirmar" type="password" minLength="6" required />
        </label>
        <button className="btn full" type="submit" disabled={autenticando}>
          {autenticando ? "Registrando..." : "Registrarme"}
        </button>
      </form>

      {navegar && (
        <button
          className="btn secondary full"
          type="button"
          onClick={() => navegar("perfil")}
        >
          ¿Ya tienes cuenta? Iniciar sesión
        </button>
      )}

      {errorAuth && (
        <p className="muted" role="alert">
          {errorAuth}
        </p>
      )}
      {mensaje && (
        <p className="success" role="status">
          {mensaje}
        </p>
      )}
    </section>
  );
}
