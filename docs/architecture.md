# Arquitectura

CorralWars utiliza una arquitectura **cliente-servidor** en la que Godot actúa como cliente del videojuego, NestJS como API y MongoDB como sistema de persistencia.

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

---

# Tecnologías

El backend utiliza actualmente:

- NestJS
- TypeScript
- MongoDB
- Mongoose
- JWT
- bcrypt
- Swagger / OpenAPI
- class-validator

---

# Principios arquitectónicos

El proyecto busca separar las responsabilidades de acuerdo con el dominio al que pertenecen.

Los módulos de NestJS representan dominios del videojuego:

```text
Auth
User
Inventory
Items
Recipes
WorldObjects
Neighbors
CombatEntities
Common
```

Cada módulo puede contener sus propios:

```text
Controller
Service
Schemas
DTOs
```

Los schemas reutilizables que no pertenecen exclusivamente a un dominio se encuentran en:

```text
common/
```

---

# Estructura del proyecto

La estructura actual es:

```text
src/
│
├── auth/
│   ├── auth.controller.ts
│   ├── auth.module.ts
│   ├── auth.service.ts
│   ├── dto/
│   └── guards/
│
├── combat-entities/
│   ├── combat-entities.controller.ts
│   ├── combat-entities.module.ts
│   ├── combat-entities.service.ts
│   └── schemas/
│       ├── combatEntity.schema.ts
│       ├── combatEntityInstance.schema.ts
│       └── stat.schema.ts
│
├── common/
│   └── schemas/
│       ├── effect.schema.ts
│       └── position.schema.ts
│
├── inventory/
│   ├── inventory.module.ts
│   ├── inventory.service.ts
│   └── schemas/
│       └── inventory.schema.ts
│
├── items/
│   ├── items.controller.ts
│   ├── items.module.ts
│   ├── items.service.ts
│   └── schemas/
│       └── items.schema.ts
│
├── neighbors/
│   ├── neighbors.controller.ts
│   ├── neighbors.module.ts
│   ├── neighbors.service.ts
│   └── schemas/
│       └── neighboor.schema.ts
│
├── recipes/
│   ├── recipes.module.ts
│   ├── recipes.service.ts
│   └── schemas/
│       └── recipe.schema.ts
│
├── user/
│   ├── dto/
│   ├── schemas/
│   │   └── user.schema.ts
│   ├── user.controller.ts
│   ├── user.module.ts
│   └── user.service.ts
│
├── world-objects/
│   ├── schemas/
│   │   ├── worldObjects.schema.ts
│   │   └── worldObjectsInstances.schema.ts
│   ├── world-objects.controller.ts
│   ├── world-objects.module.ts
│   └── world-objects.service.ts
│
├── app.controller.ts
├── app.module.ts
├── app.service.ts
└── main.ts
```

---

# AppModule

`AppModule` es el módulo raíz de NestJS.

Su responsabilidad es registrar los módulos principales de la aplicación y configurar los componentes globales.

Conceptualmente:

```text
AppModule
│
├── ConfigModule
├── MongooseModule
│
├── AuthModule
├── UserModule
├── InventoryModule
├── ItemsModule
├── RecipesModule
├── WorldObjectsModule
├── NeighborsModule
└── CombatEntitiesModule
```

---

# AuthModule

`AuthModule` contiene la lógica relacionada con la autenticación.

Actualmente se encarga de:

- Registro.
- Login.
- Logout.
- Generación de Access Tokens.
- Generación de Refresh Tokens.
- Validación de tokens.
- Invalidación del Refresh Token.

La relación principal es:

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
 UserModel
      │
      ▼
 MongoDB
