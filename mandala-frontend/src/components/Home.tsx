import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import './Home.css'

const NAME_RULE = /^[A-Za-z0-9_\u00C0-\u017F]{2,16}$/;

const LAVENDER = "230, 225, 255";
const SAFFRON = "255, 184, 77";
const INNER_RADIUS = 70;
const RING_GAP = 36;
const DIGIT_SPACING = 30;

function MandalaCanvas({ boostRef }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let w = 0;
    let h = 0;
    let rings = [];
    let raf = 0;
    let last = performance.now();

    const build = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const maxR = Math.min(Math.max(w, h) * 0.5, 560);
      const count = Math.max(4, Math.floor((maxR - INNER_RADIUS) / RING_GAP));
      const prev = rings.map((r) => r.angle);

      rings = Array.from({ length: count }, (_, i) => {
        const radius = INNER_RADIUS + i * RING_GAP;
        const digits =
          9 * Math.max(1, Math.round((2 * Math.PI * radius) / DIGIT_SPACING / 9));
        return {
          radius,
          digits,
          angle: prev[i] ?? i * 0.35,
          speed: (i % 2 ? 1 : -1) * (0.014 + i * 0.0045),
          alpha: 0.78 - (i / count) * 0.5,
          size: 13 + Math.min(i, 5) * 0.8,
        };
      });
      draw();
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      ctx.save();
      ctx.translate(w / 2, h / 2);
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      for (const ring of rings) {
        ctx.font = `500 ${ring.size}px "Unbounded", "DM Sans", sans-serif`;
        const step = (Math.PI * 2) / ring.digits;
        for (let j = 0; j < ring.digits; j++) {
          const digit = (j % 9) + 1;
          ctx.save();
          ctx.rotate(ring.angle + j * step);
          ctx.translate(0, -ring.radius);
          ctx.fillStyle =
            digit === 5
              ? `rgba(${SAFFRON}, ${Math.min(1, ring.alpha + 0.2)})`
              : `rgba(${LAVENDER}, ${ring.alpha * 0.42})`;
          ctx.fillText(String(digit), 0, 0);
          ctx.restore();
        }
      }
      ctx.restore();
    };

    const frame = (now) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      boostRef.current += (1 - boostRef.current) * Math.min(1, dt * 1.8);
      for (const ring of rings) ring.angle += ring.speed * boostRef.current * dt;
      draw();
      raf = requestAnimationFrame(frame);
    };

    build();
    if (!reduceMotion) raf = requestAnimationFrame(frame);
    window.addEventListener("resize", build);
    if (document.fonts?.ready) document.fonts.ready.then(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", build);
    };
  }, [boostRef]);

  return <canvas ref={canvasRef} className="mn-canvas" aria-hidden="true" />;
}

/* ------------------------------------------------------------
   Pantalla de inicio
------------------------------------------------------------ */
export default function Home() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [player, setPlayer] = useState(null);
  const boostRef = useRef(1);

  const spin = useCallback((power) => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduce) boostRef.current = power;
  }, []);

  useEffect(() => {
    if (!player) return;

    const t = setTimeout(() => {
      navigate("/juego");
    }, 1500);

    return () => clearTimeout(t);
  }, [player, navigate]);

  const enter = (p) => {
    spin(9);
    setPlayer(p);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const value = name.trim();
    if (value.length < 2) return setError("El nombre necesita al menos 2 caracteres.");
    if (!NAME_RULE.test(value))
      return setError("Usa solo letras, números o guion bajo, sin espacios.");
    setError("");
    enter({ name: value, guest: false });
  };

  const handleGuest = () => {
    const id = Math.floor(1000 + Math.random() * 9000);
    enter({ name: `Invitado-${id}`, guest: true });
  };

  const handleChange = (e) => {
    setName(e.target.value);
    if (error) setError("");
    spin(3.5); // cada tecla da un pequeño impulso a los anillos
  };

  return (
    <div className="mn-root">
      <MandalaCanvas boostRef={boostRef} />

      <main className="mn-stage">
        <section className="mn-card" aria-labelledby="mn-title">
          <h1 id="mn-title" className="mn-title">
            Mandala numérico
          </h1>

          {!player ? (
            <>
              <p className="mn-lead">
                Escribe un nombre de usuario para empezar, o entra sin registrarte.
              </p>

              <form onSubmit={handleSubmit} noValidate>
                <label htmlFor="mn-username" className="mn-label">
                  Nombre de usuario
                </label>
                <input
                  id="mn-username"
                  className="mn-field"
                  type="text"
                  value={name}
                  onChange={handleChange}
                  maxLength={16}
                  placeholder="Por ejemplo: luna_9"
                  autoComplete="nickname"
                  autoCapitalize="off"
                  spellCheck={false}
                  aria-invalid={error ? "true" : undefined}
                  aria-describedby={error ? "mn-error" : "mn-hint"}
                />

                {error ? (
                  <p id="mn-error" className="mn-note mn-error" role="alert">
                    {error}
                  </p>
                ) : (
                  <p id="mn-hint" className="mn-note mn-hint">
                    De 2 a 16 caracteres: letras, números o guion bajo.
                  </p>
                )}

                <button type="submit" className="mn-btn mn-btn-primary">
                  Jugar
                </button>

                <div className="mn-divider" aria-hidden="true">
                  o
                </div>

                <button type="button" className="mn-btn mn-btn-ghost" onClick={handleGuest}>
                  Entrar como invitado
                </button>
              </form>
            </>
          ) : (
            <div role="status" aria-live="polite">
              <p className="mn-welcome">
                Hola, <strong>{player.name}</strong>. Preparando el tablero…
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