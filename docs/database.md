# Base de datos

## Descripción general

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

# Colecciones

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

Estas colecciones representan los documentos principales de la base de datos.

Los elementos que funcionan como subdocumentos no poseen una colección independiente.

---

# Subdocumentos reutilizables

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

# Usuarios

La colección `users` almacena la información persistente del jugador.

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

> `defatedNeighbors` mantiene actualmente ese nombre en el código.

---

# Posición

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

# Inventario

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

Por lo tanto:

```text
7 × 5 = 35 slots
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

---

# InventarioSlot

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

# Objetos

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

# Efecto

`Effect` es un subdocumento común utilizado por diferentes sistemas del juego.

Actualmente puede utilizarse en:

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

Esto permite reutilizar el mismo modelo de efecto en diferentes dominios.

---

# Recetas

La colección `recipes` almacena las recetas de fabricación. El schema proporcionado establece que tanto `inputs` como `outPut` son obligatorios.

Una receta contiene:

```text
Recipe
├── inputs[]
└── outPut
```

Los elementos `Input` y `Output` son subdocumentos y utilizan `@Schema({ _id: false })`, por lo que no necesitan un identificador propio.

## Entrada

Cada `Input` indica qué objeto, en qué espacio lógico y en qué cantidad se necesita para fabricar una receta. Los tres campos son obligatorios y `quantity` tiene un mínimo de `1`.

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

## Salida

`Output` indica el objeto producido por la receta. Sus dos campos son obligatorios y `quantity` tiene un mínimo de `1`.

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

# Vecinos

La colección `neighbors` representa a los vecinos disponibles dentro del juego. La clase utilizada actualmente en el código se denomina `Neighboor`.

Un vecino se asocia con una entidad de combate mediante `combatEntityId` y además conserva el identificador de la escena de combate mediante `combatScene`.

Estructura:

```text
Neighboor
├── name
├── level
├── combatEntityId
├── combatScene
└── combatEntityAppearsAsPetInNeighborhood
```

Ejemplo:

```json
{
  "_id": "ObjectId(...)",
  "name": "Balthazar",
  "level": 5,
  "combatEntityId": "griffin_id",
  "combatScene": "griffin",
  "combatEntityAppearsAsPetInNeighborhood": true
}
```

La relación principal es:

```text
Neighboor
      │
      │ combatEntityId
      ▼
CombatEntity
```

Esto permite que el vecino utilice una entidad de combate sin duplicar su definición.

---

# Entidades de combate

La colección `combatentities` contiene las definiciones base de las entidades que pueden participar en combate.

Una `CombatEntity` puede representar:

```text
Mascota
Vecino
Jefe
Otra entidad combatible
```

No existe una colección independiente para cada uno de estos tipos.

La entidad contiene información reutilizable y estática.

```text
CombatEntity
├── name
├── xpMultiplier
├── sceneId
├── stats
└── specialAttacks[]
```

---

# Estadísticas de la entidad de combate

`CombatEntityStats` contiene las estadísticas base de una `CombatEntity`.

```text
CombatEntityStats
├── health
├── attack
├── defense
├── velocity
├── stamina
└── specialChance
```

Ejemplo:

```json
{
  "health": 1000,
  "attack": 10,
  "defense": 0,
  "velocity": 300,
  "stamina": 30,
  "specialChance": 0.2
}
```

Estas estadísticas representan los valores base de la entidad.

---

# Estadísticas del ataque especial

`SpecialAttackStats` contiene valores utilizados para modificar las características de un ataque especial.

Actualmente contiene:

```text
SpecialAttackStats
├── velocityMultiply
└── attackMultiply
```

Ejemplo:

```json
{
  "velocityMultiply": 1.5,
  "attackMultiply": 2
}
```

Los ataques especiales pueden utilizar además:

```text
effects[]
```

que utilizan el subdocumento común `Effect`.

---

# Instancias de entidades de combate

La colección `combatentityinstances` representa una instancia concreta de una `CombatEntity` perteneciente a un jugador.

```text
CombatEntityInstance
├── userId
├── combatEntityId
├── combatEntityStats
├── statPoints
├── experience
└── level
```

La separación permite que diferentes usuarios posean la misma entidad con diferente progreso.

Ejemplo:

```text
CombatEntity
└── Griffin
      │
      ├── Instancia del jugador A
      │      ├── level: 10
      │      └── attack: 50
      │
      └── Instancia del jugador B
             ├── level: 3
             └── attack: 30
```

---

# Estadísticas de la instancia de entidad de combate

`CombatEntityInstanceStats` contiene las estadísticas personalizadas de una instancia.

```text
CombatEntityInstanceStats
├── health
├── attack
├── defense
├── velocity
└── stamina
```

Todas las estadísticas tienen un mínimo de `0`.

La diferencia entre ambos esquemas es:

```text
CombatEntity
└── CombatEntityStats
      ↓
   Valores base


