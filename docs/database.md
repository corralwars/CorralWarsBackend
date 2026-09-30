# Database

## Overview

CorralWars utiliza **MongoDB** como base de datos no relacional y **Mongoose** como ODM mediante NestJS.

La base de datos se utiliza principalmente para almacenar información persistente del jugador, definiciones reutilizables del juego y el progreso de las entidades que el jugador obtiene.

La arquitectura separa las **definiciones estáticas** de las **instancias pertenecientes a un jugador**.

```text
Godot
  │
  │ HTTP / JSON
  ▼
NestJS API
  │
  │ Mongoose
  ▼
MongoDB
```

---

# Collections

Las principales colecciones de la base de datos son:

```text
users
items
recipes
neighbors
worldobjects
worldobjectsinstances
combatentities
combatentityinstances
```

Las clases utilizadas dentro de estas colecciones pueden contener subdocumentos embebidos. Estos subdocumentos no representan colecciones independientes.

---

# Reusable subdocuments

El proyecto utiliza diferentes subdocumentos reutilizables:

```text
Position
Inventory
InventorySlot
Effect
Input
Output
CombatEntityStats
CombatEntityInstanceStats
SpecialAttackStats
```

Estos objetos representan datos que pertenecen a otro documento y no necesitan existir como documentos independientes.

Cuando corresponde, se utilizan esquemas con:

```ts
@Schema({ _id: false })
```

para evitar que MongoDB genere un `_id` independiente para cada subdocumento.

---

# Users

La colección `users` almacena la información persistente del jugador.

### Campos principales

| Campo              | Tipo      | Descripción                                 |
| ------------------ | --------- | ------------------------------------------- |
| `_id`              | ObjectId  | Identificador generado por MongoDB          |
| `username`         | String    | Nombre de usuario único                     |
| `password`         | String    | Contraseña almacenada mediante hash         |
| `refresh_token`    | String    | Refresh token almacenado para autenticación |
| `coins`            | Number    | Cantidad de monedas del jugador             |
| `position`         | Position  | Posición persistente del jugador            |
| `inventory`        | Inventory | Inventario del jugador                      |
| `defatedNeighbors` | String[]  | Identificadores de vecinos derrotados       |

Ejemplo conceptual:

```json
{
  "_id": "ObjectId(...)",
  "username": "player01",
  "password": "hashed_password",
  "refresh_token": "hashed_refresh_token",
  "coins": 500,
  "position": {
    "x": 120,
    "y": 250
  },
  "inventory": {
    "width": 7,
    "height": 5,
    "slots": []
  },
  "defatedNeighbors": []
}
```

> `defatedNeighbors` mantiene actualmente ese nombre en el código. La corrección ortográfica a `defeatedNeighbors` puede hacerse posteriormente si se decide cambiar el nombre del campo.

---

# Position

`Position` es un subdocumento reutilizable que representa una posición bidimensional.

```ts
@Schema({ _id: false })
export class Position {
  @Prop({ required: true, default: 0 })
  x!: number;

  @Prop({ required: true, default: 0 })
  y!: number;
}
```

Estructura:

```json
{
  "x": 120,
  "y": 250
}
```

No existe una colección `positions`.

La posición se almacena dentro del documento que la necesita.

Por ejemplo:

```text
User
 └── position

WorldObjectInstance
 └── position
```

Las posiciones fijas del mapa que no necesitan persistencia pueden mantenerse directamente en Godot.

---

# Inventory

El inventario es un subdocumento compuesto por dimensiones y una lista de slots.

```text
Inventory
├── width
├── height
└── slots[]
```

La configuración predeterminada es:

```text
width  = 7
height = 5
slots  = 35
```

Ejemplo:

```json
{
  "width": 7,
  "height": 5,
  "slots": [
    {
      "itemId": null,
      "quantity": 0
    }
  ]
}
```

El número de slots se obtiene mediante:

```text
width × height
```

Por ejemplo:

```text
7 × 5 = 35 slots
```

---

# InventorySlot

Cada slot representa una posición dentro del inventario.

```text
InventorySlot
├── itemId
└── quantity
```

Ejemplo:

```json
{
  "itemId": "item_id",
  "quantity": 5
}
```

Un slot vacío se representa mediante:

```json
{
  "itemId": null,
  "quantity": 0
}
```

`quantity` tiene un valor mínimo de `0`.

---

# Items

