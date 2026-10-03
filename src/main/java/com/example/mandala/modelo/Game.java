package com.example.mandala.modelo;

public class Game {
    private static int siguienteId = 1;

    private int id;
    private Tablero tablero;

    public Game(int cantidad_colores, int cantidad_celdas) {
        this.id = siguienteId;
        siguienteId++;

        this.tablero = new Tablero(cantidad_colores, cantidad_celdas);
    }

    public int getId() {
        return id;
    }

    public Tablero getTablero() {
        return tablero;
    }

    public void setTablero(Tablero tablero) {
        this.tablero = tablero;
    }
}