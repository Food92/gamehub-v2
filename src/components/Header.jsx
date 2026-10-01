const Header = () => {
  return (
    <header className="header">
      <a href="index.html" className="logo-container">
        <div className="logo-text">
          <span className="brand-game">GAME</span>
          <span className="brand-hub">HUB</span>
          <span className="brand-badge">STORE</span>
        </div>
      </a>

      <nav>
        <ul>
          <li>
            <a href="index.html">Inicio</a>
          </li>
          <li>
            <a href="catalogo.html">Catálogo</a>
          </li>
          <li>
            <a href="perfil.html">Perfil</a>
          </li>
          <li>
            <a href="registro.html">Registro</a>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
