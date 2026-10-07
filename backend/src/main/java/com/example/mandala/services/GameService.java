package com.example.mandala.services;

import com.example.mandala.modelo.Game;
import com.example.mandala.modelo.Celda;
import com.example.mandala.modelo.Tablero;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.HashMap;
import java.util.Map;


@Service
public class GameService {
    private Map<Integer, Game> partidas = new HashMap<>();

    public Tablero click(int gameId, int idCelda) {
        Tablero tablero = partidas.get(gameId).getTablero();
        Celda celda = tablero.getCelda(idCelda);

        Boolean desborde = celda.incrementarNumero(tablero.getCantidadColores());

        if (desborde) {
            List<Celda> hijas = tablero.getHijas(celda);

            for (Celda c: hijas) {
                click(gameId, c.getId());
            }
        }

        return tablero;
    }

    public Game nuevaPartida(int cantidad_colores, int cantidad_celdas) {
        Game partida = new Game(cantidad_colores, cantidad_celdas);

        partidas.put(partida.getId(), partida);
        return partida;
    }

    public Game getPartida(int id) {
        return partidas.get(id);
    }
}