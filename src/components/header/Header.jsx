import React from "react";
import "./Header.css";

function Header() {
  return (
    <header>
      <a href="/" className="logo-container">
        <div className="logo-text">
          <span className="brand-game">GAME</span>
          <span className="brand-hub">HUB</span>
          <span className="brand-badge">STORE</span>
        </div>
      </a>
      <nav>
        <ul>
          <li>
            <a href="/">Inicio</a>
          </li>
          <li>
            <a href="/catalogo">Catálogo</a>
          </li>
          <li>
            <a href="/perfil">Perfil</a>
          </li>
          <li>
            <a href="/registro">Registro</a>
          </li>
          <li>
            <a href="/contacto">Contacto</a>
          </li>
        </ul>
      </nav>
    </header>
  );
}

export default Header;
