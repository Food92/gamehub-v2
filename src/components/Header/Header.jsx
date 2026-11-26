import {
  obtenerEnlacesNavegacion,
  rutaPorDefecto,
} from "../../logica/roles.js";

export default function Header({ pagina, rol = null }) {
  const enlaces = obtenerEnlacesNavegacion(rol);
  const destinoLogo = rutaPorDefecto(rol);

  return (
    <header>
      <a className="logo" href={`#${destinoLogo}`}>
        <span>GAME</span>
        <b>HUB</b>
        <small>STORE</small>
      </a>
      <nav aria-label="Navegación principal">
        {enlaces.map(([ruta, texto]) => (
          <a
            key={ruta}
            className={pagina === ruta ? "active" : ""}
            href={`#${ruta}`}
          >
            {texto}
          </a>
        ))}
      </nav>
    </header>
  );
}
