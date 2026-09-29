# Base de datos

CorralWars utiliza **MongoDB** como sistema de almacenamiento y **Mongoose** como ODM para definir, validar y trabajar con la estructura de los documentos.

La base de datos combina:

- **Documentos principales**, almacenados como colecciones.
- **Subdocumentos embebidos**, utilizados cuando una estructura pertenece directamente a otra entidad.
- **Referencias mediante identificadores**, utilizadas cuando una entidad necesita relacionarse con otra colección.

La arquitectura busca separar las **definiciones estáticas del juego** de las **instancias y progresión específicas de cada usuario**.

---

# Colecciones

Las colecciones principales del proyecto son:

```text
users
items
recipes
worldobjects
worldobjectsinstances
neighbors
combatentities
combatentityinstances
```

La estructura puede ampliarse posteriormente con nuevas colecciones cuando aparezcan nuevos dominios del juego.

---

# Subdocumentos comunes

Algunas estructuras no necesitan existir como colecciones independientes porque forman parte de otros documentos.

Actualmente existen schemas reutilizables en `src/common/schemas/`:

```text
Position
Effect
```

Además existen subdocumentos específicos de determinados módulos:

```text
Inventory
InventorySlot

Input
Output

CombatStats
CombatAttack
```

Los subdocumentos que no representan entidades independientes se almacenan dentro del documento que los utiliza.

---

# Identificadores

Los documentos principales utilizan el `_id` generado automáticamente por MongoDB.

Ejemplo:

```json
{
  "_id": "ObjectId(...)",
  "name": "Madera"
}
```

Cuando otro documento necesita hacer referencia a esta entidad, puede almacenar su identificador:

```json
{
  "itemId": "ObjectId(...)"
}
```

Conceptualmente:

```text
InventorySlot.itemId
        │
        ▼
     Item._id
```

Los subdocumentos definidos mediante:

```ts
@Schema({ _id: false })
```

no reciben un `_id` independiente.

Esto se utiliza para estructuras que no necesitan identidad propia.

---

# Definiciones e instancias

Una de las reglas principales del diseño de la base de datos es separar una **definición reutilizable** de una **instancia concreta**.

Por ejemplo:

```text
CombatEntity
    │
    ├── definición estática
    │
    └── reutilizable por diferentes usuarios
```

Mientras:

```text
CombatEntityInstance
    │
    ├── usuario
    ├── nivel
    ├── experiencia
    └── progresión
```

Esto permite que varios jugadores utilicen la misma definición de una entidad de combate sin compartir su progreso.

El mismo principio se utiliza con:

```text
WorldObject
        │
        └── WorldObjectInstance
```

---

# Colección `users`

La colección `users` almacena las cuentas de los jugadores y la información persistente asociada a ellos.

Ejemplo conceptual:

```json
{
  "_id": "ObjectId(...)",
  "username": "Yair17",
  "password": "hash_de_la_contraseña",
  "refresh_token": "hash_del_refresh_token",
  "coins": 0,
  "position": {
    "x": 0,
    "y": 0
  },
  "inventory": {
    "width": 7,
    "height": 5,
    "slots": []
  },
  "defatedNeighbors": []
}
```

## Campos de `users`

| Campo              | Tipo        | Requerido | Descripción                                |
| ------------------ | ----------- | --------: | ------------------------------------------ |
| `_id`              | `ObjectId`  |        Sí | Identificador generado por MongoDB.        |
| `username`         | `String`    |        Sí | Nombre único del usuario.                  |
| `password`         | `String`    |        Sí | Hash de la contraseña.                     |
| `refresh_token`    | `String`    |        No | Hash del Refresh Token.                    |
| `coins`            | `Number`    |        Sí | Cantidad de monedas del jugador.           |
| `position`         | `Position`  |        Sí | Posición persistente del jugador.          |
| `inventory`        | `Inventory` |        Sí | Inventario del jugador.                    |
| `defatedNeighbors` | `String[]`  |        Sí | Identificadores de los vecinos derrotados. |

> El campo `defatedNeighbors` conserva actualmente ese nombre en el schema, aunque semánticamente representa los vecinos derrotados.

