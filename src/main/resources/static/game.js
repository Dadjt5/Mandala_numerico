let gameId = null;
document.getElementById("btn-nueva-partida").addEventListener("click", nuevaPartida);

async function nuevaPartida() {
    const cantidadColores = document.getElementById("cantidad-colores").value;
    const cantidadCeldas = document.getElementById("cantidad-celdas").value;

    const response = await fetch("/api/games/nueva", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({cantidadColores: cantidadColores, cantidadCeldas: cantidadCeldas})
    });

    const game = await response.json();
    gameId = game.id;
    pintarTablero(game.tablero);
}

async function clickCelda(celdaId) {
    const response = await fetch(`/api/games/${gameId}/click`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({celdaId: celdaId})
    });

    const tablero = await response.json();
    pintarTablero(tablero);
}

function pintarTablero(tablero) {
    const elemento = document.getElementById("tablero");

    elemento.innerHTML = "";
    for (const celda of tablero.celdas) {
        const boton = document.createElement("button");

        boton.textContent = celda.numero;
        boton.dataset.celdaId = celda.id;

        boton.addEventListener("click", () => {
            clickCelda(celda.id);
        });

        elemento.appendChild(boton);
    }
}