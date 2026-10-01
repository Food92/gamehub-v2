import { useState } from "react";

import "./App.css";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";

function App() {
  const [activa, setActiva] = useState("jsx");

  return (
    <>
      <Header />
      <Footer />
    </>
  );
}

export default App;