---

# Posición del jugador

La posición del jugador se almacena porque representa un dato que puede necesitar persistencia entre sesiones.

```json
{
  "position": {
    "x": 0,
    "y": 0
  }
}
```

La estructura utilizada es `Position`.

---

# Subdocumento `Position`

`Position` es un subdocumento reutilizable definido en:

```text
src/common/schemas/position.schema.ts
```

Representa una posición bidimensional.

Ejemplo:

```json
{
  "x": 120,
  "y": 250
}
```

## Campos

| Campo | Tipo     | Requerido | Predeterminado | Descripción            |
| ----- | -------- | --------: | -------------: | ---------------------- |
| `x`   | `Number` |        Sí |            `0` | Coordenada horizontal. |
| `y`   | `Number` |        Sí |            `0` | Coordenada vertical.   |

`Position` utiliza:

```ts
@Schema({ _id: false })
```

por lo que no posee un identificador independiente.

---

# Posiciones del mundo

No toda posición del juego necesita almacenarse en MongoDB.

Las posiciones que forman parte del **diseño fijo del mapa** pueden permanecer directamente en Godot.

Por ejemplo:

```text
Vecino A → posición definida en la escena de Godot
Vecino B → posición definida en la escena de Godot
Cofre → posición definida en la escena de Godot
```

MongoDB debe almacenar una posición cuando esta tenga que persistir como parte del estado del juego.

Por ejemplo, una posición del jugador o la posición de una instancia de `WorldObject` puede requerir persistencia.

Esto evita utilizar MongoDB para almacenar datos que forman parte exclusivamente del diseño estático del nivel.

---

# Subdocumento `Inventory`

`Inventory` representa el inventario de una entidad.

Actualmente se utiliza dentro de:

```text
User
WorldObjectInstance
```

El inventario utiliza una cuadrícula de:

```text
7 × 5
```

equivalente a:

```text
35 slots
```

Ejemplo:

```json
{
  "width": 7,
  "height": 5,
  "slots": []
}
```

## Campos

| Campo    | Tipo              | Requerido | Predeterminado | Descripción           |
| -------- | ----------------- | --------: | -------------: | --------------------- |
| `width`  | `Number`          |        Sí |            `7` | Número de columnas.   |
| `height` | `Number`          |        Sí |            `5` | Número de filas.      |
| `slots`  | `InventorySlot[]` |        Sí |           `[]` | Slots del inventario. |

---

# Subdocumento `InventorySlot`

Cada elemento del array `slots` representa un espacio individual del inventario.

Ejemplo:

```json
{
  "itemId": "ObjectId(...)",
  "quantity": 1
}
```

## Campos

| Campo      | Tipo             | Requerido | Predeterminado | Descripción                        |
| ---------- | ---------------- | --------: | -------------: | ---------------------------------- |
| `itemId`   | `String \| null` |        No |         `null` | Identificador del Item almacenado. |
| `quantity` | `Number`         |        Sí |            `0` | Cantidad del Item.                 |

`itemId` puede ser `null` cuando el slot está vacío.

`quantity` no puede ser negativa.

---

# Creación del inventario

El inventario se genera mediante:

```ts
createInventory(width, height);
```

La configuración actual es:

```text
width  = 7
height = 5
```

Por lo tanto:

```text
7 × 5 = 35 slots
```

Cada slot comienza con:

```json
{
  "itemId": null,
  "quantity": 0
}
```

El inventario se almacena como un subdocumento y no como una colección independiente.

---

# Colección `items`

La colección `items` contiene las definiciones de los objetos disponibles en el juego.

Un `Item` representa un objeto como concepto general.

Ejemplo:

```json
{
  "_id": "ObjectId(...)",
  "name": "Poción de vida",
  "type": "consumable",
  "effects": [
    {
      "stat": "health",
      "operation": "add",
      "value": 50
    }
  ]
}
```

## Campos