CombatEntityInstance
└── CombatEntityInstanceStats
      ↓
   Valores personalizados
```

Esto permite modificar una instancia sin modificar la definición global de la entidad.

---

# Puntos de estadísticas

`statPoints` representa los puntos de estadísticas disponibles para una instancia.

Estos puntos pertenecen a `CombatEntityInstance`, porque forman parte del progreso individual de la entidad.

Ejemplo:

```text
Nivel 4
   │
   │ subida de nivel
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

De esta manera, cada instancia puede desarrollar estadísticas diferentes aunque utilice la misma definición de `CombatEntity`.

---

# Experiencia y nivel

Cada instancia mantiene:

```text
experience
level
statPoints
```

Esto permite una progresión independiente.

Por ejemplo:

```text
Griffin
   │
   ├── Jugador A
   │      level: 10
   │      experience: 500
   │
   └── Jugador B
          level: 3
          experience: 120
```

La definición `CombatEntity` contiene `xpMultiplier`, que puede utilizarse para controlar la dificultad de progresión de cada entidad.

Conceptualmente:

```text
XP requerida =
XP base × xpMultiplier × fórmula(nivel)
```

Una fórmula posible:

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

La fórmula anterior representa una regla de jugabilidad y no implica que deba ejecutarse dentro de MongoDB.

---

# Entidad de combate y escena de Godot

Cada `CombatEntity` puede tener un identificador lógico:

```text
sceneId
```

Ejemplo:

```json
{
  "sceneId": "griffin"
}
```

Godot puede encargarse de asociar ese identificador con una escena concreta:

```text
griffin
   │
   ▼
res://entities/combat/griffin.tscn
```

De esta manera la base de datos no depende de las rutas internas del proyecto de Godot.

---

# Flujo de combate

El flujo entre un jugador, un vecino y su entidad de combate es:

```text
Jugador
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
Escena .tscn
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
   ├── statPoints
   └── combatEntityStats
          │
          ▼
        Godot
```

---

# Objetos del mundo

La colección `worldobjects` representa objetos del mundo que pueden tener una posición, ser movibles, estar asociados a un `Item` y contener recetas. La estructura se basa directamente en el schema proporcionado.

La estructura actual es:

```text
WorldObjects
├── itemId
├── position
├── movible
└── recipes[]
```

Donde `recipes[]` contiene objetos `Recipe` completos, no identificadores de recetas.

Las posiciones que necesiten persistencia se almacenan en `position`.

---

# Instancias de objetos del mundo

La colección `worldobjectsinstances` representa una instancia concreta de un objeto del mundo asociada a un jugador.

Conceptualmente:

```text
WorldObjectInstance
├── userId
├── worldObjectId
├── position
└── inventory
```

La separación permite:

```text
WorldObject
    ↓
Definición reutilizable

WorldObjectInstance
    ↓
Estado específico
```

Por ejemplo:

```text
WorldObject
└── Chest
      │
      ├── Jugador A
      │     └── inventory
      │
      └── Jugador B
            └── inventory
```

---

# Definición e instancia

Uno de los principios principales del diseño es separar las definiciones de las instancias.

## Definiciones

Contienen información reutilizable:

```text
CombatEntity
Item
Recipe
Neighbor
WorldObject
```

## Instancias

Contienen información específica de un usuario:

```text
CombatEntityInstance
WorldObjectInstance
```

Esto evita duplicar información estática.

---

# Responsabilidades de la base de datos

MongoDB almacena información que necesita persistencia:

```text
Usuarios
Inventarios
Monedas
Progreso
Experiencia
Niveles
StatPoints
CombatEntityInstanceStats
Entidades obtenidas por los jugadores
Instancias persistentes de `WorldObject`
Recetas
Objetos
Definiciones de `CombatEntity`
Definiciones de `WorldObject`
Vecinos
```

Godot administra principalmente información temporal:

```text
Movimiento
IA
Animaciones
Colisiones
Física
Tiempos de reutilización
Ataques activos
Vida temporal durante el combate
Efectos visuales
Posiciones fijas del mapa
```

Por ejemplo:

```text
CombatEntityInstance
└── health = 1200
```

puede representar una estadística persistente.

Mientras que:

```text
health actual durante el combate = 650
```

puede mantenerse únicamente en Godot mientras la batalla está activa.

---

# Identificadores

MongoDB utiliza `_id` como identificador de los documentos.

No se utiliza un campo adicional `key`.

Las relaciones se realizan mediante identificadores:

```text
Neighbor
└── combatEntityId
       │
       ▼
CombatEntity._id
```

```text
CombatEntityInstance
├── userId
│     └── User._id
│
└── combatEntityId
      └── CombatEntity._id
```

```text
WorldObjectInstance
├── userId
│     └── User._id
│
└── worldObjectId
      └── WorldObject._id
```

Los campos de referencia utilizados actualmente se manejan como `string` en los schemas correspondientes.

---

# Diccionarios de datos

Los siguientes diccionarios documentan la estructura de las colecciones y subdocumentos a partir de los schemas proporcionados para el proyecto.

### Criterio utilizado

- Si un campo tiene `required: true`, se documenta como **Sí**.
- Si un campo no tiene `required: true`, se considera **No (opcional)**, tal como establece el criterio actual del proyecto.
- El **valor por defecto** solo se indica cuando aparece explícitamente en el schema o cuando corresponde a un valor generado automáticamente por Mongoose/MongoDB.
- Las **restricciones** se mantienen separadas de los valores por defecto. Por ejemplo, `min: 1` no es un valor por defecto.
- Los nombres de campos, colecciones y clases se mantienen exactamente como aparecen en el código, aunque la explicación esté completamente en español.
- Cuando un schema no fue proporcionado en esta actualización, no se inventan reglas de obligatoriedad o valores por defecto que no estén respaldados por el documento existente.

## Diccionario de datos: `users`

| Campo              | Tipo      | Requerido                     | Valor por defecto             | Restricciones               | Descripción                                                                      |
| ------------------ | --------- | ----------------------------- | ----------------------------- | --------------------------- | -------------------------------------------------------------------------------- |
| `_id`              | ObjectId  | No (generado automáticamente) | Generado por Mongoose/MongoDB | Identificador del documento | Identificador único del usuario.                                                 |
| `username`         | String    | Sí                            | No definido                   | Único; mínimo 5 caracteres  | Nombre utilizado para identificar al jugador.                                    |
| `password`         | String    | Sí                            | No definido                   | —                           | Contraseña almacenada mediante hash.                                             |
| `refresh_token`    | String    | No (opcional)                 | No definido                   | —                           | Hash del token de actualización almacenado para la autenticación.                |
| `coins`            | Number    | Sí                            | `0`                           | Mínimo `0`                  | Cantidad de monedas del jugador.                                                 |
| `position`         | Position  | Sí                            | No definido                   | —                           | Posición persistente del jugador.                                                |
| `inventory`        | Inventory | Sí                            | No definido                   | —                           | Inventario persistente del jugador.                                              |
| `defatedNeighbors` | String[]  | No (opcional)                 | `[]`                          | —                           | Identificadores de los vecinos derrotados. Mantiene el nombre actual del código. |
| `activatedPetId`   | String    | No (opcional)                 | No definido                   | —                           | Identificador de la mascota activada.                                            |
| `activatedSkin`    | String    | Sí                            | `defaultSkin`                 | —                           | Identificador de la skin activada.                                               |
| `createdAt`        | Date      | No (generado automáticamente) | Generado por `timestamps`     | —                           | Fecha de creación del documento.                                                 |
| `updatedAt`        | Date      | No (generado automáticamente) | Generado por `timestamps`     | —                           | Fecha de última actualización del documento.                                     |