```

El módulo también contiene el guard utilizado para proteger rutas mediante Access Tokens:

```text
auth/guards/access_token_auth.guard.ts
```

---

# UserModule

`UserModule` administra la información persistente de los jugadores.

Responsabilidades:

- Crear usuarios.
- Buscar usuarios.
- Actualizar información de usuarios.
- Gestionar Refresh Tokens.
- Acceder al modelo `User`.

Flujo:

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

El usuario también contiene información persistente relacionada con el progreso general del jugador, como monedas, inventario, posición y vecinos derrotados.

---

# InventoryModule

`InventoryModule` administra la lógica relacionada con los inventarios.

El inventario utiliza una estructura de slots:

```text
Inventory
├── width
├── height
└── slots[]
    ├── itemId
    └── quantity
```

El mismo schema puede ser utilizado por diferentes entidades que necesiten un inventario.

Actualmente se utiliza principalmente en:

```text
User
WorldObjectInstance
```

El módulo contiene:

```text
inventory.module.ts
inventory.service.ts
schemas/inventory.schema.ts
```

---

# ItemsModule

`ItemsModule` administra la definición de los objetos del juego.

Un `Item` representa el objeto como concepto general y puede ser utilizado desde diferentes sistemas.

Ejemplos:

```text
Madera
Poción
Herramienta
Material
Objeto consumible
```

La estructura conceptual es:

```text
Item
├── name
├── type
└── effects[]
```

Los efectos utilizan el schema común:

```text
common/schemas/effect.schema.ts
```

Esto permite reutilizar el concepto de efecto en otros módulos.

---

# RecipesModule

`RecipesModule` administra las recetas de fabricación.

Una receta define los Items necesarios y el resultado obtenido.

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

Las recetas utilizan referencias hacia `Item` mediante sus identificadores.

---

# WorldObjectsModule

`WorldObjectsModule` administra los objetos interactivos o persistentes del mundo.

Se separan dos conceptos:

```text
WorldObject
WorldObjectInstance
```

## WorldObject

Representa la definición de un tipo de objeto.

Por ejemplo:

```text
Forja
Cofre
Horno
Mesa de fabricación
```

La definición contiene las características generales que son comunes a todas sus instancias.

---

## WorldObjectInstance

Representa una instancia concreta asociada a un usuario.

```text
WorldObjectInstance
├── userId
├── worldObjectId
├── position
└── inventory
```

La relación es:

```text
WorldObject
    │
    ├── Instance → Usuario A
    ├── Instance → Usuario B
    └── Instance → Usuario C
```

Esto permite reutilizar una definición sin mezclar los datos específicos de cada usuario.

---

# NeighborsModule

`NeighborsModule` administra la información relacionada con los vecinos del juego.

Un vecino puede estar asociado a una `CombatEntity`.

```text
Neighbor
├── name
├── level
└── combatEntityId
```

La relación principal es:

```text
Neighbor
     │
     │ combatEntityId
     ▼
CombatEntity
```

Esto permite que un vecino utilice una entidad de combate sin que sea necesario crear una colección independiente de mascotas.

Un vecino puede representar diferentes situaciones dentro del juego:

```text
Vecino con mascota
Vecino combatible
Jefe
Otro personaje relacionado con combate
```

La lógica concreta del combate pertenece al sistema de entidades de combate y a Godot.

---

# CombatEntitiesModule

`CombatEntitiesModule` administra las definiciones e instancias de las entidades que pueden participar en combate.

La arquitectura separa:

```text
CombatEntity
CombatEntityInstance
```

---

# CombatEntity

`CombatEntity` representa una **definición estática** de una entidad combatible.

Una entidad puede representar:

```text
Mascota
Vecino
Jefe
Otra entidad combatible
```

Por lo tanto, `CombatEntity` no equivale directamente a `Pet`.

Una definición puede contener:

```text
CombatEntity
├── name
├── xpMultiplier
├── sceneId
├── baseStats
└── specialAttacks[]
```

---

# CombatEntityInstance

`CombatEntityInstance` representa la versión de una `CombatEntity` asociada al progreso de un usuario.

```text
CombatEntityInstance
├── userId
├── combatEntityId
├── level
├── experience
├── statPoints
└── stats
```

La relación es:

```text
User
 │
 ▼
CombatEntityInstance
 │
 │ combatEntityId
 ▼
