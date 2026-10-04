let gameId = null;
let ocupado = false;
let numerosAnteriores = new Map();

const PALETA = ["var(--c1)", "var(--c2)", "var(--c3)", "var(--c4)", "var(--c5)"];

document.getElementById("btn-nueva-partida").addEventListener("click", nuevaPartida);
nuevaPartida(); // arranca con una partida lista para jugar

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

// Nombres de color en español -> colores de la paleta del mandala
const NOMBRES = {
    amarillo: "var(--c1)", naranja: "var(--c1)",
    rojo: "var(--c2)", coral: "var(--c2)", rosa: "var(--c2)",
    azul: "var(--c3)", turquesa: "var(--c3)", celeste: "var(--c3)", cian: "var(--c3)",
    violeta: "var(--c4)", morado: "var(--c4)", purpura: "var(--c4)", púrpura: "var(--c4)",
    verde: "var(--c5)"
};

// El tablero trae `colores`: la posicion `numero` indica el color de esa celda.
// El valor puede ser un color CSS (#hex, rgb, "red"), un nombre en español o un indice.
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

// Matriz en rombo con centro. Las celdas llegan en orden de anchura (BFS):
//   0 = centro, luego sus 4 hijas (arriba, derecha, abajo, izquierda),
//   luego las hijas de la primera hija, de la segunda, etc.
// En la cuadricula, las celdas de las esquinas del rombo tienen DOS madres,
// asi que cada anillo k tiene 4k celdas (1, 4, 8, 12...) y no se repiten.
// Cada anillo se recorre en sentido horario empezando por la hija de arriba
// de la primera madre: en el anillo k, la celda (-(k-1), -1).
function posicion(i) {
    if (i === 0) return {x: 0, y: 0};

    let k = 1;
    let j = i - 1;
    while (j >= 4 * k) {
        j -= 4 * k;
        k++;
    }

    // q = posicion en el anillo contando en sentido horario desde la celda de arriba (0, -k)
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

        if (antes !== undefined && celda.numero !== antes) {
            animar(boton, celda.numero > antes ? "sube" : "desborda");
        }

        numerosAnteriores.set(celda.id, celda.numero);
        total += Number(celda.numero) || 0;
    });

    document.getElementById("total").textContent = total;
}