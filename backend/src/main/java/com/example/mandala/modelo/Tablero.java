package com.example.mandala.modelo;

import java.util.ArrayList;
import java.util.List;
import java.lang.Math;


public class Tablero {
    private int cantidad_colores;
    private ArrayList<Celda> celdas;

    private Posicion posicion(int id) {
        if (id <= 1) {
            return new Posicion(0, 0);
        }

        // 1. Calcular en qué capa (L) se encuentra el ID
        int L = (int) Math.ceil((-1.0 + Math.sqrt(2.0 * id - 1.0)) / 2.0);

        // 2. Encontrar el ID donde comienza esta capa y el offset
        int idInicio = 2 * (L - 1) * (L - 1) + 2 * (L - 1) + 2;
        int offset = id - idInicio;

        // 3. Determinar el lado del rombo (0 a 3) y el índice dentro de ese lado (i)
        int lado = offset / L;
        int i = offset % L;

        int x = 0;
        int y = 0;

        // 4. Calcular coordenadas según el cuadrante / lado del diamante
        switch (lado) {
            case 0: // Lado Superior-Derecho (Sube hacia la derecha)
                x = -L + 1 + i;
                y = 1 + i;
                break;
            case 1: // Lado Inferior-Derecho (Baja hacia la derecha)
                x = 1 + i;
                y = L - 1 - i;
                break;
            case 2: // Lado Inferior-Izquierdo (Baja hacia la izquierda)
                x = L - 1 - i;
                y = -1 - i;
                break;
            case 3: // Lado Superior-Izquierdo (Sube hacia la izquierda)
                x = -1 - i;
                y = -(L - 1) + i;
                break;
        }

        return new Posicion(x, y);
    }

    public Tablero(int cantidad_colores, int cantidad_celdas) {
        this.cantidad_colores = cantidad_colores;
 
        this.celdas = new ArrayList<>();
        for (int i = 1; i <= cantidad_celdas; i++) {
            Posicion posicion = posicion(i);

            Celda celda;

            if (i == 1) {
                celda = new Celda(i, true, posicion.x(), posicion.y());
            } else {
                celda = new Celda(i, false, posicion.x(), posicion.y());
            }


            this.celdas.add(celda);
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

    public ArrayList<Celda> getHijas(Celda celda) {
        ArrayList<Celda> hijas = new ArrayList<>();

        int x = celda.getPosicionX();
        int y = celda.getPosicionY();

        for (Celda c : this.celdas) {
            if (esHija(celda, c)) {
                hijas.add(c);
            }
        }

        return hijas;
    }

    private boolean esHija(Celda padre, Celda posibleHija) {
        int dx = posibleHija.getPosicionX() - padre.getPosicionX();
        int dy = posibleHija.getPosicionY() - padre.getPosicionY();

        if (Math.abs(dx)+Math.abs(dy) == 1 && padre.getId() < posibleHija.getId()) {
            return true;
        }

        return false;
    }

    public Celda getCelda(int id) {
        for (Celda c: this.celdas) {
            if (c.getId() == id) {
                return c;
            }
        }

        return null;
    }
}