CombatEntity
```

Esto permite que diferentes usuarios tengan diferentes progresiones para la misma entidad.

Por ejemplo:

```text
CombatEntity: Griffin

Usuario A
└── Griffin Instance
    ├── level: 10
    └── stats: ...

Usuario B
└── Griffin Instance
    ├── level: 5
    └── stats: ...
```

La definición global permanece igual.

---

# Estadísticas de combate

Las estadísticas base pertenecen a `CombatEntity`.

Actualmente se contemplan:

```text
health
attack
defense
speed
criticalChance
criticalDamage
```

La definición establece los valores base:

```text
CombatEntity
└── baseStats
```

Mientras la instancia del usuario almacena la progresión:

```text
CombatEntityInstance
└── stats
```

Conceptualmente:

```text
Estadísticas finales
        │
        ├── Valores base
        │       ↓
        │   CombatEntity
        │
        └── Progresión
                ↓
        CombatEntityInstance
```

---

# Special Attacks

Las entidades de combate pueden tener ataques especiales.

Conceptualmente:

```text
CombatEntity
└── specialAttacks[]
    ├── name
    ├── damage
    ├── cooldown
    ├── range
    ├── scalingStat
    ├── scalingValue
    ├── unlockLevel
    └── effects[]
```

Los ataques pueden escalar con una estadística de la entidad.

Por ejemplo:

```text
Daño =
baseDamage +
(attack × scalingValue)
```

También pueden existir multiplicadores específicos que permitan modificar cómo una entidad utiliza determinado ataque.

Los ataques pueden contener efectos:

```text
SpecialAttack
└── effects[]
        └── Effect
```

---

# Effect

`Effect` se encuentra en:

```text
src/common/schemas/effect.schema.ts
```

porque no pertenece exclusivamente a un módulo.

Puede utilizarse tanto en:

```text
Item
```

como en:

```text
CombatAttack
```

Conceptualmente:

```text
Item
 └── Effect[]

CombatEntity
 └── SpecialAttack[]
       └── Effect[]
```

Esto evita duplicar schemas que representan el mismo concepto.

---

# Common

`Common` contiene estructuras reutilizables por diferentes dominios.

Actualmente:

```text
common/
└── schemas/
    ├── effect.schema.ts
    └── position.schema.ts
```

## Position

Representa una posición bidimensional:

```json
{
  "x": 0,
  "y": 0
}
```

## Effect

Representa una modificación sobre una estadística:

```json
{
  "stat": "health",
  "operation": "add",
  "value": 50
}
```

Estos elementos son subdocumentos y no colecciones independientes.

---

# Separación entre MongoDB y Godot

No toda la información del juego debe almacenarse en MongoDB.

La regla general es:

```text
¿Necesita persistir entre sesiones?
          │
       ┌──┴──┐
      Sí     No
       │      │
       ▼      ▼
   MongoDB   Godot
```

MongoDB almacena principalmente:

```text
Cuentas
Progreso
Inventarios
Experiencia
Niveles
Estadísticas asignadas
Entidades desbloqueadas
Estado persistente
```

Godot administra principalmente:

```text
Movimiento
IA
Animaciones
Colisiones
Cooldowns durante el combate
Estado temporal del combate
Posiciones fijas del diseño
Comportamiento de NPCs
```

Por ejemplo, si un vecino siempre aparece en una posición determinada del mapa, esa posición puede formar parte directamente de la escena de Godot.

No es necesario consultar MongoDB para conocerla.

---

# Carga de una CombatEntity en Godot

El flujo entre backend y cliente puede utilizar un identificador lógico de escena.

Por ejemplo:

```text
CombatEntity
└── sceneId = "griffin"
```

Godot mantiene la correspondencia:

```text
"griffin"
    ↓
res://entities/combat/griffin.tscn
```

El flujo completo es:

```text
Godot
  │
  │ solicita información del vecino
  ▼
NestJS
  │
  ▼
Neighbor
  │
  │ combatEntityId
  ▼
