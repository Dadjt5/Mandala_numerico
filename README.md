# Mandala

Aplicación web interactiva desarrollada con **Spring Boot**, cuyo objetivo es implementar un juego de estrategia basado en un tablero de celdas, reacciones en cadena y toma de decisiones.

El proyecto está compuesto por un frontend desarrollado inicialmente con **HTML, CSS y JavaScript vanilla** y un backend desarrollado con **Java + Spring Boot**, comunicados mediante una **API REST**.

Actualmente el proyecto se encuentra en fase de desarrollo.

## Demo

**Aplicación en producción:** próximamente

## Tecnologías

**Frontend**

* HTML5
* CSS3
* JavaScript
* Fetch API
* React o Angular (previsto)

**Backend**

* Java 21
* Spring Boot
* Spring Web
* Maven

**Comunicación**

* API REST
* JSON
* HTTP

**Base de datos**

* Actualmente no se utiliza una base de datos
* Estado de las partidas almacenado temporalmente en memoria

**Deployment**

* Próximamente

## Funcionalidades

* Creación de nuevas partidas
* Configuración del número de colores
* Configuración del número de celdas
* Gestión de múltiples partidas simultáneas
* Representación de un tablero de juego
* Identificación individual de las celdas
* Interacción con las celdas mediante clics
* Incremento del valor de las celdas
* Reacciones en cadena
* Comunicación entre frontend y backend mediante API REST
* Gestión de partidas mediante un servicio de Spring
* Serialización de objetos Java a JSON mediante Spring Boot

## Arquitectura

```text
┌─────────────────────────────┐
│       HTML / CSS / JS       │
│          Frontend           │
└──────────────┬──────────────┘
               │
            REST API
               │
┌──────────────▼──────────────┐
│         Spring Boot         │
│           Backend           │
│                            │
│  Controller → Service      │
│       ↓                    │
│      Model                 │
└──────────────┬──────────────┘
               │
        Estado en memoria
               │
┌──────────────▼──────────────┐
│          Game               │
│             ↓               │
│         Tablero             │
│             ↓               │
│          Celdas             │
└─────────────────────────────┘
```

## API REST

La comunicación entre el frontend y el backend se realiza mediante una API REST.

### Crear una partida

```http
POST /api/games/nueva
```

Ejemplo de petición:

```json
{
  "cantidadColores": 3,
  "cantidadCeldas": 10
}
```

La respuesta contiene la partida creada y su tablero.

### Obtener el tablero de una partida

```http
GET /api/games/{gameId}/tablero
```

### Realizar un movimiento

```http
POST /api/games/{gameId}/click
```

Ejemplo:

```json
{
  "celdaId": 7
}
```

El backend procesa el movimiento y devuelve el estado actualizado del tablero.

## Modelo del juego

El juego se estructura mediante diferentes entidades del dominio.

```text
Game
 │
 └── Tablero
      │
      ├── Celda
      ├── Celda
      ├── Celda
      └── ...
```

### Game

Representa una partida concreta.

Cada partida tiene:

* Un identificador único
* Un tablero
* Su propio estado de juego

Esto permite gestionar varias partidas de forma independiente.

### Tablero

Representa el tablero de una partida.

Actualmente contiene:

* Número de colores
* Lista de colores
* Lista de celdas

Además, se encarga de establecer la estructura jerárquica entre las diferentes celdas.

### Celda

Representa una posición individual del tablero.

Cada celda dispone de:

* Identificador
* Número actual
* Indicador de si es una celda inicial
* Relación con su celda padre

La estructura permite posteriormente implementar diferentes tipos de tableros y reglas de juego.

## Estructura del proyecto

