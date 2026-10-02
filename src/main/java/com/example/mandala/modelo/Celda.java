package com.example.mandala.modelo;


public class Celda {
    private int numero;
    private boolean inicial;
    private Celda padre;

    public Celda(boolean inicial, Celda padre) {
        this.numero = 0;
        this.inicial = inicial;
        this.padre = padre;
    }

    public int getNumero() {
        return numero;
    }

    public void setNumero(int numero) {
        this.numero = numero;
    }

    public boolean esInicial() {
        return this.inicial;
    }

    public void setInicial(boolean ini) {
        this.inicial = ini;
    }

    public Celda getPadre() {
        return this.padre;
    }

    public void setPadre(Celda padre) {
        this.padre = padre;
    }
}