| Campo     | Tipo       | Requerido | Descripción                         |
| --------- | ---------- | --------: | ----------------------------------- |
| `_id`     | `ObjectId` |        Sí | Identificador generado por MongoDB. |
| `name`    | `String`   |        Sí | Nombre del objeto.                  |
| `type`    | `String`   |        Sí | Tipo de objeto.                     |
| `effects` | `Effect[]` |        No | Efectos producidos por el objeto.   |

Un Item puede no tener efectos:

```json
{
  "name": "Madera",
  "type": "material",
  "effects": []
}
```

---

# Subdocumento `Effect`

`Effect` es un subdocumento reutilizable definido en:

```text
src/common/schemas/effect.schema.ts
```

No pertenece exclusivamente al módulo `items`.

Puede utilizarse en diferentes dominios que necesiten representar modificaciones sobre estadísticas.

Actualmente puede utilizarse en:

```text
Item
CombatAttack / SpecialAttack
```

Esto permite mantener una única estructura para representar efectos.

Ejemplo:

```json
{
  "stat": "health",
  "operation": "add",
  "value": 50
}
```

## Campos

| Campo       | Tipo     | Descripción                       |
| ----------- | -------- | --------------------------------- |
| `stat`      | `String` | Estadística afectada.             |
| `operation` | `String` | Operación aplicada.               |
| `value`     | `Number` | Valor utilizado por la operación. |

`Effect` utiliza:

```ts
@Schema({ _id: false })
```

por lo que no posee un `_id` propio.

---

# Colección `recipes`

La colección `recipes` contiene las recetas de fabricación.

Una receta define:

```text
Items de entrada
        ↓
Proceso de fabricación
        ↓
Item de salida
```

Ejemplo:

```json
{
  "_id": "ObjectId(...)",
  "inputs": [
    {
      "itemId": "ObjectId(...)",
      "slot": "0",
      "quantity": 2
    }
  ],
  "outPut": {
    "itemId": "ObjectId(...)",
    "quantity": 1
  }
}
```

## Campos

| Campo    | Tipo       | Requerido | Descripción                 |
| -------- | ---------- | --------: | --------------------------- |
| `_id`    | `ObjectId` |        Sí | Identificador de la receta. |
| `inputs` | `Input[]`  |        Sí | Items necesarios.           |
| `outPut` | `Output`   |        Sí | Item producido.             |

---

# Subdocumento `Input`

`Input` representa un Item necesario para una receta.

Ejemplo:

```json
{
  "itemId": "ObjectId(...)",
  "slot": "0",
  "quantity": 2
}
```

## Campos

| Campo      | Tipo     | Requerido | Mínimo | Descripción                       |
| ---------- | -------- | --------: | -----: | --------------------------------- |
| `itemId`   | `String` |        Sí |      — | Identificador del Item requerido. |
| `slot`     | `String` |        Sí |      — | Slot utilizado por el Item.       |
| `quantity` | `Number` |        Sí |    `1` | Cantidad necesaria.               |

---

# Subdocumento `Output`

`Output` representa el resultado de una receta.

Ejemplo:

```json
{
  "itemId": "ObjectId(...)",
  "quantity": 1
}
```

## Campos

| Campo      | Tipo     | Requerido | Mínimo | Descripción                       |
| ---------- | -------- | --------: | -----: | --------------------------------- |
| `itemId`   | `String` |        Sí |      — | Identificador del Item producido. |
| `quantity` | `Number` |        Sí |    `1` | Cantidad producida.               |

---

# Colección `worldobjects`

`worldobjects` representa las definiciones de los objetos que pueden existir dentro del mundo.

Un `WorldObject` describe el tipo de objeto.

Ejemplos conceptuales:

```text
Forja
Cofre
Mesa de fabricación
Horno
```

Una definición no representa necesariamente una instancia concreta dentro de una partida.

Ejemplo conceptual:

```json
{
  "_id": "ObjectId(...)",
  "itemId": "ObjectId(...)",
  "movible": false,
  "recipes": []
}
```

La posición de una instancia concreta corresponde a `WorldObjectInstance` cuando necesita persistencia.

---

# Colección `worldobjectsinstances`

`worldobjectsinstances` representa una instancia concreta de un `WorldObject`.

