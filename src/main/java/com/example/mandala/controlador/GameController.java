package com.example.mandala.controlador;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class GameController {

    @GetMapping("/")
    public String hello() {
        return "Mandala Game";
    }

    @PostMapping("/click")
    public Tablero click(@RequestParam int fila, @RequestParam int columna) {
        return gameService.click(fila, columna);
    }
}