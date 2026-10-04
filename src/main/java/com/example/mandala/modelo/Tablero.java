package com.example.mandala.modelo;

import java.util.ArrayList;

public class Tablero {
    private int cantidad_colores;
    private ArrayList<ColorCelda> colores;
    private ArrayList<Celda> celdas;

    public Tablero(int cantidad_colores, int cantidad_celdas) {
        this.cantidad_colores = cantidad_colores;

        this.colores = new ArrayList<>();
        this.colores.add(ColorCelda.BLANCO);
        this.colores.add(ColorCelda.VERDE);
        this.colores.add(ColorCelda.AZUL);
        this.colores.add(ColorCelda.ROJO);
 
        this.celdas = new ArrayList<>();
        this.celdas.add(new Celda(1, true, -1));

        int idPadre = 1;
        int hijos = 4; // Rombo, solo el primero tiene 4 hijos
        for (int i = 2; i <= cantidad_celdas; i++) {
            if (hijos == 0) {
                hijos = 3;
                idPadre++;
            }

            this.celdas.add(new Celda(i, false, idPadre));
            hijos--;
        }
    }

    public int getCantidadColores() {
        return this.cantidad_colores;
    }

    public void setCantidadColores(int cantidad) {
        this.cantidad_colores = cantidad;
    }

    public ArrayList<Celda> getCeldas() {
        return this.celdas;
    }

    public void setCeldas(ArrayList<Celda> celdas) {
        this.celdas = celdas;
    }

    public ArrayList<Celda> getHijas(Celda padre) {
        ArrayList<Celda> cdas = new ArrayList<>();

        for (Celda c: this.celdas) {
            if (c.getPadre() == padre.getId()) {
                cdas.add(c);
            }
        }

        return cdas;
    }

    public Celda getCelda(int id) {
        for (Celda c: this.celdas) {
            if (c.getId() == id) {
                return c;
            }
        }

        return null;
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