La colección `items` contiene las definiciones de los objetos disponibles en el juego.

Actualmente un `Item` contiene:

```text
Item
├── name
├── type
└── effects[]
```

Ejemplo:

```json
{
  "_id": "ObjectId(...)",
  "name": "Health Potion",
  "type": "consumable",
  "effects": [
    {
      "stat": "health",
      "operation": "add",
      "value": 100
    }
  ]
}
```

MongoDB genera automáticamente `_id`, por lo que no es necesario mantener un campo `key` adicional.

---

# Effect

`Effect` es un subdocumento común utilizado por diferentes sistemas del juego.

Actualmente se utiliza, entre otros lugares, en:

```text
Item
 └── effects[]

CombatEntity
 └── specialAttacks[]
      └── effects[]
```

Su estructura es:

```text
Effect
├── stat
├── operation
└── value
```

Ejemplo:

```json
{
  "stat": "health",
  "operation": "add",
  "value": 100
}
```

La existencia de `Effect` como subdocumento común evita tener que crear estructuras diferentes para cada sistema que modifica estadísticas.

---

# Recipes

La colección `recipes` almacena las recetas de fabricación.

Una receta contiene:

```text
Recipe
├── inputs[]
└── outPut
```

Los elementos `Input` y `Output` son subdocumentos.

---

## Input

Cada entrada indica qué objeto y cantidad son necesarios para fabricar una receta.

```text
Input
├── itemId
├── slot
└── quantity
```

Ejemplo:

```json
{
  "itemId": "wood_id",
  "slot": "material",
  "quantity": 5
}
```

---

## Output

Indica el objeto producido por la receta.

```text
Output
├── itemId
└── quantity
```

Ejemplo:

```json
{
  "itemId": "sword_id",
  "quantity": 1
}
```

---

# Neighbors

La colección `neighbors` representa a los vecinos disponibles dentro del juego.

Un vecino puede estar asociado a una entidad de combate mediante `combatEntityId`.

Estructura conceptual:

```text
Neighbor
├── name
├── level
├── combatEntityId
└── combatEntityAppearsAsPetInNeighborhood
```

Ejemplo:

```json
{
  "_id": "ObjectId(...)",
  "name": "Balthazar",
  "level": 5,
  "combatEntityId": "griffin_id",
  "combatEntityAppearsAsPetInNeighborhood": true
}
```

`combatEntityId` permite separar al vecino de la entidad de combate que utiliza.

Por ejemplo:

```text
Neighbor
   │
   └── combatEntityId
          │
          ▼
    CombatEntity
```

Esto permite que un vecino utilice una entidad de combate sin duplicar la definición de esa entidad.

---

# CombatEntities

La colección `combatentities` contiene las **definiciones base** de las entidades que pueden participar en combate.

Una `CombatEntity` puede representar diferentes tipos de entidades:

```text
CombatEntity
├── Pet
├── Neighbor
└── Boss
```

No es necesario crear una colección independiente para cada tipo.

La entidad puede utilizar un identificador lógico de escena mediante `sceneId`, permitiendo que Godot determine qué escena `.tscn` debe instanciar.

Ejemplo conceptual:

```json
{
  "_id": "ObjectId(...)",
  "name": "Griffin",
  "xpMultiplier": 1.5,
  "sceneId": "griffin",
  "baseStats": {
    "health": 1000,
    "attack": 10,
    "defense": 0,
    "velocity": 300,
    "stamina": 30,
    "specialChance": 0.2
  }
}
```

`sceneId` no necesita ser una ruta como:

```text
res://characters/griffin.tscn
```

Puede utilizarse un identificador lógico:

```text
griffin
```

y Godot puede encargarse de asociarlo con la escena correspondiente.

---

# CombatEntityStats

`CombatEntityStats` contiene las estadísticas **base** de una `CombatEntity`.

Actualmente contiene:

```text
CombatEntityStats
├── health
├── attack
├── defense
├── velocity
├── stamina
└── specialChance
```

Restricciones actuales:

| Estadística     | Mínimo |
| --------------- | -----: |
| `health`        |   1000 |
| `attack`        |     10 |
| `defense`       |      0 |
| `velocity`      |    300 |
| `stamina`       |     30 |
| `specialChance` |    0.2 |

Estas estadísticas pertenecen a la definición de la entidad y sirven como valores base.

No representan el estado temporal durante un combate.

