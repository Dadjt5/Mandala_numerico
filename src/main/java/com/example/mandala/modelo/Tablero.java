package com.example.mandala.modelo;

import java.util.ArrayList;
import java.util.List;
import java.lang.Math;


public class Tablero {
    private int cantidad_colores;
    private ArrayList<ColorCelda> colores;
    private ArrayList<Celda> celdas;

    private Posicion posicion(int i) {
        if (i == 0) {
            return new Posicion(0, 0);
        }

        int r = 1;
        while (i > 2 * r * (r + 1)) {
            r++;
        }

        int k = i - (2 * r * (r - 1) + 1);
        int t = (k + 1) % (4 * r);
        int lado = t / r;
        int o = t % r;

        return switch (lado) {
            case 0 -> new Posicion(-r + o, -o);
            case 1 -> new Posicion(o, -r + o);
            case 2 -> new Posicion(r - o, o);
            case 3 -> new Posicion(-o, r - o);
            default -> throw new IllegalStateException();
        };
    }

    public Tablero(int cantidad_colores, int cantidad_celdas) {
        this.cantidad_colores = cantidad_colores;

        this.colores = new ArrayList<>();
        this.colores.add(ColorCelda.BLANCO);
        this.colores.add(ColorCelda.VERDE);
        this.colores.add(ColorCelda.AZUL);
        this.colores.add(ColorCelda.ROJO);
 
        this.celdas = new ArrayList<>();
        for (int i = 1; i <= cantidad_celdas; i++) {
            Posicion posicion = posicion(i);

            Celda celda;

            if (i == 0) {
                celda = new Celda(i, true, posicion.x(), posicion.y());
            } else {
                celda = new Celda(i, false, posicion.x(), posicion.y());
            }

            System.out.printf(
            "Celda %d -> (%d, %d)%n",
            celda.getId(),
            celda.getPosicionX(),
            celda.getPosicionY()
            );

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

        if (Math.abs(dx)+Math.abs(dy) == 1) {
            System.out.println("hija: (" + posibleHija.getPosicionX() + ", " + posibleHija.getPosicionY() + ")");
            System.out.println("padre: (" + padre.getPosicionX() + ", " + padre.getPosicionY() + ")");
            System.out.println("dx: " + dx + ", dy: " + dy + "\n");
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