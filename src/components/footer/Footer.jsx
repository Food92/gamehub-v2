import React from "react";
import "./Footer.css";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-content">
        <p>
          <strong>GameHub Store</strong> &copy; {currentYear} - Todos los
          derechos reservados.
        </p>
        <nav className="footer-links">
          <a href="#privacy">Privacidad</a>
          <a href="#terms">Términos de servicio</a>
          <a href="#contact">Contacto</a>
        </nav>
      </div>
    </footer>
  );
};

export default Footer;
