package com.example.mandala.modelo;


public class Celda {
    private int id;
    private int numero;
    private boolean inicial;
    private ColorCelda color;
    private int padre;

    public Celda(int id, boolean inicial, int padre) {
        this.id = id;
        this.numero = 0;
        this.inicial = inicial;
        this.color = ColorCelda.BLANCO;
        this.padre = padre;
    }

    public int getId() {
        return this.id;
    }

    public int getNumero() {
        return this.numero;
    }

    public void setNumero(int numero) {
        this.numero = numero;
    }

    public ColorCelda getColor() {
        return this.color;
    }

    public void setColor(ColorCelda color) {
        this.color = color;
    }

    public boolean incrementarNumero(int cantidad_colores) {
        this.numero++;

        if (this.numero == cantidad_colores) {
            this.numero = 0;
            return true;
        }

        return false;
    }

    public boolean esInicial() {
        return this.inicial;
    }

    public void setInicial(boolean ini) {
        this.inicial = ini;
    }

    public int getPadre() {
        return this.padre;
    }

    public void setPadre(int padre) {
        this.padre = padre;
    }
}