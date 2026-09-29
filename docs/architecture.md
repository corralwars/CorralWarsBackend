# Arquitectura

CorralWars utiliza una arquitectura cliente-servidor:

```text
┌─────────────┐
│    Godot    │
│   Cliente   │
└──────┬──────┘
       │
       │ HTTP / JSON
       ▼
┌─────────────┐
│   NestJS    │
│     API     │
└──────┬──────┘
       │
       │ Mongoose
       ▼
┌─────────────┐
│   MongoDB   │
│  Base datos │
└─────────────┘
```

## Tecnologías

- NestJS
- TypeScript
- MongoDB
- Mongoose
- JWT
- bcrypt
- Swagger / OpenAPI
- class-validator

---

# Estructura de módulos

El proyecto está organizado mediante módulos independientes:

```text
src/
├── auth/
├── user/
├── inventory/
├── items/
├── recipes/
├── world-objects/
├── common/
├── app.controller.ts
├── app.module.ts
├── app.service.ts
└── main.ts
```

Cada módulo contiene las responsabilidades relacionadas con su dominio.

---

# AuthModule

Se encarga de la autenticación de los usuarios.

Responsabilidades:

- Registro de usuarios.
- Inicio de sesión.
- Generación de Access Tokens.
- Generación de Refresh Tokens.
- Validación de Refresh Tokens.
- Cierre de sesión.

El módulo utiliza `UserService` para acceder a los datos de los usuarios.

```text
AuthController
      │
      ▼
 AuthService
      │
      ▼
 UserService
      │
      ▼
   MongoDB
```

---

# UserModule

Se encarga de la gestión de los usuarios y de sus datos almacenados en MongoDB.

Responsabilidades actuales:

- Buscar usuarios.
- Crear usuarios.
- Actualizar Refresh Tokens.
- Eliminar/invalidar Refresh Tokens.
- Gestionar los datos del jugador.

```text
UserController
      │
      ▼
 UserService
      │
      ▼
 UserModel
      │
      ▼
   MongoDB
```

---

# InventoryModule

Se encarga de la gestión de los inventarios del juego.

El inventario utiliza una estructura basada en slots.

Responsabilidades:

- Crear inventarios.
- Consultar inventarios.
- Agregar objetos.
- Retirar objetos.
- Modificar cantidades.
- Gestionar los slots disponibles.

El inventario puede pertenecer al jugador o a una instancia de un objeto del mundo.

---

# ItemsModule

Se encarga de definir los objetos disponibles dentro del juego.

Un `Item` representa la definición de un objeto, no una instancia concreta dentro del mundo.

Ejemplos:

```text
Madera
Poción de vida
Espada
Cofre
Forja
```

Un Item puede contener propiedades específicas como efectos.

```text
Item
├── key
├── name
├── type
└── effects[]
```

Los Items representan contenido reutilizable del juego.

---

# RecipesModule

Se encarga de definir las recetas de fabricación.

Una receta especifica:

- Los objetos necesarios.
- El slot en el que deben colocarse.
- La cantidad requerida.
- El objeto producido.
- La cantidad producida.

Conceptualmente:

```text
Recipe
├── inputs[]
│   ├── itemId
│   ├── slot
│   └── quantity
│
└── output
    ├── itemId
    └── quantity
```

Las recetas son independientes de los objetos del mundo y pueden ser utilizadas por diferentes `WorldObjects`.

---

# WorldObjectsModule

Se encarga de los objetos que existen dentro del mundo del juego.

Se divide conceptualmente en:

```text
WorldObject
WorldObjectInstance
```

## WorldObject

Define qué características tiene un tipo de objeto del mundo.

Por ejemplo:

```text
Forge
├── itemId
├── recipeIds
└── ...
```

## WorldObjectInstance

Representa una instancia concreta de un `WorldObject` dentro de la partida de un usuario.

Puede contener:

```text
WorldObjectInstance
├── worldObjectId
├── userId
├── position
└── inventory
```

Esto permite que una misma definición de objeto tenga diferentes instancias para diferentes usuarios.

```text
WorldObject
    │
    ├── Instance → Usuario A
    │
    ├── Instance → Usuario B
    │
    └── Instance → Usuario C
```

---

# Common

Contiene elementos reutilizables por diferentes módulos que no pertenecen exclusivamente a un dominio.

Por ejemplo:

```text
common/
└── schemas/
    └── position.schema.ts
```

`Position` representa una posición bidimensional:

```json
{
  "x": 0,
  "y": 0
}
```

Se utiliza como subdocumento dentro de otros schemas.

---

# Responsabilidad de las capas

La aplicación mantiene separadas las responsabilidades entre controllers, services y modelos.

```text
┌──────────────┐
│  Controller  │
│              │
│ HTTP / JSON  │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   Service    │
│              │
│   Lógica     │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   Mongoose   │
│    Model     │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   MongoDB    │
└──────────────┘
```

## Controller

Se encarga de:

- Recibir solicitudes HTTP.
- Obtener parámetros y body.
- Ejecutar el servicio correspondiente.
- Devolver la respuesta.

## Service

Se encarga de:

- Ejecutar la lógica de la aplicación.
- Validar información relacionada con el proceso.
- Coordinar operaciones entre diferentes componentes.
- Trabajar con los modelos mediante Mongoose.

## Model / Schema

Define la estructura de los documentos almacenados en MongoDB.

---

# Dependencias entre módulos

Los módulos se comunican mediante sus servicios.

Por ejemplo:

```text
AuthService
     │
     ▼
UserService
     │
     ▼
UserModel
     │
     ▼
MongoDB
```

Los módulos de dominio pueden utilizar los servicios de otros módulos cuando necesitan información perteneciente a otro dominio.

---

# AppModule

`AppModule` es el módulo raíz de la aplicación.

Se encarga de cargar los módulos principales de la API.

```text
AppModule
├── ConfigModule
├── MongooseModule
├── AuthModule
├── UserModule
├── InventoryModule
├── ItemsModule
├── RecipesModule
└── WorldObjectsModule
```

---

# Comunicación con Godot

La API está diseñada para que el cliente del videojuego se comunique mediante HTTP.

```text
Godot
   │
   │ HTTP / JSON
   ▼
NestJS
   │
   │ Mongoose
   ▼
MongoDB
```

El cliente de Godot actúa como consumidor de la API, mientras que NestJS contiene la lógica y persistencia del juego.
