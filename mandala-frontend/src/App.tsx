import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./components/Home";
import Juego from "./components/Juego";
import Niveles from "./components/Niveles";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/libre" element={<Juego />} />
        <Route path="/niveles" element={<Niveles />} />
      </Routes>
    </BrowserRouter>
  );
}