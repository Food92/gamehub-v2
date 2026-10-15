import "./App.css";
import Header from "./components/Header/Header.jsx";
import Footer from "./components/Footer/Footer.jsx";
import VistaActual from "./components/VistaActual/VistaActual.jsx";
import { useGameHub } from "./hooks/useGameHub.js";

export default function App() {
  const gameHub = useGameHub();
  return (
    <>
      <Header pagina={gameHub.pagina} />
      <main className="container-fluid">
        <VistaActual {...gameHub} />
      </main>
      <Footer />
      <a
        href="#carrito"
        className="floating-cart"
        aria-label="Ver carrito de compras"
      >
         <span>{gameHub.cantidadTotal}</span>
      </a>
      {gameHub.modal && (
        <div
          className="modal"
          onClick={(e) => {
            if (e.target === e.currentTarget) gameHub.setModal(null);
          }}
        >
          <section
            className="modal-box"
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-modal"
          >
            <button
              className="close"
              onClick={() => gameHub.setModal(null)}
              aria-label="Cerrar"
            >
              ×
            </button>
            <h2 id="titulo-modal">{gameHub.modal.nombre}</h2>
            <ul>
              {(gameHub.modal.caracteristicas || []).map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
            <button className="btn full" onClick={gameHub.agregarDesdeModal}>
              Agregar al carrito
            </button>
          </section>
        </div>
      )}
    </>
  );
}
