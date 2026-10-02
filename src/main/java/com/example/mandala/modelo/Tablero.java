package com.example.mandala.modelo;

import java.util.ArrayList;


public class Tablero {
    private int cantidad_colores;
    private ArrayList<ColorCelda> colores;

    public Tablero(int cantidad_colores) {
        this.cantidad_colores = cantidad_colores;
        this.colores = new ArrayList<>();
    }


    public ArrayList<ColorCelda> getColores() {
        return this.colores;
    }

    public void setColores(ArrayList<ColorCelda> colores) {
        this.colores = colores;
    }

    public boolean nuevoColor(ColorCelda color) {
        if(this.colores.size() >= this.cantidad_colores) {
            return false;
        }

        this.colores.add(color);
        return true;
    }

    public boolean eliminarColor(ColorCelda color) {
        if(this.colores.isEmpty()) {
            return false;
        }

        this.colores.remove(color);
        return true;
    }

    public ColorCelda getColor(int i) {
        if(this.colores.size() <= i || i < 0) {
            return null;
        }

        return this.colores.get(i);
    }
}