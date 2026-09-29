# Base de datos

La API utiliza **MongoDB** como sistema de almacenamiento y **Mongoose** como ODM para definir y validar la estructura de los documentos.

La base de datos combina **documentos principales** con **subdocumentos embebidos** para representar la información que pertenece directamente a una entidad.

## Colecciones

Actualmente, la base de datos está estructurada alrededor de las siguientes colecciones:

```text
users
items
recipes
worldobjects
worldobjectsinstances
```

Además, algunos documentos contienen estructuras embebidas reutilizables:

```text
Position
Inventory
InventorySlot
Effect
Input
Output
```

---

# Colección `users`

La colección `users` almacena la información de las cuentas de los jugadores y parte de su progreso dentro del juego.

Ejemplo de un documento:

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
    "slots": [
      {
        "itemId": null,
        "quantity": 0
      }
    ]
  },
  "defatedNeighbors": []
}
```

## Campos de `users`

| Campo              | Tipo        | Requerido | Mínimo | Descripción                                                        |
| ------------------ | ----------- | --------- | ------ | ------------------------------------------------------------------ |
| `_id`              | `ObjectId`  | Sí        | n/a    | Identificador único generado automáticamente por MongoDB.          |
| `username`         | `String`    | Sí        | n/a    | Nombre de usuario. Debe ser único y tener al menos 5 caracteres.   |
| `password`         | `String`    | Sí        | n/a    | Contraseña almacenada mediante un hash.                            |
| `refresh_token`    | `String`    | No        | n/a    | Hash del Refresh Token utilizado para mantener la sesión.          |
| `coins`            | `Number`    | Sí        | 0      | Cantidad de monedas que tiene el jugador.                          |
| `position`         | `Position`  | Sí        | n/a    | Posición actual del jugador dentro del juego.                      |
| `inventory`        | `Inventory` | Sí        | n/a    | Inventario del jugador.                                            |
| `defatedNeighbors` | `String[]`  | Sí        | n/a    | Lista de identificadores de los vecinos derrotados por el jugador. |

---

# Subdocumento `Position`

`Position` representa la posición de una entidad dentro del mundo del juego.

Es un subdocumento reutilizable y se define con `{ _id: false }`, por lo que MongoDB no genera un `_id` independiente para esta estructura.

Actualmente se utiliza en:

- `User`
- `WorldObjects`
- `WorldObjectsInstance`

Ejemplo:

```json
{
  "position": {
    "x": 120,
    "y": 250
  }
}
```

## Campos de `Position`

| Campo | Tipo     | Requerido | Valor predeterminado | Descripción            |
| ----- | -------- | --------- | -------------------- | ---------------------- |
| `x`   | `Number` | Sí        | `0`                  | Coordenada horizontal. |
| `y`   | `Number` | Sí        | `0`                  | Coordenada vertical.   |

---

# Subdocumento `Inventory`

`Inventory` representa el inventario de una entidad.

Actualmente se utiliza dentro de:

- `User`
- `WorldObjectsInstance`

El inventario utiliza una cuadrícula de **7 × 5**, equivalente a **35 espacios**.

Ejemplo:

```json
{
  "inventory": {
    "width": 7,
    "height": 5,
    "slots": []
  }
}
```

## Campos de `Inventory`

| Campo    | Tipo              | Requerido | Valor predeterminado | Descripción                                        |
| -------- | ----------------- | --------- | -------------------- | -------------------------------------------------- |
| `width`  | `Number`          | Sí        | `7`                  | Cantidad de columnas del inventario.               |
| `height` | `Number`          | Sí        | `5`                  | Cantidad de filas del inventario.                  |
| `slots`  | `InventorySlot[]` | Sí        | `[]`                 | Espacios que contienen los objetos del inventario. |

---

# Subdocumento `InventorySlot`

Cada elemento de `slots` representa un espacio individual del inventario.

Ejemplo:

```json
{
  "itemId": "ObjectId(...)",
  "quantity": 1
}
```

## Campos de `InventorySlot`

| Campo      | Tipo             | Requerido | Valor predeterminado | Descripción                                           |
| ---------- | ---------------- | --------- | -------------------- | ----------------------------------------------------- |
| `itemId`   | `String \| null` | No        | `null`               | Identificador del Item almacenado en el espacio.      |
| `quantity` | `Number`         | Sí        | `0`                  | Cantidad de unidades del Item. No puede ser negativa. |

El `itemId` puede ser `null` cuando el espacio está vacío.

---

# Creación del inventario

Al registrar un usuario se genera automáticamente un inventario utilizando la función:

```ts
createInventory(width, height);
```

Actualmente se crea un inventario de:

```text
7 × 5 = 35 slots
```

Cada espacio comienza vacío:

```json
{
  "itemId": null,
  "quantity": 0
}
```

El inventario se almacena directamente dentro del documento del usuario y no como una colección independiente.

El mismo schema de `Inventory` puede reutilizarse en otras entidades que necesiten un inventario.

---

# Colección `items`

La colección `items` almacena la definición de los objetos disponibles dentro del juego.

Un Item representa el objeto como concepto general. Su `_id` es generado automáticamente por MongoDB.

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

## Campos de `items`

| Campo     | Tipo       | Requerido | Descripción                                         |
| --------- | ---------- | --------- | --------------------------------------------------- |
| `_id`     | `ObjectId` | Sí        | Identificador generado automáticamente por MongoDB. |
| `name`    | `String`   | Sí        | Nombre del objeto.                                  |
| `type`    | `String`   | Sí        | Tipo de objeto.                                     |
| `effects` | `Effect[]` | No        | Lista de efectos que puede producir el objeto.      |

No todos los Items necesitan tener efectos.

Por ejemplo, un material puede tener:

```json
{
  "_id": "ObjectId(...)",
  "name": "Madera",
  "type": "material",
  "effects": []
}
```

Mientras que un objeto consumible puede contener uno o más efectos.

---

# Subdocumento `Effect`

`Effect` representa un efecto asociado a un Item.

Está definido con `{ _id: false }`, por lo que los efectos no tienen un identificador independiente.

Ejemplo:

```json
{
  "stat": "health",
  "operation": "add",
  "value": 50
}
```

## Campos de `Effect`

| Campo       | Tipo     | Descripción                                      |
| ----------- | -------- | ------------------------------------------------ |
| `stat`      | `String` | Estadística que será modificada.                 |
| `operation` | `String` | Operación que se realizará sobre la estadística. |
| `value`     | `Number` | Valor utilizado por la operación.                |

---

# Colección `recipes`

La colección `recipes` almacena las recetas de fabricación del juego.

Una receta define qué Items necesita el jugador y qué Item obtiene como resultado.

Ejemplo:

```json
{
  "_id": "ObjectId(...)",
  "inputs": [
    {
      "itemId": "ObjectId(...)",
      "slot": "0",
      "quantity": 2
    },
    {
      "itemId": "ObjectId(...)",
      "slot": "1",
      "quantity": 1
    }
  ],
  "outPut": {
    "itemId": "ObjectId(...)",
    "quantity": 1
  }
}
```

## Campos de `recipes`

| Campo    | Tipo       | Requerido | Descripción                                         |
| -------- | ---------- | --------- | --------------------------------------------------- |
| `_id`    | `ObjectId` | Sí        | Identificador generado automáticamente por MongoDB. |
| `inputs` | `Input[]`  | Sí        | Items necesarios para fabricar el objeto.           |
| `outPut` | `Output`   | Sí        | Item producido por la receta.                       |

---

# Subdocumento `Input`

`Input` representa uno de los Items necesarios para completar una receta.

Ejemplo:

```json
{
  "itemId": "ObjectId(...)",
  "slot": "0",
  "quantity": 2
}
```

## Campos de `Input`

| Campo      | Tipo     | Requerido | Mínimo | Descripción                         |
| ---------- | -------- | --------- | ------ | ----------------------------------- |
| `itemId`   | `String` | Sí        | n/a    | Identificador del Item requerido.   |
| `slot`     | `String` | Sí        | n/a    | Slot utilizado dentro de la receta. |
| `quantity` | `Number` | Sí        | 1      | Cantidad necesaria del Item.        |

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

## Campos de `Output`

| Campo      | Tipo     | Requerido | Mínimo | Descripción                       |
| ---------- | -------- | --------- | ------ | --------------------------------- |
| `itemId`   | `String` | Sí        | 1      | Identificador del Item producido. |
| `quantity` | `Number` | Sí        | 1      | Cantidad producida.               |

---

# Colección `worldobjects`

La colección `worldobjects` representa los tipos de objetos que pueden existir dentro del mundo del juego.

Un `WorldObject` puede estar relacionado con un Item y puede contener las recetas que puede utilizar.

Ejemplo conceptual:

```json
{
  "_id": "ObjectId(...)",
  "itemId": "ObjectId(...)",
  "position": {
    "x": 500,
    "y": 300
  },
  "movible": false,
  "recipes": []
}
```

## Campos de `worldobjects`

| Campo | Tipo | Requerido || Descripción |
| ---------- | ---------- | --------- || --------------------------------------------------- |
| `_id` | `ObjectId` | Sí || Identificador generado automáticamente por MongoDB. |
| `itemId` | `String` | No || Identificador del Item relacionado con el objeto. |
| `position` | `Position` | Sí || Posición del objeto dentro del mundo. |
| `movible` | `Boolean` | Sí || Indica si el objeto puede desplazarse. |
| `recipes` | `Recipe[]` | Sí || Recetas asociadas al objeto. |

Actualmente las recetas se almacenan como subdocumentos dentro de `WorldObjects`.

---

# Colección `worldobjectsinstances`

La colección `worldobjectsinstances` representa una instancia concreta de un `WorldObject` asociada a un usuario.

Mientras `WorldObjects` contiene la definición del objeto, `WorldObjectsInstance` contiene información específica de una instancia.

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

## Campos de `worldobjectsinstances`

| Campo           | Tipo        | Requerido | Descripción                                              |
| --------------- | ----------- | --------- | -------------------------------------------------------- |
| `_id`           | `ObjectId`  | Sí        | Identificador generado automáticamente por MongoDB.      |
| `userId`        | `String`    | Sí        | Identificador del usuario propietario de la instancia.   |
| `worldObjectId` | `String`    | Sí        | Identificador del WorldObject utilizado como definición. |
| `position`      | `Position`  | Sí        | Posición de la instancia dentro del mundo.               |
| `inventory`     | `Inventory` | Sí        | Inventario asociado a la instancia.                      |

Esto permite que una misma definición de `WorldObject` pueda tener diferentes instancias.

Conceptualmente:

```text
WorldObject
    │
    ├── WorldObjectInstance → Usuario A
    │
    ├── WorldObjectInstance → Usuario A
    │
    └── WorldObjectInstance → Usuario B