Por ejemplo, el `health` actual durante una batalla no debería guardarse constantemente en MongoDB. Ese estado pertenece al tiempo de ejecución de Godot.

---

# SpecialAttackStats

`SpecialAttackStats` contiene multiplicadores asociados a los ataques especiales.

Actualmente contiene:

```text
SpecialAttackStats
├── velocityMultiply
└── attackMultiply
```

Esto permite que un ataque especial modifique determinados valores de la entidad durante su ejecución.

Ejemplo conceptual:

```json
{
  "velocityMultiply": 1.5,
  "attackMultiply": 2
}
```

Los ataques especiales también pueden utilizar `Effect[]` para modificar estadísticas.

Por esta razón `Effect` se mantiene como un subdocumento común.

---

# CombatEntityInstances

La colección `combatentityinstances` representa una **instancia concreta de una CombatEntity perteneciente a un jugador**.

Esta separación permite que varios jugadores tengan la misma `CombatEntity`, pero con progreso diferente.

```text
CombatEntity
       │
       │ combatEntityId
       ▼
CombatEntityInstance
       │
       └── userId
```

Por ejemplo:

```text
CombatEntity
└── Griffin

        │
        ├── Instance del jugador A
        │      level: 10
        │      attack: 50
        │
        └── Instance del jugador B
               level: 10
               attack: 30
```

---

# CombatEntityInstance fields

Una instancia contiene:

```text
CombatEntityInstance
├── userId
├── combatEntityId
├── combatEntityStats
├── statPoints
├── experience
└── level
```

Ejemplo:

```json
{
  "_id": "ObjectId(...)",
  "userId": "user_id",
  "combatEntityId": "griffin_id",
  "combatEntityStats": {
    "health": 1200,
    "attack": 25,
    "defense": 10,
    "velocity": 320,
    "stamina": 40
  },
  "statPoints": 4,
  "experience": 250,
  "level": 3
}
```

---

# CombatEntityInstanceStats

Estas estadísticas representan las estadísticas **personalizadas de una instancia**.

Actualmente contiene:

```text
CombatEntityInstanceStats
├── health
├── attack
├── defense
├── velocity
└── stamina
```

Todas tienen un mínimo de `0`.

La diferencia con `CombatEntityStats` es importante:

```text
CombatEntity
└── CombatEntityStats
      ↓
   valores base


CombatEntityInstance
└── CombatEntityInstanceStats
      ↓
   valores personalizados
```

Por ejemplo, dos instancias de un mismo Griffin pueden tener diferentes valores:

```text
CombatEntity
Griffin
base attack = 10

        │
        ├── Instance A
        │     attack = 25
        │
        └── Instance B
              attack = 40
```

---

# StatPoints

`statPoints` representa los puntos disponibles para distribuir entre las estadísticas de una instancia.

Estos puntos están asociados a la progresión individual del jugador.

Por ejemplo:

```text
Sube de nivel
      │
      ▼
+3 statPoints
      │
      ├── +2 attack
      └── +1 defense
```

Después de distribuirlos:

```text
statPoints = 0
```

De esta manera:

```text
level
   │
   ├── determina la progresión
   │
   └── puede otorgar statPoints
                │
                ▼
       CombatEntityInstanceStats
```

`statPoints` no pertenece a `CombatEntity`, porque no es una característica fija de la entidad. Es progreso específico de una instancia perteneciente a un jugador.

---

# Experience and Level

Cada `CombatEntityInstance` mantiene su propio progreso:

```text
experience
level
statPoints
```

Esto permite que una misma entidad tenga diferentes niveles dependiendo del jugador que la posea.

Ejemplo:

```text
Griffin
   │
   ├── Player A
   │      level: 10
   │      experience: 500
   │
   └── Player B
          level: 3
          experience: 120
```

El campo `xpMultiplier` de `CombatEntity` puede utilizarse para controlar cuánto cuesta hacer progresar diferentes entidades.

Una fórmula posible sería:

```gdscript
func get_xp_required(level: int, xp_multiplier: float) -> int:
    var base_xp := 100.0
    var exponent := 1.5

    return int(
        base_xp *
        xp_multiplier *
        pow(level, exponent)
    )
```

Esta fórmula representa una posible regla de gameplay y no implica que el cálculo tenga que ejecutarse dentro de MongoDB.

---

# WorldObjects

La colección `worldobjects` representa la definición de un objeto interactuable del mundo.

