import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";

import "./Juego.css";

interface Celda {
    id: number;
    numero: number;
}

interface Tablero {
    celdas: Celda[];
    colores?: Record<string, number | string | null>;
}

interface Partida {
    id: number;
    tablero: Tablero;
}

const API_URL = import.meta.env.VITE_API_URL;

const PALETA = ["var(--c1)", "var(--c2)", "var(--c3)", "var(--c4)", "var(--c5)"];

const NOMBRES: Record<string, string> = {
    amarillo: "var(--c1)", naranja: "var(--c1)",
    rojo: "var(--c2)", coral: "var(--c2)", rosa: "var(--c2)",
    azul: "var(--c3)", turquesa: "var(--c3)", celeste: "var(--c3)", cian: "var(--c3)",
    violeta: "var(--c4)", morado: "var(--c4)", purpura: "var(--c4)", púrpura: "var(--c4)",
    verde: "var(--c5)"
};

const PRESETS: Record<string, string[]> = {
    neon:   ["#ff007f", "#00f0ff", "#7000ff", "#00ff66", "#ffb700"],
    zen:    ["#78909c", "#a1887f", "#81c784", "#e0e0e0", "#d4e157"],
    sunset: ["#ff4e50", "#fc913a", "#f9d423", "#ede580", "#e1f5fe"],
    pastel: ["#ffb3ba", "#bae1ff", "#baffc9", "#ffffba", "#e8baff"],
    cosmic: ["#8a2be2", "#4b0082", "#00ffff", "#ff1493", "#4169e1"]
};


function colorDe(celda: Celda, tablero: Tablero): string {
    const valor = tablero.colores ? tablero.colores[celda.numero] : undefined;
    if (valor === undefined || valor === null) return PALETA[celda.numero % PALETA.length];
    if (typeof valor === "number") return PALETA[valor % PALETA.length];

    const clave = String(valor).trim().toLowerCase();
    return NOMBRES[clave] || valor;
}

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
        [-k + t, -t]
    ][lado];

    return { x, y };
}

function animar(boton: HTMLElement, clase: string) {
    boton.classList.remove(clase);
    void boton.offsetWidth;
    boton.classList.add(clase);
    boton.addEventListener("animationend", () => boton.classList.remove(clase), { once: true });
}


