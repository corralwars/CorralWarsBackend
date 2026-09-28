# Base de datos

La API utiliza **MongoDB** como sistema de almacenamiento y **Mongoose** como ODM para definir y validar la estructura de los documentos.

## Colecciones

Actualmente, la base de datos utiliza la siguiente colección principal:

- `users`

El esquema de usuarios también contiene estructuras embebidas para la posición del jugador y su inventario.

### Colección `users`

La colección `users` almacena la información de las cuentas de los jugadores y parte de su progreso dentro del juego.

Ejemplo de un documento:

```json
{
  "_id": "ObjectId(...)",
  "username": "Yair17",
  "password": "hash_de_la_contraseña",
  "refresh_token": "hash_del_refresh_token",
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
  "level": 1,
  "experience": 0,
  "defatedNeighbors": []
}
```

### Campos de `users`

| Campo              | Tipo        | Requerido | Descripción                                                           |
| ------------------ | ----------- | --------- | --------------------------------------------------------------------- |
| `_id`              | `ObjectId`  | Sí        | Identificador único generado por MongoDB.                             |
| `username`         | `String`    | Sí        | Nombre de usuario. Debe ser único y tener al menos 5 caracteres.      |
| `password`         | `String`    | Sí        | Contraseña almacenada mediante un hash.                               |
| `refresh_token`    | `String`    | No        | Hash del Refresh Token utilizado para mantener la sesión.             |
| `position`         | `Position`  | Sí        | Posición actual del jugador dentro del juego.                         |
| `inventory`        | `Inventory` | Sí        | Inventario del jugador.                                               |
| `level`            | `Number`    | Sí        | Nivel actual del jugador. Su valor predeterminado es `1`.             |
| `experience`       | `Number`    | Sí        | Experiencia acumulada por el jugador. Su valor predeterminado es `0`. |
| `defatedNeighbors` | `String[]`  | Sí        | Lista de identificadores de los vecinos derrotados por el jugador.    |

### Subdocumento `Position`

`Position` es un subdocumento embebido dentro de `users`. Al utilizar `{ _id: false }`, MongoDB no genera un `_id` independiente para esta estructura.

```json
{
  "position": {
    "x": 120,
    "y": 250
  }
}
```

| Campo | Tipo     | Requerido | Valor predeterminado | Descripción                        |
| ----- | -------- | --------- | -------------------- | ---------------------------------- |
| `x`   | `Number` | Sí        | `0`                  | Coordenada horizontal del jugador. |
| `y`   | `Number` | Sí        | `0`                  | Coordenada vertical del jugador.   |

### Subdocumento `Inventory`

El inventario también se almacena directamente dentro del documento del usuario.

La configuración inicial utiliza una cuadrícula de **7 × 5**, equivalente a **35 espacios**.

```json
{
  "inventory": {
    "width": 7,
    "height": 5,
    "slots": []
  }
}
```

| Campo    | Tipo              | Requerido | Valor predeterminado | Descripción                                        |
| -------- | ----------------- | --------- | -------------------- | -------------------------------------------------- |
| `width`  | `Number`          | Sí        | `7`                  | Cantidad de columnas del inventario.               |
| `height` | `Number`          | Sí        | `5`                  | Cantidad de filas del inventario.                  |
| `slots`  | `InventorySlot[]` | Sí        | `[]`                 | Espacios que contienen los objetos del inventario. |

### Subdocumento `InventorySlot`

Cada elemento de `slots` representa un espacio individual del inventario.

```json
{
  "itemId": "sword_001",
  "quantity": 1
}
```

| Campo      | Tipo             | Requerido | Valor predeterminado | Descripción                                             |
| ---------- | ---------------- | --------- | -------------------- | ------------------------------------------------------- |
| `itemId`   | `String \| null` | No        | `null`               | Identificador del objeto almacenado en el espacio.      |
| `quantity` | `Number`         | Sí        | `0`                  | Cantidad de unidades del objeto. No puede ser negativa. |

### Estructura de la colección

```text
users
│
├── _id
├── username
├── password
├── refresh_token
├── level
├── experience
├── defatedNeighbors[]
│
├── position
│   ├── x
│   └── y
│
└── inventory
    ├── width
    ├── height
    │
    └── slots[]
        ├── itemId
        └── quantity
```

### Creación del inventario

Al registrar un usuario se genera automáticamente un inventario utilizando la función `createInventory(width, height)`.

Actualmente se crea un inventario de `7 × 5`:

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

De esta forma, el inventario no necesita almacenarse como una colección independiente, sino que forma parte del documento del jugador.