Ejemplo:

```json
{
  "_id": "ObjectId(...)",
  "userId": "ObjectId(...)",
  "worldObjectId": "ObjectId(...)",
  "position": {
    "x": 500,
    "y": 300
  },
  "inventory": {
    "width": 7,
    "height": 5,
    "slots": []
  }
}
```

## Campos

| Campo           | Tipo        | Requerido | Descripción                           |
| --------------- | ----------- | --------: | ------------------------------------- |
| `_id`           | `ObjectId`  |        Sí | Identificador de la instancia.        |
| `userId`        | `String`    |        Sí | Usuario propietario.                  |
| `worldObjectId` | `String`    |        Sí | Definición utilizada.                 |
| `position`      | `Position`  |        Sí | Posición persistente de la instancia. |
| `inventory`     | `Inventory` |        Sí | Inventario asociado.                  |

Conceptualmente:

```text
WorldObject
    │
    ├── WorldObjectInstance → Usuario A
    ├── WorldObjectInstance → Usuario A
    └── WorldObjectInstance → Usuario B
```

---

# Colección `neighbors`

La colección `neighbors` contiene la definición de los vecinos del juego.

Un vecino puede estar relacionado con una `CombatEntity`.

Ejemplo conceptual:

```json
{
  "_id": "ObjectId(...)",
  "name": "Balthazar Flint",
  "level": 10,
  "combatEntityId": "ObjectId(...)"
}
```

## Campos principales

| Campo            | Tipo       | Descripción                                     |
| ---------------- | ---------- | ----------------------------------------------- |
| `_id`            | `ObjectId` | Identificador del vecino.                       |
| `name`           | `String`   | Nombre del vecino.                              |
| `level`          | `Number`   | Nivel al que aparece o se desbloquea el vecino. |
| `combatEntityId` | `String`   | Entidad de combate utilizada por el vecino.     |

La relación principal es:

```text
Neighbor
    │
    │ combatEntityId
    ▼
CombatEntity
```

---

# CombatEntity

La colección `combatentities` contiene las **definiciones estáticas de las entidades que pueden participar en combate**.

Una `CombatEntity` no significa necesariamente que sea una mascota.

Puede representar:

```text
Mascota
Vecino
Jefe
Otra entidad combatible
```

Esto permite evitar una colección independiente de `Pet` cuando la única finalidad de esta sería relacionar una mascota con una entidad de combate.

---

# Características de `CombatEntity`

Una `CombatEntity` contiene datos que definen su comportamiento y características generales.

Entre ellos:

```text
name
xpMultiplier
sceneId
baseStats
specialAttacks / attacks
```

Ejemplo conceptual:

```json
{
  "_id": "ObjectId(...)",
  "name": "Griffin",
  "xpMultiplier": 1.5,
  "sceneId": "griffin",
  "baseStats": {
    "health": 500,
    "attack": 80,
    "defense": 50,
    "speed": 100,
    "criticalChance": 10,
    "criticalDamage": 50
  },
  "attacks": []
}
```

---

# `sceneId`

`sceneId` identifica de manera lógica qué escena de Godot corresponde a la entidad.

Se recomienda almacenar un identificador estable:

```json
{
  "sceneId": "griffin"
}
```

en lugar de almacenar directamente:

```text
res://entities/combat/griffin.tscn
```

Godot puede mantener la relación:

```text
griffin
    ↓
res://entities/combat/griffin.tscn
```

Esto evita acoplar la base de datos a la estructura física de archivos del proyecto de Godot.

El flujo conceptual es:

```text
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
Escena correspondiente
```

---

# Estadísticas base

Las estadísticas base pertenecen a la definición de `CombatEntity`.

Representan las características iniciales de la entidad antes de aplicar la progresión específica del usuario.

Las estadísticas utilizadas actualmente son:

```text
health
attack
defense
speed
criticalChance
criticalDamage
```

Ejemplo:

```json
{
  "health": 500,
  "attack": 80,
  "defense": 50,
  "speed": 100,
  "criticalChance": 10,
  "criticalDamage": 50
}
```