export default function Juego() {
    const [tablero, setTablero] = useState<Tablero | null>(null);
    const [mensaje, setMensaje] = useState<{ texto: string; error: boolean }>({ texto: "", error: false });
    const [cantidadColores, setCantidadColores] = useState("4");
    const [cantidadCeldas, setCantidadCeldas] = useState("13");
    const [preset, setPreset] = useState("neon");
    const [coloresActuales, setColoresActuales] = useState<string[]>([...PRESETS.neon]);

    const gameId = useRef<number | null>(null);
    const ocupado = useRef(false);
    const numerosAnteriores = useRef<Map<number, number>>(new Map());
    const peticionActual = useRef(0); // descarta respuestas obsoletas
    const botones = useRef<Map<number, HTMLButtonElement>>(new Map());
    const animacionesPendientes = useRef<Map<number, string>>(new Map());

    const mostrarMensaje = (texto: string, error = false) => setMensaje({ texto, error });


    const aplicarTablero = (nuevo: Tablero, reiniciar = false) => {
        if (reiniciar) numerosAnteriores.current = new Map();

        const pendientes = new Map<number, string>();
        nuevo.celdas.forEach(celda => {
            const antes = numerosAnteriores.current.get(celda.id);
            if (antes !== undefined && celda.numero !== antes) {
                pendientes.set(celda.id, celda.numero > antes ? "sube" : "desborda");
            }
            numerosAnteriores.current.set(celda.id, celda.numero);
        });

        animacionesPendientes.current = pendientes;
        setTablero(nuevo);
    };

    const nuevaPartida = useCallback(async () => {
        const peticion = ++peticionActual.current;

        try {
            mostrarMensaje("");
            const response = await fetch(`${API_URL}/api/games/nueva`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ cantidadColores, cantidadCeldas })
            });
            if (!response.ok) throw new Error();

            const game: Partida = await response.json();
            if (peticion !== peticionActual.current) return;

            gameId.current = game.id;
            aplicarTablero(game.tablero, true);
        } catch {
            if (peticion !== peticionActual.current) return;
            mostrarMensaje("No se pudo crear la partida. Revisa la conexión e inténtalo de nuevo.", true);
        }
    }, [cantidadColores, cantidadCeldas]);

    const clickCelda = async (celdaId: number) => {
        if (ocupado.current || gameId.current === null) return;
        ocupado.current = true;

        try {
            const response = await fetch(`${API_URL}/api/games/${gameId.current}/click`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ celdaId })
            });
            if (!response.ok) throw new Error();

            const nuevo: Tablero = await response.json();
            aplicarTablero(nuevo);
        } catch {
            mostrarMensaje("No se pudo registrar el click. Inténtalo de nuevo.", true);
        } finally {
            ocupado.current = false;
        }
    };


    useEffect(() => {
        nuevaPartida();
    }, [nuevaPartida]);

    useLayoutEffect(() => {
        animacionesPendientes.current.forEach((clase, id) => {
            const boton = botones.current.get(id);
            if (boton) animar(boton, clase);
        });
        animacionesPendientes.current = new Map();
    }, [tablero]);

    useEffect(() => {
        coloresActuales.forEach((c, i) => {
            document.documentElement.style.setProperty(`--c${i + 2}`, c);
        });
    }, [coloresActuales]);


    const { pos, paso, tam, total } = useMemo(() => {
        const celdas = tablero?.celdas ?? [];
        const pos = celdas.map((_, i) => posicion(i));

        const radio = pos.length
            ? Math.max(...pos.map(p => Math.max(Math.abs(p.x), Math.abs(p.y))))
            : 0;
        const paso = 100 / (2 * radio + 1);
        const tam = Math.min(paso * 0.86, 16);
        const total = celdas.reduce((suma, c) => suma + (Number(c.numero) || 0), 0);

        return { pos, paso, tam, total };
    }, [tablero]);


    const cambiarPreset = (valor: string) => {
        setPreset(valor);
        const nuevo = PRESETS[valor];
        if (!nuevo) return;
        setColoresActuales([...nuevo]);
    };

    const cambiarColor = (i: number, valor: string) => {
        setColoresActuales(prev => prev.map((c, idx) => (idx === i ? valor : c)));
        setPreset("custom");
    };

    return (
        <div className="contenedor">
            <header className="cabecera">
                <h1 className="titulo">Mandala geométrico</h1>
                <p className="subtitulo">
                    Toca una celda para infundirle energía. Cuando alcanza su límite se desborda
                    y contagia a sus vecinas en cadena.
                </p>
            </header>

            <section className="panel controles">
                <div className="controles-grid">
                    <div className="campo">
                        <label htmlFor="cantidad-colores">Nº de colores</label>
                        <select
                            id="cantidad-colores"
                            value={cantidadColores}
                            onChange={e => setCantidadColores(e.target.value)}
                        >
                            <option value="3">3 colores</option>
                            <option value="4">4 colores</option>
                            <option value="5">5 colores</option>
                        </select>
                    </div>

                    <div className="campo">
                        <label htmlFor="cantidad-celdas">Tamaño del tablero</label>
                        <select
                            id="cantidad-celdas"
                            value={cantidadCeldas}
                            onChange={e => setCantidadCeldas(e.target.value)}
                        >
                            <option value="5">5 celdas (mini)</option>
                            <option value="13">13 celdas (estándar)</option>
                            <option value="25">25 celdas (grande)</option>
                            <option value="41">41 celdas (épico)</option>
                        </select>
                    </div>

                    <div className="campo">
                        <label htmlFor="preset-paletas">Paleta</label>
                        <select
                            id="preset-paletas"
                            value={preset}
                            onChange={e => cambiarPreset(e.target.value)}
                        >
                            <option value="neon">Neón vibrante</option>
                            <option value="zen">Zen meditación</option>
                            <option value="sunset">Atardecer dorado</option>
                            <option value="pastel">Dulce pastel</option>
                            <option value="cosmic">Místico cósmico</option>
                            <option value="custom">Personalizada</option>
                        </select>
                    </div>

                    <button
                        id="btn-nueva-partida"
                        className="btn-nueva"
                        type="button"
                        onClick={nuevaPartida}
                    >
                        Nueva partida
                    </button>
                </div>

                <div className="paleta">
                    <span className="paleta-titulo">Ajusta cada color</span>
                    <div id="contenedor-paleta" className="paleta-selectores">
                        {Array.from({ length: Number(cantidadColores) - 1 }, (_, i) => (
                            <div
                                key={i}
                                className="selector-color"
                                style={{ backgroundColor: coloresActuales[i] }}
                            >
                                <input
                                    type="color"
                                    value={coloresActuales[i]}
                                    title={`Elegir color ${i + 1}`}
                                    aria-label={`Color ${i + 1}`}
                                    onChange={e => cambiarColor(i, e.target.value)}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <main className="juego">
                <div className="marcador">
                    <span className="marcador-etiqueta">Total</span>
                    <span id="total" className="marcador-valor" aria-live="polite">
                        {total}
                    </span>
                </div>

                <section className="escenario" aria-label="Tablero del mandala">
                    <div id="tablero" className="tablero" role="group">
                        {tablero?.celdas.map((celda, i) => (
                            <button
                                key={celda.id}
                                ref={el => {
                                    if (el) botones.current.set(celda.id, el);
                                    else botones.current.delete(celda.id);
                                }}
                                className="celda"
                                data-celda-id={celda.id}
                                data-valor={celda.numero} // permite estilar las celdas vacías en CSS
                                aria-label={`Celda ${i + 1} de ${tablero.celdas.length}`}
                                style={
                                    {
                                        "--x": pos[i].x,
                                        "--y": pos[i].y,
                                        "--paso": paso,
                                        "--tam": tam,
                                        "--color": colorDe(celda, tablero)
                                    } as CSSProperties
                                }
                                onClick={() => clickCelda(celda.id)}
                            >
                                {celda.numero}
                            </button>
                        ))}
                    </div>
                </section>

                <p id="mensaje" className={mensaje.error ? "mensaje error" : "mensaje"} role="status">
                    {mensaje.texto}
                </p>
            </main>

            <footer className="pie">Mandala &bull; Reacción en cadena</footer>
        </div>
    );
}