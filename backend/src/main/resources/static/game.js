let gameId = null;
let ocupado = false;
let numerosAnteriores = new Map();

const PALETA = ["var(--c1)", "var(--c2)", "var(--c3)", "var(--c4)", "var(--c5)"];

document.getElementById("btn-nueva-partida").addEventListener("click", nuevaPartida);

function mostrarMensaje(texto, esError = false) {
    const el = document.getElementById("mensaje");
    el.textContent = texto;
    el.classList.toggle("error", esError);
}

async function nuevaPartida() {
    const cantidadColores = document.getElementById("cantidad-colores").value;
    const cantidadCeldas = document.getElementById("cantidad-celdas").value;

    try {
        mostrarMensaje("");
        const response = await fetch("/api/games/nueva", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({cantidadColores: cantidadColores, cantidadCeldas: cantidadCeldas})
        });
        if (!response.ok) throw new Error();

        const game = await response.json();
        gameId = game.id;
        numerosAnteriores = new Map();
        pintarTablero(game.tablero, true);
    } catch {
        mostrarMensaje("No se pudo crear la partida. Revisa la conexión e inténtalo de nuevo.", true);
    }
}

async function clickCelda(celdaId) {
    if (ocupado || gameId === null) return;
    ocupado = true;

    try {
        const response = await fetch(`/api/games/${gameId}/click`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({celdaId: celdaId})
        });
        if (!response.ok) throw new Error();

        const tablero = await response.json();
        pintarTablero(tablero);
    } catch {
        mostrarMensaje("No se pudo registrar el click. Inténtalo de nuevo.", true);
    } finally {
        ocupado = false;
    }
}

const NOMBRES = {
    amarillo: "var(--c1)", naranja: "var(--c1)",
    rojo: "var(--c2)", coral: "var(--c2)", rosa: "var(--c2)",
    azul: "var(--c3)", turquesa: "var(--c3)", celeste: "var(--c3)", cian: "var(--c3)",
    violeta: "var(--c4)", morado: "var(--c4)", purpura: "var(--c4)", púrpura: "var(--c4)",
    verde: "var(--c5)"
};

function colorDe(celda, tablero) {
    const valor = tablero.colores ? tablero.colores[celda.numero] : undefined;
    if (valor === undefined || valor === null) return PALETA[celda.numero % PALETA.length];
    if (typeof valor === "number") return PALETA[valor % PALETA.length];

    const clave = String(valor).trim().toLowerCase();
    return NOMBRES[clave] || valor;
}

function animar(boton, clase) {
    boton.classList.remove(clase);
    void boton.offsetWidth; // reinicia la animacion
    boton.classList.add(clase);
    boton.addEventListener("animationend", () => boton.classList.remove(clase), {once: true});
}


function posicion(i) {
    if (i === 0) return {x: 0, y: 0};

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

    return {x, y};
}

function pintarTablero(tablero, reiniciar = false) {
    const elemento = document.getElementById("tablero");
    const celdas = tablero.celdas;
    const n = celdas.length;

    const pos = celdas.map((celda, i) => posicion(i));

    // Radio de la matriz (en celdas) -> tamano y separacion en % del tablero
    const radio = Math.max(...pos.map(p => Math.max(Math.abs(p.x), Math.abs(p.y))));
    const paso = 100 / (2 * radio + 1);
    const tam = Math.min(paso * 0.86, 16);

    if (reiniciar || elemento.children.length !== n) {
        elemento.innerHTML = "";
        celdas.forEach((celda, i) => {
            const boton = document.createElement("button");
            boton.className = "celda";
            boton.dataset.celdaId = celda.id;
            boton.setAttribute("aria-label", `Celda ${i + 1} de ${n}`);
            boton.addEventListener("click", () => clickCelda(celda.id));
            elemento.appendChild(boton);
        });
    }

    let total = 0;
    celdas.forEach((celda, i) => {
        const boton = elemento.children[i];
        const antes = numerosAnteriores.get(celda.id);

        boton.style.setProperty("--x", pos[i].x);
        boton.style.setProperty("--y", pos[i].y);
        boton.style.setProperty("--paso", paso);
        boton.style.setProperty("--tam", tam);
        boton.style.setProperty("--color", colorDe(celda, tablero));
        boton.textContent = celda.numero;
        boton.dataset.valor = celda.numero; // permite estilar las celdas vacías en CSS

        if (antes !== undefined && celda.numero !== antes) {
            animar(boton, celda.numero > antes ? "sube" : "desborda");
        }

        numerosAnteriores.set(celda.id, celda.numero);
        total += Number(celda.numero) || 0;
    });

    document.getElementById("total").textContent = total;
}


/* ================= Paleta de colores (solo visual) ================= */

const PRESETS = {
    neon:   ['#ff007f', '#00f0ff', '#7000ff', '#00ff66', '#ffb700'],
    zen:    ['#78909c', '#a1887f', '#81c784', '#e0e0e0', '#d4e157'],
    sunset: ['#ff4e50', '#fc913a', '#f9d423', '#ede580', '#e1f5fe'],
    pastel: ['#ffb3ba', '#bae1ff', '#baffc9', '#ffffba', '#e8baff'],
    cosmic: ['#8a2be2', '#4b0082', '#00ffff', '#ff1493', '#4169e1']
};

const selectColores = document.getElementById("cantidad-colores");
const selectPreset = document.getElementById("preset-paletas");
const contenedorPaleta = document.getElementById("contenedor-paleta");
const coloresActuales = [...PRESETS.neon];

function aplicarColores() {
    coloresActuales.forEach((c, i) => document.documentElement.style.setProperty(`--c${i + 2}`, c));
}

function renderSelectoresColor() {
    const cantidad = Number(selectColores.value);
    contenedorPaleta.innerHTML = "";

    for (let i = 0; i < cantidad-1; i++) {
        const caja = document.createElement("div");
        caja.className = "selector-color";
        caja.style.backgroundColor = coloresActuales[i];

        const input = document.createElement("input");
        input.type = "color";
        input.value = coloresActuales[i];
        input.title = `Elegir color ${i + 1}`;
        input.setAttribute("aria-label", `Color ${i + 1}`);
        input.addEventListener("input", e => {
            coloresActuales[i] = e.target.value;
            caja.style.backgroundColor = e.target.value;
            selectPreset.value = "custom";
            aplicarColores();
        });

        caja.appendChild(input);
        contenedorPaleta.appendChild(caja);
    }
}

selectPreset.addEventListener("change", e => {
    const preset = PRESETS[e.target.value];
    if (!preset) return;
    coloresActuales.splice(0, 5, ...preset);
    aplicarColores();
    renderSelectoresColor();
});

selectColores.addEventListener("change", () => {
    renderSelectoresColor();
    nuevaPartida();
});

document.getElementById("cantidad-celdas").addEventListener("change", nuevaPartida);

aplicarColores();
renderSelectoresColor();
nuevaPartida();