```

---

# Relaciones entre colecciones

Aunque MongoDB es una base de datos no relacional, algunos documentos mantienen referencias mediante identificadores.

La estructura conceptual actual es:

```text
                    ┌───────────┐
                    │   Item    │
                    └─────┬─────┘
                          │
              ┌───────────┼───────────┐
              │           │           │
              ▼           ▼           ▼
         Inventory      Recipe    WorldObject
              │           │
              ▼           ▼
            User      Input/Output
                                      │
                                      ▼
                              WorldObjectInstance
                                      │
                               ┌──────┴──────┐
                               ▼             ▼
                           Position      Inventory
```

## Referencia desde Inventory

```text
InventorySlot.itemId
        │
        ▼
     Item._id
```

## Referencia desde Recipe

```text
Input.itemId
        │
        ▼
     Item._id


Output.itemId
        │
        ▼
     Item._id
```

## Referencia desde WorldObjectInstance

```text
WorldObjectInstance.worldObjectId
        │
        ▼
   WorldObject._id
```

```text
WorldObjectInstance.userId
        │
        ▼
      User._id
```

---

# Estructura general de la base de datos

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
│
├── items
│   │
│   ├── name
│   ├── type
│   └── effects[]
│       ├── stat
│       ├── operation
│       └── value
│
├── recipes
│   │
│   ├── inputs[]
│   │   ├── itemId
│   │   ├── slot
│   │   └── quantity
│   │
│   └── outPut
│       ├── itemId
│       └── quantity
│
├── neighboor
│   │
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
│
├── combatEntity
│   │
│   ├── name
│   ├── stats
│   └── specialAttacks
│       │
│       ├── name
│       ├── effects[]
│       │   ├── stat
│       │   ├── operation
│       │   └── value
│       └── specialAttackStats
│           ├── velocityMultiply
│           └── attackMultiply
│
├── combatEntity
│   │
│   ├── userId
│   ├── combatEntityId
│   └── combatEntityStats
│       ├── health
│       ├── attack
│       ├── defense
│       ├── velocity
│       └── stamina
│
└── worldObjectsInstances
    │
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

---

# Documentos embebidos vs colecciones

La base de datos diferencia entre entidades que necesitan existir como documentos independientes y estructuras que forman parte de otro documento.

## Colecciones principales

```text
users
items
recipes
worldobjects
worldobjectsinstances
```

Estas representan entidades independientes dentro del sistema.

## Subdocumentos

```text
Position
Inventory
InventorySlot
Effect
Input
Output
```

Estas estructuras se almacenan dentro de otros documentos y no necesitan existir como colecciones independientes.

Por ejemplo:

```text
User
 └── Inventory
      └── InventorySlot[]
