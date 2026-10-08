import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./components/Home";
import Juego from "./components/Juego";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/juego" element={<Juego />} />
      </Routes>
    </BrowserRouter>
  );
}