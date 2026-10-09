import React from "react";
import "./Hero.css";

function Hero() {
  return (
    <section className="hero">
      <div className="hero-text">
        <p className="subtitulo">HARDWARE • CONSOLAS • PERIFÉRICOS</p>
        <h1>
          Juega sin <span className="highlight">límites.</span>
        </h1>
        <p>
          Arma el setup que imaginas con tecnología seleccionada para rendir al
          máximo.
        </p>
        <div className="botones">
          <button className="btn-principal">Explorar catálogo →</button>
          <button className="btn-secundario">Crear cuenta</button>
        </div>
        <div className="stats">
          <p>
            <strong>+120</strong> productos gamer
          </p>
          <p>
            <strong>24/7</strong> soporte experto
          </p>
          <p>
            <strong>3 años</strong> de garantía
          </p>
        </div>
      </div>
      <div className="hero-imagen">
        <div className="gh-card">
          <h2>GH</h2>
          <p>PERFORMANCE UNLOCKED</p>
        </div>
      </div>
    </section>
  );
}

export default Hero;