```text
Mandala/
├── src/
│   └── main/
│       ├── java/
│       │   └── com/
│       │       └── example/
│       │           └── mandala/
│       │               ├── MandalaApplication.java
│       │               │
│       │               ├── controlador/
│       │               │   └── GameController.java
│       │               │
│       │               ├── services/
│       │               │   └── GameService.java
│       │               │
│       │               ├── modelo/
│       │               │   ├── Celda.java
│       │               │   ├── ColorCelda.java
│       │               │   ├── Game.java
│       │               │   └── Tablero.java
│       │               │
│       │               └── dto/
│       │                   ├── ClickRequest.java
│       │                   └── CreateGameRequest.java
│       │
│       └── resources/
│           └── static/
│               ├── index.html
│               ├── style.css
│               └── game.js
│
├── pom.xml
├── mvnw
├── mvnw.cmd
└── README.md
```

## Organización del backend

El backend sigue una separación por responsabilidades:

```text
Controller
    ↓
Service
    ↓
Model
```

### Controller

`GameController` se encarga de recibir las peticiones HTTP y exponer los endpoints de la API REST.

```text
/api/games/nueva
/api/games/{id}/tablero
/api/games/{id}/click
```

### Service

`GameService` contiene la lógica principal del juego.

Entre sus responsabilidades se encuentran:

* Crear partidas
* Buscar partidas
* Gestionar movimientos
* Modificar el tablero
* Procesar las reacciones en cadena

El servicio mantiene actualmente las partidas en memoria mediante un `Map`.

### Model

Las clases del paquete `modelo` representan los elementos principales del dominio:

```text
Game
Tablero
Celda
ColorCelda
```

### DTO

Los DTO se utilizan para representar los datos recibidos desde el frontend.

Actualmente se utilizan:

```text
ClickRequest
CreateGameRequest
```

Esto permite separar los datos de las peticiones HTTP de las entidades utilizadas internamente por el juego.

## Ejecución local

Para ejecutar el proyecto localmente es necesario tener instalado:

* Java 21
* Maven

El proyecto incluye Maven Wrapper, por lo que no es necesario instalar Maven manualmente.

Clonar o descargar el proyecto y acceder a su directorio:

```bash
cd Mandala
```

Dar permisos de ejecución al Maven Wrapper si es necesario:

```bash
chmod +x mvnw
```

Ejecutar la aplicación:

```bash
./mvnw spring-boot:run
```

La aplicación estará disponible en:

```text
http://localhost:8080
```

El frontend se sirve directamente desde Spring Boot mediante:

```text
src/main/resources/static/
```

## Desarrollo

El proyecto está siendo desarrollado progresivamente, empezando por la implementación de la lógica básica del juego y la comunicación entre frontend y backend.

La evolución prevista incluye:

```text
1. Juego básico
      ↓
2. Reacciones en cadena
      ↓
3. Sistema de colores
      ↓
4. Sistema de puntuación
      ↓
5. Campaña y niveles
      ↓
6. Diferentes tipos de tablero
      ↓
7. Persistencia con PostgreSQL
      ↓
8. Autenticación de usuarios
      ↓
9. Migración del frontend a React o Angular
      ↓
10. Testing y optimización
      ↓
11. Despliegue
```

## Objetivo del proyecto

El objetivo del proyecto es desarrollar una aplicación web interactiva utilizando **Spring Boot** como backend y aplicar progresivamente conceptos propios del desarrollo profesional de aplicaciones web.

Además de construir el juego, el proyecto sirve como aprendizaje práctico de:

* Desarrollo de APIs REST
* Arquitectura backend
* Inyección de dependencias
* Separación de responsabilidades
* Modelado de dominio
* Gestión de estado
* Comunicación frontend-backend
* Serialización JSON
* Persistencia de datos
* Autenticación
* Testing
* Despliegue

A medida que avance el desarrollo, la aplicación evolucionará desde un prototipo sencillo hasta una aplicación web full-stack más completa.

## Sobre el proyecto

Este proyecto está siendo desarrollado como proyecto personal para aprender **Spring Boot y el desarrollo backend con Java**, partiendo de experiencia previa en desarrollo web con Python y Django.

El objetivo no es únicamente desarrollar un juego, sino utilizarlo como proyecto práctico para aprender y aplicar progresivamente las tecnologías y patrones utilizados en aplicaciones backend profesionales.

## Autor

Desarrollado por **David Juzgado Torell**.