Las estadísticas base no representan el estado actual durante una batalla.

El estado temporal del combate, como vida actual, animación, posición o cooldown, corresponde a la ejecución del juego en Godot.

---

# Ataques especiales

Los ataques especiales forman parte de la definición de una `CombatEntity`.

Un ataque puede contener información como:

```text
name
baseDamage
cooldown
range
scalingStat
scalingValue
unlockLevel
effects[]
```

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

Los ataques pueden utilizar estadísticas de la entidad para calcular su efecto final.

Por ejemplo:

```text
Daño =
baseDamage +
(attack × scalingValue)
```

El sistema puede aplicar posteriormente multiplicadores específicos de la entidad para ajustar el balance.

---

# Efectos de los ataques

Los ataques pueden utilizar el mismo `Effect` definido en `common`.

Por ejemplo:

```json
{
  "name": "Venom Bite",
  "effects": [
    {
      "stat": "speed",
      "operation": "multiply",
      "value": 0.7
    }
  ]
}
```

De esta forma:

```text
Item
 └── effects[]
       └── Effect

CombatAttack
 └── effects[]
       └── Effect
```

Ambos utilizan la misma estructura común.

---

# Colección `combatentityinstances`

`combatentityinstances` almacena la progresión de una `CombatEntity` para un usuario específico.

Mientras:

```text
CombatEntity
```

define la entidad, `CombatEntityInstance` representa la versión que pertenece al progreso de un usuario.

Ejemplo conceptual:

```json
{
  "_id": "ObjectId(...)",
  "userId": "ObjectId(...)",
  "combatEntityId": "ObjectId(...)",
  "level": 10,
  "experience": 1250,
  "statPoints": 15,
  "stats": {
    "health": 5,
    "attack": 7,
    "defense": 3,
    "speed": 0
  }
}
```

## Relaciones

```text
User
 │
 │ userId
 ▼
CombatEntityInstance
 │
 │ combatEntityId
 ▼
CombatEntity
```

Esto permite que:

```text
CombatEntity
    │
    ├── Instance → Usuario A
    ├── Instance → Usuario B
    └── Instance → Usuario C
```

Cada usuario puede tener una progresión diferente.

---

# Progresión de `CombatEntityInstance`

La instancia puede almacenar:

```text
level
experience
statPoints
stats
```

La idea es que los puntos asignados por el jugador modifiquen las estadísticas finales de la entidad.

La definición base permanece en:

```text
CombatEntity.baseStats
```

Mientras la progresión del usuario permanece en:

```text
CombatEntityInstance.stats
```

Conceptualmente:

```text
Estadísticas finales
        │
        ├── CombatEntity.baseStats
        │
        └── CombatEntityInstance.stats
```

Esto evita modificar la definición global cuando un jugador mejora su propia entidad.

---

# Experiencia

Las entidades pueden utilizar un multiplicador de experiencia:

```text
xpMultiplier
```

Este valor permite que diferentes entidades tengan diferentes dificultades de progresión.

La experiencia requerida para subir de nivel puede calcularse mediante una fórmula en lugar de almacenar una cantidad independiente para cada nivel.

Conceptualmente:

```text
XP requerida =
XP base × xpMultiplier × fórmula(nivel)
```

Por ejemplo:

```text
XP requerida =
100 × xpMultiplier × nivel^1.5
```

La fórmula concreta pertenece al sistema de progresión y puede ajustarse según el balance del juego.

No es necesario almacenar:

```text
xpRequiredLevel2
xpRequiredLevel3
xpRequiredLevel4
...
```

si estos valores pueden obtenerse mediante una fórmula.

---

# Relaciones principales

Las relaciones entre las colecciones pueden representarse de la siguiente manera:

```text
User
 │
 ├── inventory
 │
 ├── defatedNeighbors[]
 │
 └── CombatEntityInstance
          │
          └── combatEntityId
                    │
                    ▼
              CombatEntity
```

Los vecinos se relacionan con las entidades de combate:

```text
Neighbor
    │
    │ combatEntityId
    ▼
CombatEntity
```

Los inventarios pueden referenciar Items:

```text
InventorySlot.itemId
        │
        ▼
     Item._id
```

Las recetas pueden referenciar Items:

```text
Recipe.Input.itemId
        │
        ▼
     Item._id

Recipe.Output.itemId
        │
        ▼
     Item._id
```

Las instancias de objetos del mundo se relacionan con usuarios y definiciones:

```text
WorldObjectInstance
       │
       ├── userId
       │      ↓
       │    User
       │
       └── worldObjectId
              ↓
         WorldObject
```

---

# Diagrama general

```text
MongoDB
│
├── users
│   ├── username
│   ├── password
│   ├── refresh_token
│   ├── coins
│   ├── position
│   ├── inventory
│   └── defatedNeighbors[]
│
├── items
│   ├── name
│   ├── type
│   └── effects[]
│       └── Effect
│
├── recipes
│   ├── inputs[]
│   │   ├── itemId
│   │   ├── slot
│   │   └── quantity
│   │
│   └── outPut
│       ├── itemId
│       └── quantity
│
├── neighbors
│   ├── name
│   ├── level
│   └── combatEntityId
│
├── combatentities
│   ├── name
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
│       ├── damage
│       ├── cooldown
│       ├── range
│       ├── scalingStat
│       ├── scalingValue
│       ├── unlockLevel
│       └── effects[]
│           └── Effect
│
├── combatentityinstances
│   ├── userId
│   ├── combatEntityId
│   ├── level
│   ├── experience
│   ├── statPoints
│   └── stats
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
    └── inventory
```

---

# Documentos embebidos vs colecciones

La regla general utilizada es:

```text
¿Necesita existir por sí mismo?
        │
     ┌──┴──┐
    Sí     No
     │      │
     ▼      ▼
Colección  Subdocumento
```

## Colecciones

```text
users
items
recipes
neighbors
combatentities
combatentityinstances
worldobjects
worldobjectsinstances
```

## Subdocumentos comunes

```text
Position
Effect
```

## Subdocumentos específicos

```text
Inventory
InventorySlot
Input
Output
CombatStats
CombatAttack
```

Un subdocumento no necesita una colección independiente cuando su existencia depende directamente del documento que lo contiene.

Por ejemplo:

```text
Item
 └── Effect[]
```

o:

```text
CombatEntity
 └── specialAttacks[]
      └── Effect[]
```

---

# Responsabilidades de MongoDB y Godot

La base de datos almacena principalmente información que necesita persistencia.

Por ejemplo:

```text
MongoDB
├── cuentas
├── progreso
├── inventarios
├── entidades desbloqueadas
├── experiencia
├── niveles
├── estadísticas asignadas
└── estado persistente
```

Godot mantiene principalmente información relacionada con la ejecución del juego y el diseño del gameplay:

```text
Godot
├── movimiento
├── IA
├── animaciones
├── ataques durante el combate
├── cooldowns actuales
├── posiciones temporales
├── colisiones
└── comportamiento de las entidades
```

Esto evita utilizar MongoDB para almacenar datos que solamente existen mientras el juego está ejecutándose.

---

# Resumen

La arquitectura de datos de CorralWars busca separar tres conceptos:

```text
DEFINICIÓN
    │
    ▼
CombatEntity
WorldObject
Item
Recipe
Neighbor


INSTANCIA / PROGRESO
    │
    ▼
CombatEntityInstance
WorldObjectInstance
User


SUBDOCUMENTOS
    │
    ▼
Position
Inventory
InventorySlot
Effect
Input
Output
CombatStats
CombatAttack
```

El modelo permite reutilizar definiciones del juego mientras cada jugador mantiene su propio progreso.

En particular:

```text
Neighbor
    │
    │ combatEntityId
    ▼
CombatEntity
    │
    │
    ├── baseStats
    ├── specialAttacks
    └── sceneId
```

y:

```text
User
    │
    ▼
CombatEntityInstance
    │
    ├── level
    ├── experience
    ├── statPoints
    └── stats
```

De esta forma, la misma `CombatEntity` puede ser utilizada por diferentes usuarios sin compartir su progresión.
