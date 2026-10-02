package com.example.mandala.services;

public Tablero click(id) {
    Celda celda = tablero.getCelda(id);

    celda.incrementarNumero(tablero.getCantidadColores());
    
}