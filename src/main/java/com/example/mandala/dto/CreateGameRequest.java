package com.example.mandala.dto;

public class CreateGameRequest {
    private int cantidadColores;
    private int cantidadCeldas;

    public int getCantidadColores() {
        return cantidadColores;
    }

    public void setCantidadColores(int cantidadColores) {
        this.cantidadColores = cantidadColores;
    }

    public int getCantidadCeldas() {
        return cantidadCeldas;
    }

    public void setCantidadCeldas(int cantidadCeldas) {
        this.cantidadCeldas = cantidadCeldas;
    }
}