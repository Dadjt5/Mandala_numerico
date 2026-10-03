package com.example.mandala.controlador;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import services.GameService;
import modelo.Tablero;
import dto.ClickRequest;
import dto.CreateGameRequest;


@RestController
@RequestMapping("/api/games")
public class GameController {

    @PostMapping("/{gameId}/click")
    public Tablero click(@PathVariable int gameId, @RequestBody ClickRequest request) {
        return gameService.click(gameId, request.getCeldaId());
    }

    @GetMapping("/{gameId}/tablero")
    public Tablero getTablero(@PathVariable int gameId) {
        return gameService.getPartida(gameId).getTablero();
    }

    @PostMapping("/nueva")
    public Tablero nuevaPartida(@RequestBody CreateGameRequest request) {
        return gameService.nuevaPartida(request.getCantidadColores(), request.getCantidadCeldas());
    }
}