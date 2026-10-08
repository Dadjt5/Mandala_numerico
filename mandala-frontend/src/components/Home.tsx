import { useCallback, useEffect, useRef, useState } from "react";
import type { ChangeEvent, FormEvent, MutableRefObject } from "react";
import { useNavigate } from "react-router-dom";

import "./Home.css";

/* ------------------------------------------------------------
   Tipos
------------------------------------------------------------ */
interface Player {
  name: string;
  guest: boolean;
}

interface MandalaControl {
  tocarCentro: () => void;
  cascadaTotal: () => void;
}

interface Pulso {
  desde: number; // -1 si es un toque del jugador
  hacia: number;
  salida: number;
  llegada: number;
}

const NAME_RULE = /^[A-Za-z0-9_\u00C0-\u017F]{2,16}$/;

/* ------------------------------------------------------------
   Reglas del mandala de demostración
   Mismas ideas que el juego: una celda sube de color al tocarla,
   y al pasar del último color se vacía y suma 1 a sus vecinas
   de índice mayor, así la cadena siempre avanza hacia fuera
------------------------------------------------------------ */
const COLORES = 3;
const M = COLORES + 1; // estados de una celda: 0 (vacía) ... COLORES
const RADIO = 4; // 1 + 2·4·5 = 41 celdas
const RETARDO = 85; // ms que tarda el desborde en llegar a la vecina

const TONOS = ["#3dd6c6", "#ff6b8b", "#ffb84d"]; // 1, 2 y 3 (el último es el ámbar)
const LAVANDA = "230, 225, 255";
const AMBAR = "255, 184, 77";
const TINTA = "#17143a";

function posicion(i: number): { x: number; y: number } {
  if (i === 0) return { x: 0, y: 0 };

  let k = 1;
  let j = i - 1;
  while (j >= 4 * k) {
    j -= 4 * k;
    k++;
  }

  const q = (3 * k + 1 + j) % (4 * k);
  const lado = Math.floor(q / k);
  const t = q % k;
  const [x, y] = [
    [t, -k + t],
    [k - t, t],
    [-t, k - t],
    [-k + t, -t],
  ][lado];

  return { x, y };
}

const N = 1 + 2 * RADIO * (RADIO + 1);
const POS = Array.from({ length: N }, (_, i) => posicion(i));
const INDICE = new Map(POS.map((p, i) => [`${p.x},${p.y}`, i] as const));

const SALIDAS: number[][] = POS.map((p, i) =>
  [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ]
    .map(([dx, dy]) => INDICE.get(`${p.x + dx},${p.y + dy}`))
    .filter((k): k is number => k !== undefined && k > i)
);