La definición contiene información reutilizable del objeto, mientras que los datos específicos de cada jugador pertenecen a `WorldObjectInstance`.

Conceptualmente:

```text
WorldObject
├── name / configuration
├── itemId
├── movible
└── recipeIds[]
```

Las recetas se relacionan mediante sus identificadores en lugar de duplicar las recetas completas dentro de cada objeto.

```text
WorldObject
   │
   ├── recipeIds
   │
   └── Recipe
```

Las posiciones fijas de objetos colocados directamente en el mapa pueden mantenerse en Godot cuando no necesitan persistencia.

---

# WorldObjectInstances

La colección `worldobjectsinstances` representa una instancia concreta de un objeto del mundo asociada a un jugador.

Puede contener información como:

```text
WorldObjectInstance
├── userId
├── worldObjectId
├── position
└── inventory
```

La separación permite distinguir entre:

```text
WorldObject
    ↓
Definición reutilizable

WorldObjectInstance
    ↓
Estado particular de un jugador
```

Por ejemplo, un cofre puede tener una definición común:

```text
WorldObject
└── Chest
```

pero cada jugador puede tener una instancia diferente:

```text
Chest
├── Player A
│     └── inventory: [items...]
│
└── Player B
      └── inventory: [items...]
```

---

# Definition vs Instance

Uno de los principios principales del diseño de la base de datos es separar **definiciones** de **instancias**.

## Definición

Contiene información que puede ser reutilizada.

Ejemplos:

```text
CombatEntity
Item
Recipe
WorldObject
Neighbor
```

## Instancia

Contiene información específica de un jugador o de su progreso.

Ejemplos:

```text
CombatEntityInstance
WorldObjectInstance
```

Esto evita duplicar información estática.

Por ejemplo:

```text
CombatEntity
└── Griffin
      │
      ├── baseStats
      ├── attacks
      └── sceneId
```

puede ser utilizado por múltiples:

```text
CombatEntityInstance
```

sin tener que copiar toda la definición.

---

# Combat flow

La relación entre un vecino y una entidad de combate funciona de la siguiente manera:

```text
Player
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
Instancia de la escena .tscn
```

Por ejemplo:

```text
Balthazar
   │
   └── combatEntityId
          │
          ▼
       Griffin
          │
          └── sceneId: "griffin"
                         │
                         ▼
                   Godot instancia
                   griffin.tscn
```

Esto permite que MongoDB almacene la definición y que Godot se encargue de la representación y ejecución del combate.

---

# Runtime data vs persistent data

No toda la información del juego necesita almacenarse en MongoDB.

## MongoDB

Se utiliza para información que debe persistir:

```text
Usuario
Inventario
Monedas
Progreso
Experiencia
Nivel
StatPoints
Estadísticas personalizadas
Entidades obtenidas
Objetos persistentes
Posiciones que necesiten persistencia
Definiciones de entidades
Definiciones de objetos
Recetas
Items
```

## Godot

Se encarga principalmente del estado temporal del juego:

```text
Posición temporal durante el combate
Velocidad actual
Animaciones
Cooldowns
Ataques en ejecución
Vida temporal durante una batalla
Movimiento
Colisiones
IA
Física
Efectos visuales
Estado temporal de las escenas
```

Por ejemplo, si una entidad tiene:

```text
health = 1200
```

ese valor puede ser una estadística persistente de la instancia.

Pero si durante un combate recibe daño y temporalmente queda en:

```text
health actual = 650
```

ese estado pertenece al runtime de Godot y no necesita actualizar MongoDB en cada frame.

---

# Identifiers and relationships

MongoDB genera `_id` para identificar los documentos.

No se utiliza un campo adicional `key` como identificador de los documentos.

Las relaciones se realizan mediante identificadores almacenados en los documentos.

Ejemplo:

```text
Neighbor
└── combatEntityId
        │
        ▼
CombatEntity._id
```

Otro ejemplo:

```text
CombatEntityInstance
├── userId
│     └── User._id
│
└── combatEntityId
      └── CombatEntity._id
```

Los campos de referencia utilizados actualmente se manejan como `string` en los schemas correspondientes.

---

# Database relationship overview