### Ejemplo de documento `users`

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
  "defatedNeighbors": [],
  "activatedPetId": "pet_id",
  "activatedSkin": "defaultSkin",
  "createdAt": "2026-10-06T00:00:00.000Z",
  "updatedAt": "2026-10-06T00:00:00.000Z"
}
```

> En el schema, `refresh_token` y `activatedPetId` son opcionales porque no tienen `required: true`. `activatedSkin`, en cambio, es requerido y tiene `default: 'defaultSkin'`.

---

## Diccionario de datos: `items`

La colección `items` contiene las definiciones reutilizables de los objetos del juego. En esta actualización no se proporcionó su schema, por lo que se conservan únicamente las propiedades documentadas anteriormente.

| Campo     | Tipo     | Requerido                     | Valor por defecto             | Restricciones               | Descripción                           |
| --------- | -------- | ----------------------------- | ----------------------------- | --------------------------- | ------------------------------------- |
| `_id`     | ObjectId | No (generado automáticamente) | Generado por Mongoose/MongoDB | Identificador del documento | Identificador único del objeto.       |
| `name`    | String   | No (opcional)                 | No definido                   | —                           | Nombre del objeto.                    |
| `type`    | String   | No (opcional)                 | No definido                   | —                           | Tipo o categoría del objeto.          |
| `effects` | Effect[] | No (opcional)                 | No definido                   | —                           | Efectos que puede producir el objeto. |

### Ejemplo de documento `items`

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

---

## Diccionario de datos: `recipes`

La colección `recipes` almacena las recetas de fabricación.

| Campo    | Tipo     | Requerido                     | Valor por defecto             | Restricciones               | Descripción                                                                         |
| -------- | -------- | ----------------------------- | ----------------------------- | --------------------------- | ----------------------------------------------------------------------------------- |
| `_id`    | ObjectId | No (generado automáticamente) | Generado por Mongoose/MongoDB | Identificador del documento | Identificador único de la receta.                                                   |
| `inputs` | Input[]  | Sí                            | No definido                   | —                           | Lista de materiales necesarios para fabricar la receta.                             |
| `outPut` | Output   | Sí                            | No definido                   | —                           | Resultado producido por la receta. Se conserva la capitalización actual del código. |

### Ejemplo de documento `recipes`

```json
{
  "_id": "ObjectId(...)",
  "inputs": [
    {
      "itemId": "wood_id",
      "slot": "material",
      "quantity": 5
    }
  ],
  "outPut": {
    "itemId": "sword_id",
    "quantity": 1
  }
}
```

---

## Diccionario de datos: `neighbors`

La colección `neighbors` contiene las definiciones de los vecinos del juego.

| Campo                                    | Tipo     | Requerido                     | Valor por defecto             | Restricciones               | Descripción                                                                 |
| ---------------------------------------- | -------- | ----------------------------- | ----------------------------- | --------------------------- | --------------------------------------------------------------------------- |
| `_id`                                    | ObjectId | No (generado automáticamente) | Generado por Mongoose/MongoDB | Identificador del documento | Identificador único del vecino.                                             |
| `name`                                   | String   | Sí                            | No definido                   | —                           | Nombre del vecino.                                                          |
| `level`                                  | Number   | Sí                            | No definido                   | Índice `unique`             | Nivel asociado al vecino.                                                   |
| `combatEntityId`                         | String   | Sí                            | No definido                   | —                           | Identificador de la entidad de combate asociada.                            |
| `combatScene`                            | String   | Sí                            | No definido                   | —                           | Identificador de la escena de combate asociada al vecino.                   |
| `combatEntityAppearsAsPetInNeighborhood` | Boolean  | Sí                            | No definido                   | —                           | Indica si la entidad de combate aparece como mascota dentro del vecindario. |

### Ejemplo de documento `neighbors`

```json
{
  "_id": "ObjectId(...)",
  "name": "Balthazar",
  "level": 5,
  "combatEntityId": "griffin_id",
  "combatScene": "griffin",
  "combatEntityAppearsAsPetInNeighborhood": true
}
```

---

## Diccionario de datos: `worldobjects`

La colección `worldobjects` contiene definiciones de objetos del mundo. El schema proporcionado es la fuente de verdad para esta estructura.

| Campo      | Tipo     | Requerido                     | Valor por defecto             | Restricciones               | Descripción                                              |
| ---------- | -------- | ----------------------------- | ----------------------------- | --------------------------- | -------------------------------------------------------- |
| `_id`      | ObjectId | No (generado automáticamente) | Generado por Mongoose/MongoDB | Identificador del documento | Identificador único del objeto del mundo.                |
| `itemId`   | String   | No (opcional)                 | No definido                   | —                           | Identificador del objeto `Item` asociado, cuando existe. |
| `position` | Position | Sí                            | No definido                   | —                           | Posición del objeto del mundo.                           |
| `movible`  | Boolean  | Sí                            | No definido                   | —                           | Indica si el objeto puede desplazarse.                   |
| `recipes`  | Recipe[] | Sí                            | No definido                   | —                           | Recetas embebidas disponibles para el objeto del mundo.  |

### Ejemplo de documento `worldobjects`

```json
{
  "_id": "ObjectId(...)",
  "itemId": "chest_item_id",
  "position": {
    "x": 300,
    "y": 150
  },
  "movible": false,
  "recipes": [
    {
      "inputs": [
        {
          "itemId": "wood_id",
          "slot": "material",
          "quantity": 5
        }
      ],
      "outPut": {
        "itemId": "sword_id",
        "quantity": 1
      }
    }
  ]
}
```

> El schema actual no contiene `name` ni `recipeIds`. `recipes` es un arreglo de `Recipe` embebidos mediante `RecipeSchema`.

---

## Diccionario de datos: `worldobjectsinstances`

La colección `worldobjectsinstances` representa una instancia concreta de un objeto del mundo asociada a un usuario.

| Campo           | Tipo      | Requerido                     | Valor por defecto             | Restricciones               | Descripción                                            |
| --------------- | --------- | ----------------------------- | ----------------------------- | --------------------------- | ------------------------------------------------------ |
| `_id`           | ObjectId  | No (generado automáticamente) | Generado por Mongoose/MongoDB | Identificador del documento | Identificador único de la instancia.                   |
| `userId`        | String    | Sí                            | No definido                   | —                           | Identificador del usuario propietario de la instancia. |
| `worldObjectId` | String    | Sí                            | No definido                   | —                           | Identificador de la definición de `WorldObjects`.      |
| `position`      | Position  | Sí                            | No definido                   | —                           | Posición persistente de la instancia.                  |
| `inventory`     | Inventory | Sí                            | No definido                   | —                           | Inventario persistente asociado al objeto.             |

### Ejemplo de documento `worldobjectsinstances`

```json
{
  "_id": "ObjectId(...)",
  "userId": "user_id",
  "worldObjectId": "chest_id",
  "position": {
    "x": 500,
    "y": 200
  },
  "inventory": {
    "width": 7,
    "height": 5,
    "slots": [
      {
        "itemId": "wood_id",
        "quantity": 10
      }
    ]
  }
}
```

---

## Diccionario de datos: `combatentities`

La colección `combatentities` contiene las definiciones base de las entidades que participan en combate. Su schema no fue incluido en los schemas proporcionados en esta actualización, por lo que se conservan las propiedades ya documentadas.

| Campo            | Tipo              | Requerido                     | Valor por defecto             | Restricciones               | Descripción                                                                  |
| ---------------- | ----------------- | ----------------------------- | ----------------------------- | --------------------------- | ---------------------------------------------------------------------------- |
| `_id`            | ObjectId          | No (generado automáticamente) | Generado por Mongoose/MongoDB | Identificador del documento | Identificador de la entidad.                                                 |
| `name`           | String            | No (opcional)                 | No definido                   | —                           | Nombre de la entidad.                                                        |
| `xpMultiplier`   | Number            | No (opcional)                 | No definido                   | —                           | Multiplicador utilizado por la progresión de experiencia.                    |
| `sceneId`        | String            | No (opcional)                 | No definido                   | —                           | Identificador lógico que permite asociar la entidad con una escena de Godot. |
| `stats`          | CombatEntityStats | No (opcional)                 | No definido                   | —                           | Estadísticas base de la entidad.                                             |
| `specialAttacks` | SpecialAttack[]   | No (opcional)                 | No definido                   | —                           | Ataques especiales disponibles para la entidad.                              |

### Ejemplo de documento `combatentities`

```json
{
  "_id": "ObjectId(...)",
  "name": "Griffin",
  "xpMultiplier": 1.2,
  "sceneId": "griffin",
  "stats": {
    "health": 1000,
    "attack": 10,
    "defense": 0,
    "velocity": 300,
    "stamina": 30,
    "specialChance": 0.2
  },
  "specialAttacks": []
}
```

---

## Diccionario de datos: `combatentityinstances`

La colección `combatentityinstances` representa el progreso individual de una entidad de combate perteneciente a un jugador. Su schema no fue incluido en los schemas proporcionados en esta actualización.

| Campo               | Tipo                      | Requerido                     | Valor por defecto             | Restricciones               | Descripción                                    |
| ------------------- | ------------------------- | ----------------------------- | ----------------------------- | --------------------------- | ---------------------------------------------- |
| `_id`               | ObjectId                  | No (generado automáticamente) | Generado por Mongoose/MongoDB | Identificador del documento | Identificador de la instancia.                 |
| `userId`            | String                    | No (opcional)                 | No definido                   | —                           | Identificador del usuario propietario.         |
| `combatEntityId`    | String                    | No (opcional)                 | No definido                   | —                           | Identificador de la definición base utilizada. |
| `combatEntityStats` | CombatEntityInstanceStats | No (opcional)                 | No definido                   | —                           | Estadísticas personalizadas de la instancia.   |
| `statPoints`        | Number                    | No (opcional)                 | No definido                   | —                           | Puntos disponibles para distribuir.            |
| `experience`        | Number                    | No (opcional)                 | No definido                   | —                           | Experiencia acumulada.                         |
| `level`             | Number                    | No (opcional)                 | No definido                   | —                           | Nivel actual.                                  |
| `createdAt`         | Date                      | No (generado automáticamente) | Generado por `timestamps`     | —                           | Fecha de creación de la instancia.             |
| `updatedAt`         | Date                      | No (generado automáticamente) | Generado por `timestamps`     | —                           | Fecha de última actualización.                 |

### Ejemplo de documento `combatentityinstances`

```json
{
  "_id": "ObjectId(...)",
  "userId": "user_id",
  "combatEntityId": "griffin_id",
  "combatEntityStats": {
    "health": 1200,
    "attack": 50,
    "defense": 20,
    "velocity": 320,
    "stamina": 40
  },
  "statPoints": 3,
  "experience": 500,
  "level": 10
}
```

---

# Diccionarios de datos: subdocumentos reutilizables

> Los schemas de `Position`, `Inventory` e `InventorySlot` no fueron incluidos en el bloque de código proporcionado en esta actualización. Por ello, se conservan aquí únicamente las reglas que ya estaban documentadas y no se presentan como reglas nuevas del código compartido.

## Diccionario de datos: `Position`

| Campo | Tipo   | Requerido     | Valor por defecto | Restricciones | Descripción                                                                        |
| ----- | ------ | ------------- | ----------------- | ------------- | ---------------------------------------------------------------------------------- |
| `x`   | Number | No (opcional) | `0`               | —             | Coordenada horizontal de la posición, según la estructura documentada previamente. |
| `y`   | Number | No (opcional) | `0`               | —             | Coordenada vertical de la posición, según la estructura documentada previamente.   |

### Ejemplo

```json
{
  "x": 120,
  "y": 250
}
```

---

## Diccionario de datos: `Inventory`

| Campo    | Tipo            | Requerido     | Valor por defecto     | Restricciones | Descripción                                                                       |
| -------- | --------------- | ------------- | --------------------- | ------------- | --------------------------------------------------------------------------------- |
| `width`  | Number          | No (opcional) | `7`                   | —             | Cantidad de columnas del inventario, según la estructura documentada previamente. |
| `height` | Number          | No (opcional) | `5`                   | —             | Cantidad de filas del inventario, según la estructura documentada previamente.    |
| `slots`  | InventorySlot[] | No (opcional) | 35 slots para `7 × 5` | —             | Espacios que contienen los objetos del inventario.                                |

### Ejemplo

```json
{
  "width": 7,
  "height": 5,
  "slots": [
    {
      "itemId": "wood_id",
      "quantity": 5
    }
  ]
}
```

---

## Diccionario de datos: `InventorySlot`

| Campo      | Tipo          | Requerido     | Valor por defecto | Restricciones | Descripción                                                                                          |
| ---------- | ------------- | ------------- | ----------------- | ------------- | ---------------------------------------------------------------------------------------------------- |
| `itemId`   | String / null | No (opcional) | `null`            | —             | Identificador del objeto almacenado; `null` representa un espacio vacío según el diseño documentado. |
| `quantity` | Number        | No (opcional) | `0`               | Mínimo `0`    | Cantidad almacenada en el espacio.                                                                   |

### Ejemplo de espacio vacío

```json
{
  "itemId": null,
  "quantity": 0
}
```

---

## Diccionario de datos: `Effect`

| Campo       | Tipo   | Requerido     | Valor por defecto | Restricciones | Descripción                                   |
| ----------- | ------ | ------------- | ----------------- | ------------- | --------------------------------------------- |
| `stat`      | String | No (opcional) | No definido       | —             | Estadística sobre la que se aplica el efecto. |
| `operation` | String | No (opcional) | No definido       | —             | Operación aplicada sobre la estadística.      |
| `value`     | Number | No (opcional) | No definido       | —             | Valor utilizado por la operación.             |

### Ejemplo

```json
{
  "stat": "health",
  "operation": "add",
  "value": 100
}
```

---

## Diccionario de datos: `Input`

El schema proporcionado declara los tres campos como obligatorios.

| Campo      | Tipo   | Requerido | Valor por defecto | Restricciones | Descripción                                                   |
| ---------- | ------ | --------- | ----------------- | ------------- | ------------------------------------------------------------- |
| `itemId`   | String | Sí        | No definido       | —             | Identificador del objeto requerido por la receta.             |
| `slot`     | String | Sí        | No definido       | —             | Categoría o posición lógica del material dentro de la receta. |
| `quantity` | Number | Sí        | No definido       | Mínimo `1`    | Cantidad requerida del objeto.                                |

### Ejemplo

```json
{
  "itemId": "wood_id",
  "slot": "material",
  "quantity": 5
}
```

---

## Diccionario de datos: `Output`

El schema proporcionado declara los dos campos como obligatorios.

| Campo      | Tipo   | Requerido | Valor por defecto | Restricciones | Descripción                                       |
| ---------- | ------ | --------- | ----------------- | ------------- | ------------------------------------------------- |
| `itemId`   | String | Sí        | No definido       | —             | Identificador del objeto producido por la receta. |
| `quantity` | Number | Sí        | No definido       | Mínimo `1`    | Cantidad producida.                               |

### Ejemplo

```json
{
  "itemId": "sword_id",
  "quantity": 1
}
```

---

## Diccionario de datos: `CombatEntityStats`

| Campo           | Tipo   | Requerido     | Valor por defecto | Restricciones | Descripción                               |
| --------------- | ------ | ------------- | ----------------- | ------------- | ----------------------------------------- |
| `health`        | Number | No (opcional) | No definido       | Mínimo `1000` | Vida base de la entidad.                  |
| `attack`        | Number | No (opcional) | No definido       | Mínimo `10`   | Ataque base de la entidad.                |
| `defense`       | Number | No (opcional) | No definido       | Mínimo `0`    | Defensa base de la entidad.               |
| `velocity`      | Number | No (opcional) | No definido       | Mínimo `300`  | Velocidad base de la entidad.             |
| `stamina`       | Number | No (opcional) | No definido       | Mínimo `30`   | Resistencia base de la entidad.           |
| `specialChance` | Number | No (opcional) | No definido       | Mínimo `0.2`  | Probabilidad asociada al ataque especial. |

### Ejemplo

```json
{
  "health": 1000,
  "attack": 10,
  "defense": 0,
  "velocity": 300,
  "stamina": 30,
  "specialChance": 0.2
}
```

---

## Diccionario de datos: `CombatEntityInstanceStats`

| Campo      | Tipo   | Requerido     | Valor por defecto | Restricciones | Descripción                                |
| ---------- | ------ | ------------- | ----------------- | ------------- | ------------------------------------------ |
| `health`   | Number | No (opcional) | No definido       | Mínimo `0`    | Vida personalizada de la instancia.        |
| `attack`   | Number | No (opcional) | No definido       | Mínimo `0`    | Ataque personalizado de la instancia.      |
| `defense`  | Number | No (opcional) | No definido       | Mínimo `0`    | Defensa personalizada de la instancia.     |
| `velocity` | Number | No (opcional) | No definido       | Mínimo `0`    | Velocidad personalizada de la instancia.   |
| `stamina`  | Number | No (opcional) | No definido       | Mínimo `0`    | Resistencia personalizada de la instancia. |

### Ejemplo

```json
{
  "health": 1200,
  "attack": 50,
  "defense": 20,
  "velocity": 320,
  "stamina": 40
}
```

---

## Diccionario de datos: `SpecialAttackStats`

| Campo              | Tipo   | Requerido     | Valor por defecto | Restricciones | Descripción                                                       |
| ------------------ | ------ | ------------- | ----------------- | ------------- | ----------------------------------------------------------------- |
| `velocityMultiply` | Number | No (opcional) | No definido       | —             | Multiplicador aplicado a la velocidad durante el ataque especial. |
| `attackMultiply`   | Number | No (opcional) | No definido       | —             | Multiplicador aplicado al ataque durante el ataque especial.      |

### Ejemplo

```json
{
  "velocityMultiply": 1.5,
  "attackMultiply": 2
}
```

---

## Diccionario de datos: `SpecialAttack`

`SpecialAttack` es un subdocumento utilizado dentro de `CombatEntity.specialAttacks[]`.

| Campo                | Tipo               | Requerido     | Valor por defecto | Restricciones | Descripción                                       |
| -------------------- | ------------------ | ------------- | ----------------- | ------------- | ------------------------------------------------- |
| `name`               | String             | No (opcional) | No definido       | —             | Nombre del ataque especial.                       |
| `effects`            | Effect[]           | No (opcional) | No definido       | —             | Efectos producidos por el ataque.                 |
| `specialAttackStats` | SpecialAttackStats | No (opcional) | No definido       | —             | Multiplicadores y valores específicos del ataque. |

### Ejemplo

```json
{
  "name": "Claw Attack",
  "effects": [
    {
      "stat": "health",
      "operation": "subtract",
      "value": 100
    }
  ],
  "specialAttackStats": {
    "velocityMultiply": 1.5,
    "attackMultiply": 2
  }
}
```

---

# Resumen de colecciones y documentos

| Colección / documento       | Tipo         | Función principal                             |
| --------------------------- | ------------ | --------------------------------------------- |
| `users`                     | Colección    | Persistencia del jugador.                     |
| `items`                     | Colección    | Definiciones de objetos.                      |
| `recipes`                   | Colección    | Definiciones de fabricación.                  |
| `neighbors`                 | Colección    | Definiciones de vecinos.                      |
| `worldobjects`              | Colección    | Definiciones de objetos del mundo.            |
| `worldobjectsinstances`     | Colección    | Estado de objetos del mundo por usuario.      |
| `combatentities`            | Colección    | Definiciones base de entidades de combate.    |
| `combatentityinstances`     | Colección    | Progreso de entidades de combate por usuario. |
| `Position`                  | Subdocumento | Coordenadas `x`, `y`.                         |
| `Inventory`                 | Subdocumento | Estructura del inventario.                    |
| `InventorySlot`             | Subdocumento | Contenido de un espacio del inventario.       |
| `Effect`                    | Subdocumento | Modificador reutilizable de estadísticas.     |
| `Input`                     | Subdocumento | Material requerido por una receta.            |
| `Output`                    | Subdocumento | Resultado de una receta.                      |
| `CombatEntityStats`         | Subdocumento | Estadísticas base de combate.                 |
| `CombatEntityInstanceStats` | Subdocumento | Estadísticas personalizadas de una instancia. |
| `SpecialAttackStats`        | Subdocumento | Multiplicadores de ataques especiales.        |
| `SpecialAttack`             | Subdocumento | Definición de un ataque especial.             |

---

# Reglas de interpretación del diccionario

1. Si un campo tiene `required: true`, se considera **requerido**.
2. Si un campo no tiene `required: true`, se considera **opcional**.
3. Un valor escrito en `default` se documenta exclusivamente en la columna **Valor por defecto**.
4. Restricciones como `min`, `unique` o `minLength` se documentan exclusivamente en la columna **Restricciones**.
5. `_id`, `createdAt` y `updatedAt` pueden ser generados automáticamente por Mongoose cuando corresponda; no se confunden con campos declarados explícitamente mediante `@Prop`.
6. Los subdocumentos no poseen necesariamente una colección independiente.
7. `Input.quantity` y `Output.quantity` tienen mínimo `1`.
8. `users.coins` tiene mínimo `0` y valor por defecto `0`.
9. `users.username` es único y tiene mínimo `5` caracteres.
10. `neighbors.level` está marcado como `unique` en el schema proporcionado.
11. `users.activatedSkin` es requerido y tiene valor por defecto `defaultSkin`.
12. `worldobjects.itemId` es opcional porque no tiene `required: true`.
13. `worldobjects.position`, `worldobjects.movible` y `worldobjects.recipes` son requeridos porque el schema los marca explícitamente como tales.
14. `worldobjectsinstances.userId`, `worldObjectId`, `position` e `inventory` son requeridos.
15. `recipes.inputs` y `recipes.outPut` son requeridos.

---

# Estructura general de la base de datos

```text
MongoDB
├── users
│   ├── username
│   ├── password
│   ├── refresh_token
│   ├── coins
│   ├── position
│   │   ├── x
│   │   └── y
│   ├── inventory
│   │   ├── width
│   │   ├── height
│   │   └── slots[]
│   │       ├── itemId
│   │       └── quantity
│   ├── defatedNeighbors[]
│   ├── activatedPetId
│   └── activatedSkin
│
├── items
│   ├── name
│   ├── type
│   └── effects[]
│       ├── stat
│       ├── operation
│       └── value
│
├── recipes
│   ├── inputs[]
│   │   ├── itemId
│   │   ├── slot
│   │   └── quantity
│   └── outPut
│       ├── itemId
│       └── quantity
│
├── neighbors
│   ├── name
│   ├── level
│   ├── combatEntityId
│   ├── combatScene
│   └── combatEntityAppearsAsPetInNeighborhood
│
├── worldobjects
│   ├── itemId
│   ├── position
│   │   ├── x
│   │   └── y
│   ├── movible
│   └── recipes[]
│       ├── inputs[]
│       │   ├── itemId
│       │   ├── slot
│       │   └── quantity
│       └── outPut
│           ├── itemId
│           └── quantity
│
├── combatentities
│   ├── name
│   ├── xpMultiplier
│   ├── sceneId
│   ├── stats
│   │   ├── health
│   │   ├── attack
│   │   ├── defense
│   │   ├── velocity
│   │   ├── stamina
│   │   └── specialChance
│   └── specialAttacks[]
│       ├── name
│       ├── effects[]
│       └── specialAttackStats
│           ├── velocityMultiply
│           └── attackMultiply
│
├── combatentityinstances
│   ├── userId
│   ├── combatEntityId
│   ├── combatEntityStats
│   │   ├── health
│   │   ├── attack
│   │   ├── defense
│   │   ├── velocity
│   │   └── stamina
│   ├── statPoints
│   ├── experience
│   └── level
│
└── worldobjectsinstances
    ├── userId
    ├── worldObjectId
    ├── position
    │   ├── x
    │   └── y
    └── inventory
        ├── width
        ├── height
        └── slots[]
            ├── itemId
            └── quantity
```

Esta vista es únicamente estructural: muestra qué campos y subdocumentos componen cada documento. No representa un modelo relacional ni pretende convertir MongoDB en una base de datos relacional.