/*------------------------------------------------------------
   Mandala con canvas
-----------------------------------------------------------*/
function MandalaDemo({ controlRef }: { controlRef: MutableRefObject<MandalaControl | null> }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reducir = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const retardo = reducir ? 0 : RETARDO;

    const valores = Array.from({ length: N }, () => Math.floor(Math.random() * M));
    const marcaCambio = new Array<number>(N).fill(-1e9);
    const marcaDesborde = new Array<number>(N).fill(-1e9);
    let pulsos: Pulso[] = [];

    let lado = 0;
    let dpr = 1;
    let raf = 0;
    let ultimaActividad = performance.now() - 1300;

    const paso = () => lado / (2 * RADIO + 1);
    const centro = (i: number) => ({
      x: lado / 2 + POS[i].x * paso(),
      y: lado / 2 + POS[i].y * paso(),
    });

    /* ---------- Simulación ---------- */

    const lanzar = (hacia: number, ahora: number) => {
      pulsos.push({ desde: -1, hacia, salida: ahora, llegada: ahora });
    };

    const avanzar = (ahora: number) => {
      let hayPulsosVencidos = true;
      while (hayPulsosVencidos) {
        hayPulsosVencidos = false;
        const siguientes: Pulso[] = [];

        for (const p of pulsos) {
          if (p.llegada > ahora) {
            siguientes.push(p);
            continue;
          }
          hayPulsosVencidos = true;
          ultimaActividad = ahora;

          valores[p.hacia]++;
          marcaCambio[p.hacia] = p.llegada;

          if (valores[p.hacia] >= M) {
            valores[p.hacia] = 0;
            marcaDesborde[p.hacia] = p.llegada;
            for (const k of SALIDAS[p.hacia]) {
              siguientes.push({
                desde: p.hacia,
                hacia: k,
                salida: p.llegada,
                llegada: p.llegada + retardo,
              });
            }
          }
        }
        pulsos = siguientes;
      }
    };

    /* ---------- Dibujo ---------- */

    const draw = (ahora: number) => {
      ctx.clearRect(0, 0, lado, lado);
      const r = paso() * 0.4;

      // Líneas entre vecinas: es por donde viaja el desborde
      ctx.strokeStyle = `rgba(${LAVANDA}, 0.1)`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let i = 0; i < N; i++) {
        const a = centro(i);
        for (const k of SALIDAS[i]) {
          const b = centro(k);
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
        }
      }
      ctx.stroke();

      // Ondas de desborde
      if (!reducir) {
        for (let i = 0; i < N; i++) {
          const edad = ahora - marcaDesborde[i];
          if (edad < 0 || edad > 600) continue;
          const t = edad / 600;
          const c = centro(i);
          ctx.beginPath();
          ctx.arc(c.x, c.y, r * (1 + t * 2.2), 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(${AMBAR}, ${(1 - t) * 0.9})`;
          ctx.lineWidth = 0.5 + 2 * (1 - t);
          ctx.stroke();
        }
      }

      // Celdas
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      for (let i = 0; i < N; i++) {
        const c = centro(i);
        const v = valores[i];
        const pop = reducir ? 0 : Math.max(0, 1 - (ahora - marcaCambio[i]) / 280);
        const radio = r * (1 + 0.22 * pop);

        ctx.beginPath();
        ctx.arc(c.x, c.y, radio, 0, Math.PI * 2);

        if (v === 0) {
          ctx.strokeStyle = `rgba(${LAVANDA}, 0.28)`;
          ctx.lineWidth = 1.5;
          ctx.stroke();
          continue;
        }

        ctx.shadowColor = TONOS[v - 1];
        ctx.shadowBlur = (v === M - 1 ? 18 : 8) * dpr;
        ctx.fillStyle = TONOS[v - 1];
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.fillStyle = TINTA;
        ctx.font = `600 ${Math.max(9, r * 0.9)}px "Unbounded", "DM Sans", sans-serif`;
        ctx.fillText(String(v), c.x, c.y + 0.5);
      }

      // Pulsos viajando de una celda a su vecina
      for (const p of pulsos) {
        if (p.desde < 0 || p.llegada <= ahora) continue;
        const t = Math.min(1, Math.max(0, (ahora - p.salida) / (p.llegada - p.salida)));
        const a = centro(p.desde);
        const b = centro(p.hacia);
        ctx.beginPath();
        ctx.arc(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t, r * 0.24, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${AMBAR}, 0.95)`;
        ctx.fill();
      }
    };

    /* ---------- Acciones ---------- */

    const tocar = (i: number) => {
      const ahora = performance.now();
      lanzar(i, ahora);
      ultimaActividad = ahora;
      if (reducir) {
        avanzar(ahora);
        draw(ahora);
      }
    };

    controlRef.current = {
      tocarCentro: () => tocar(0),
      // Todas las celdas al límite y un toque en el centro: desbordan todas en cadena
      cascadaTotal: () => {
        const ahora = performance.now();
        valores.fill(M - 1);
        marcaCambio.fill(ahora);
        pulsos = [];
        lanzar(0, ahora);
        ultimaActividad = ahora;
        if (reducir) {
          avanzar(ahora);
          draw(ahora);
        }
      },
    };

    const alPulsar = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const escala = lado / rect.width;
      const px = (e.clientX - rect.left) * escala;
      const py = (e.clientY - rect.top) * escala;

      let mejor = -1;
      let dmin = Infinity;
      for (let i = 0; i < N; i++) {
        const c = centro(i);
        const d = Math.hypot(px - c.x, py - c.y);
        if (d < dmin) {
          dmin = d;
          mejor = i;
        }
      }
      if (mejor >= 0 && dmin <= paso() * 0.6) tocar(mejor);
    };

    /* ---------- Tamaño y bucle ---------- */

    const ajustar = () => {
      const rect = canvas.getBoundingClientRect();
      lado = rect.width;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(lado * dpr);
      canvas.height = Math.round(lado * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw(performance.now());
    };

    const frame = (ahora: number) => {
      avanzar(ahora);

      // Si nadie toca, el mandala se toca solo (más a menudo cerca del centro)
      if (pulsos.length === 0 && ahora - ultimaActividad > 1800) {
        lanzar(Math.floor(Math.random() ** 2 * N), ahora);
        ultimaActividad = ahora;
      }

      draw(ahora);
      raf = requestAnimationFrame(frame);
    };

    const observador = new ResizeObserver(ajustar);
    observador.observe(canvas);
    canvas.addEventListener("pointerdown", alPulsar);
    ajustar();
    if (!reducir) raf = requestAnimationFrame(frame);
    if (document.fonts?.ready) document.fonts.ready.then(() => draw(performance.now()));

    return () => {
      cancelAnimationFrame(raf);
      observador.disconnect();
      canvas.removeEventListener("pointerdown", alPulsar);
      controlRef.current = null;
    };
  }, [controlRef]);

  return (
    <canvas
      ref={canvasRef}
      className="mn-canvas"
      role="img"
      aria-label="Mandala de ejemplo. Toca una celda para ver cómo desborda y contagia a sus vecinas."
    />
  );
}