```

y:

```text
Item
 └── Effect[]
```

---

# Identificadores

MongoDB genera automáticamente un campo `_id` para los documentos principales.

Por ejemplo:

```json
{
  "_id": "68d...",
  "name": "Madera",
  "type": "material"
}
```

Los demás documentos pueden almacenar ese identificador como referencia.

Por ejemplo:

```json
{
  "itemId": "68d...",
  "quantity": 10
}
```

De esta manera, `itemId` hace referencia al `_id` del documento correspondiente en `items`.

Los subdocumentos definidos con:

```ts
@Schema({ _id: false })
```

no reciben un `_id` independiente.

Actualmente esta configuración se utiliza para:

- `Position`
- `Inventory`
- `InventorySlot`
- `Effect`
- `Input`
- `Output`

---

# Resumen

La estructura actual de la base de datos busca mantener separadas las diferentes responsabilidades del juego:

```text
User
    ↓
Datos y progreso del jugador

Item
    ↓
Definición de objetos

Recipe
    ↓
Reglas de fabricación

WorldObject
    ↓
Definición de objetos del mundo

WorldObjectInstance
    ↓
Instancia concreta de un objeto para un usuario

Inventory
    ↓
Objetos almacenados por una entidad

Position
    ↓
Ubicación dentro del mundo
```

Esta estructura permite ampliar posteriormente el juego agregando nuevas entidades y funcionalidades sin tener que almacenar toda la información en una única colección.