CombatEntity
  │
  │ sceneId
  ▼
Godot
  │
  ▼
Carga de la escena
```

Esto mantiene desacoplada la base de datos de la estructura interna de archivos de Godot.

---

# Responsabilidad de las capas

La aplicación separa:

```text
Controller
    ↓
Service
    ↓
Mongoose Model
    ↓
MongoDB
```

---

# Controller

Los controllers son responsables de la comunicación HTTP.

Sus funciones principales son:

- Recibir solicitudes.
- Obtener parámetros.
- Obtener datos del body.
- Ejecutar el servicio correspondiente.
- Devolver respuestas HTTP.

El controller no debería contener la lógica principal del dominio.

Ejemplo:

```text
HTTP Request
     │
     ▼
Controller
     │
     ▼
Service
```

---

# Service

Los services contienen la lógica de aplicación.

Sus responsabilidades incluyen:

- Procesar operaciones.
- Validar condiciones de negocio.
- Coordinar diferentes servicios.
- Trabajar con los modelos de Mongoose.

Ejemplo:

```text
Controller
     │
     ▼
Service
     │
     ├── UserService
     ├── InventoryService
     └── CombatEntitiesService
```

---

# Schema / Model

Los schemas de Mongoose definen la estructura de los documentos almacenados en MongoDB.

Por ejemplo:

```text
combat-entities/schemas/
├── combatEntity.schema.ts
├── combatEntityInstance.schema.ts
└── stat.schema.ts
```

El schema define:

- Campos.
- Tipos.
- Valores predeterminados.
- Restricciones.
- Subdocumentos.

Mongoose utiliza estos schemas para construir los modelos utilizados por los services.

---

# Comunicación entre módulos

Los módulos pueden comunicarse mediante sus services cuando necesitan información de otro dominio.

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

Otro ejemplo:

```text
NeighborsService
     │
     ▼
CombatEntitiesService
     │
     ▼
CombatEntityModel
```

La comunicación entre módulos permite mantener separadas las responsabilidades sin duplicar lógica.

---

# Flujo general de una solicitud

Una solicitud normal sigue:

```text
Godot
   │
   │ HTTP / JSON
   ▼
Controller
   │
   ▼
Service
   │
   ▼
Mongoose Model
   │
   ▼
MongoDB
   │
   ▼
Service
   │
   ▼
Controller
   │
   ▼
Godot
```

---

# Flujo de autenticación

```text
Godot
   │
   │ POST /auth/login
   ▼
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
   │
   ▼
AuthService
   │
   ├── Access Token
   └── Refresh Token
```

---

# Flujo conceptual de combate

La información persistente y la ejecución del combate tienen responsabilidades diferentes.

```text
Godot
   │
   │ Solicita información
   ▼
NestJS
   │
   ▼
Neighbor
   │
   │ combatEntityId
   ▼
CombatEntity
   │
   ├── baseStats
   ├── specialAttacks
   └── sceneId
   │
   ▼
Godot
   │
   ├── instancia escena
   ├── ejecuta IA
   ├── ejecuta ataques
   ├── controla animaciones
   └── controla estado temporal
```

Si el jugador posee una instancia de esa entidad:

```text
User
   │
   ▼
CombatEntityInstance
   │
   ├── level
   ├── experience
   └── stats
   │
   ▼
Godot
```

De esta forma, MongoDB proporciona la definición y progresión necesaria, mientras Godot ejecuta el combate.

---

# Estructura de alto nivel

```text
CorralWars
│
├── Godot
│   ├── Gameplay
│   ├── IA
│   ├── Combate
│   ├── Animaciones
│   └── Escenas
│
└── NestJS
    │
    ├── Auth
    ├── User
    ├── Inventory
    ├── Items
    ├── Recipes
    ├── WorldObjects
    ├── Neighbors
    ├── CombatEntities
    └── Common
          │
          ▼
       MongoDB
```

La arquitectura permite agregar nuevos dominios sin mezclar sus responsabilidades con otros módulos.
