package com.example.mandala.controlador;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.mandala.services.GameService;
import com.example.mandala.modelo.Tablero;
import com.example.mandala.modelo.Game;
import com.example.mandala.dto.ClickRequest;
import com.example.mandala.dto.CreateGameRequest;


@RestController
@RequestMapping("/api/games")
public class GameController {
    private final GameService gameService;

    public GameController(GameService gameService) {
        this.gameService = gameService;
    }

    @PostMapping("/{gameId}/click")
    public Tablero click(@PathVariable int gameId, @RequestBody ClickRequest request) {
        return gameService.click(gameId, request.getCeldaId());
    }

    @GetMapping("/{gameId}/tablero")
    public Tablero getTablero(@PathVariable int gameId) {
        return gameService.getPartida(gameId).getTablero();
    }

    @PostMapping("/nueva")
    public Game nuevaPartida(@RequestBody CreateGameRequest request) {
        return gameService.nuevaPartida(request.getCantidadColores(), request.getCantidadCeldas());
    }
}