```text
                         ┌──────────────┐
                         │     User     │
                         └──────┬───────┘
                                │
             ┌──────────────────┼──────────────────┐
             │                  │                  │
             ▼                  ▼                  ▼
         Inventory          Position       CombatEntityInstance
                                                    │
                                    ┌───────────────┴──────────────┐
                                    │                              │
                                    ▼                              ▼
                              CombatEntity                     User
                                    │
                                    │
                                    ▼
                                  Scene


┌──────────────┐
│   Neighbor   │
└──────┬───────┘
       │
       │ combatEntityId
       ▼
┌──────────────┐
│ CombatEntity │
└──────────────┘


┌──────────────┐
│ WorldObject  │
└──────┬───────┘
       │
       │ recipeIds
       ▼
┌──────────────┐
│    Recipe    │
└──────────────┘


┌──────────────┐
│     Item     │
└──────┬───────┘
       │
       │ itemId
       ▼
 InventorySlot / Recipe Input / Recipe Output
```

---

# Summary

La estructura de la base de datos se organiza alrededor de ocho colecciones principales:

```text
users
items
recipes
neighbors
worldobjects
worldobjectsinstances
combatentities
combatentityinstances
```

El diseño utiliza subdocumentos para representar estructuras que no necesitan existir como documentos independientes:

```text
Position
Inventory
InventorySlot
Effect
Input
Output
CombatEntityStats
CombatEntityInstanceStats
SpecialAttackStats
```

La separación más importante del modelo es:

```text
Definición
    │
    ├── CombatEntity
    ├── Item
    ├── Recipe
    ├── Neighbor
    └── WorldObject

Instancia / progreso
    │
    ├── CombatEntityInstance
    └── WorldObjectInstance
```

# Diagrama general

```text
MongoDB
│
├── users
│   │
│   ├── username
│   ├── password
│   ├── refresh_token
│   ├── coins
│   ├── position
│   │   ├── x
│   │   └── y
│   │
│   ├── inventory
│   │   ├── width
│   │   ├── height
│   │   └── slots[]
│   │       ├── itemId
│   │       └── quantity
│   │
│   ├── defatedNeighbors[]
│   ├── activatedPetId
│   └── activatedSkin
│   └── defatedNeighbors[]
│
├── items
│   │
│   ├── name
│   ├── type
│   └── effects[]
│       ├── stat
│       ├── operation
│       └── value
│       └── Effect
│
├── recipes
│   │
│   ├── inputs[]
│   │   ├── itemId
│   │   ├── slot
@@ -555,191 +1112,221 @@ MongoDB
│       ├── itemId
│       └── quantity
│
├── neighboor
│   │
├── neighbors
│   ├── name
│   ├── level
│   ├── combatEntityId
│   ├── combatScene
│   └── combatEntityAppearsAsPetInNeighborhood
│
├── worldObjects
│   │
│   ├── itemId
│   ├── position
│   │   ├── x
│   │   └── y
│   ├── movible
│   └── recipes[]
│   └── combatEntityId
│
├── combatEntity
│   │
├── combatentities
│   ├── name
│   ├── stats
│   └── specialAttacks
│       │
│   ├── xpMultiplier
│   ├── sceneId
│   ├── baseStats
│   │   ├── health
│   │   ├── attack
│   │   ├── defense
│   │   ├── speed
│   │   ├── criticalChance
│   │   └── criticalDamage
│   │
│   └── specialAttacks[]
│       ├── name
│       ├── effects[]
│       │   ├── stat
│       │   ├── operation
│       │   └── value
│       └── specialAttackStats
│           ├── velocityMultiply
│           └── attackMultiply
│       ├── damage
│       ├── cooldown
│       ├── range
│       ├── scalingStat
│       ├── scalingValue
│       ├── unlockLevel
│       └── effects[]
│           └── Effect
│
├── combatEntity
│   │
├── combatentityinstances
│   ├── userId
│   ├── combatEntityId
│   └── combatEntityStats
│       ├── health
│       ├── attack
│       ├── defense
│       ├── velocity
│       └── stamina
│   ├── level
│   ├── experience
│   ├── statPoints
│   └── stats
│
└── worldObjectsInstances
    │
├── worldobjects
│   ├── itemId
│   ├── movible
│   └── recipes
│
└── worldobjectsinstances
    ├── userId
    ├── worldObjectId
    ├── position
    │   ├── x
    │   └── y
    │
    └── inventory
        ├── width
        ├── height
        └── slots[]
            ├── itemId
            └── quantity
```

Esto permite mantener separada la información reutilizable del juego de la información específica y persistente de cada jugador.
