import './Header.css';
const enlaces = [['inicio','Inicio'],['catalogo','Catálogo'],['ofertas','Ofertas'],['carrito','Carrito'],['perfil','Perfil'],['contacto','Contacto'],['admin','Administración']];
export default function Header({ pagina }) { return <header><a className="logo" href="#inicio"><span>GAME</span><b>HUB</b><small>STORE</small></a><nav aria-label="Navegación principal">{enlaces.map(([ruta,texto]) => <a key={ruta} className={pagina===ruta?'active':''} href={`#${ruta}`}>{texto}</a>)}</nav></header>; }