/* ------------------------------------------------------------
   Pantalla de inicio
------------------------------------------------------------ */
export default function Home() {
  const navigate = useNavigate();

  const [control, setControl] = useState(false);
  const mandala = useRef<MandalaControl | null>(null);

  useEffect(() => {
    if (!control) return;

    const t = setTimeout(() => {
      navigate("/libre");
    }, 1700);

    return () => clearTimeout(t);
  }, [control, navigate]);


  const modoLibre = () => {
    setControl(true);
  };

  const modoHistoria = () => {
    navigate("/niveles");
  };

  const modoBatalla = () => {
  };


  return (
    <div className="mn-root">
      <main className="mn-stage">
        <figure className="mn-figura">
          <MandalaDemo controlRef={mandala} />
          <figcaption className="mn-pie">Toca el mandala para probarlo.</figcaption>
        </figure>

        <section className="mn-card" aria-labelledby="mn-title">
          <h1 id="mn-title" className="mn-title">
            Mandala numérico
          </h1>

          {!control ? (
            <>
              <p className="mn-lead">
                Toca una celda y sube de color. Si ya estaba en el último, desborda y contagia a sus
                vecinas en cadena.
              </p>

              <div
                className="mn-escala"
                role="img"
                aria-label="Una celda pasa de 0 a 3 y, al pasar del 3, desborda"
              >
                <span className="mn-paso mn-e0" aria-hidden="true">0</span>
                <span className="mn-union" aria-hidden="true" />
                <span className="mn-paso mn-e1" aria-hidden="true">1</span>
                <span className="mn-union" aria-hidden="true" />
                <span className="mn-paso mn-e2" aria-hidden="true">2</span>
                <span className="mn-union" aria-hidden="true" />
                <span className="mn-paso mn-e3" aria-hidden="true">3</span>
                <span className="mn-union" aria-hidden="true" />
                <span className="mn-desborda" aria-hidden="true">desborda</span>
              </div>

              <div className="mn-botones">
                <button type="button" className="mn-btn mn-btn-libre" onClick={modoLibre}>
                  Modo libre
                </button>

                <button type="button" className="mn-btn mn-btn-historia" onClick={modoHistoria}>
                  Niveles
                </button>

                <button type="button" className="mn-btn mn-btn-batalla" onClick={modoBatalla}>
                  Batalla campal
                </button>
              </div>
            </>
          ) : (
            <div role="status" aria-live="polite">
              <p className="mn-welcome">
                Preparando el tablero…
              </p>
              <div className="mn-progress">
                <span />
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}