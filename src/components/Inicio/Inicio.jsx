import "../Catalogo/Catalogo.css";

/** Presenta la portada y una selección de productos destacados. */
export default function Inicio({ productos = [], CatalogoVista, onNavegar }) {
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">HARDWARE · CONSOLAS · PERIFÉRICOS</p>
          <h1>
            Juega sin <span>límites.</span>
          </h1>
          <p className="hero-desc">
            Arma el setup que imaginas con tecnología seleccionada para rendir
            al máximo.
          </p>
          <div className="actions">
            <button className="btn" onClick={() => onNavegar("catalogo")}>
              Explorar catálogo →
            </button>
            <button
              className="btn secondary"
              onClick={() => onNavegar("perfil")}
            >
              Mi perfil / Crear cuenta
            </button>
          </div>
          <div className="stats">
            <div>
              <b>{productos.length}</b>
              <small>productos en catálogo</small>
            </div>
            <div>
              <b>24/7</b>
              <small>tienda de demostración</small>
            </div>
            <div>
              <b>100%</b>
              <small>frontend académico</small>
            </div>
          </div>
        </div>
        <div className="hero-visual">
          <div className="orb" />
          <div className="hero-panel">
            <span>GH</span>
            <small>PERFORMANCE UNLOCKED</small>
          </div>
        </div>
      </section>
      <p className="eyebrow center">SELECCIÓN DESTACADA</p>
      <h2 className="section-title">Potencia tu próximo nivel</h2>
      <CatalogoVista productos={productos.slice(0, 3)} />
    </>
  );
}
