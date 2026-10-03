package com.example.mandala.services;

import modelo.Game;


@Service
public class GameService {
    private Map<Integer, Game> partidas = new HashMap<>();

    public Tablero click(gameId, idCelda) {
        Tablero tablero = partidas.get(id).getTablero();
        Celda celda = tablero.getCelda(idCelda);

        Boolean desborde = celda.incrementarNumero(tablero.getCantidadColores());

        if (desborde) {
            List<Celda> hijas = tablero.getHijas(celda);

            for (Celda c: hijas) {
                click(c.getId());
            }
        }

        return tablero;
    }

    public Game nuevaPartida(cantidad_colores, cantidad_celdas) {
        Game partida = new Game(cantidad_colores, cantidad_celdas);

        partidas.put(partida.getId(), partida);
        return partida;
    }

    public Game getPartida(int id) {
        return partidas.get(id);
    }
}