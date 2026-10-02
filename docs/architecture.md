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

Los elementos almacenados en `Common` no representan necesariamente módulos de NestJS. Por ejemplo, `Inventory`, `Position` y `Effect` son estructuras reutilizables utilizadas por otros dominios.

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
│   └── dto/
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
│       ├── inventory.schema.ts
│       └── position.schema.ts
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
├── AuthModule
├── CombatEntitiesModule
├── UserModule
├── ItemsModule
├── RecipesModule
├── WorldObjectsModule
└── NeighborsModule
```

`Inventory` no aparece como módulo independiente porque no posee endpoints ni lógica de aplicación propia.

---

# AuthModule

`AuthModule` contiene la lógica relacionada con la autenticación.

Actualmente se encarga de:

- Registro.
- Login.
- Logout.
- Generación de Access Tokens.
- Generación de Refresh Tokens.
- Validación manual de tokens.
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

La autenticación no utiliza Guards de NestJS actualmente. La validación de
los tokens se realiza directamente desde los services cuando una operación
requiere comprobar la sesión.

Esta decisión se debe a que CorralWars tiene a Godot como cliente principal
y único consumidor previsto de la API. En lugar de añadir una capa de Guards
para proteger las rutas, las operaciones que necesitan autenticación realizan
la validación explícitamente dentro de la lógica de aplicación.

Por ejemplo, un flujo autenticado puede seguir conceptualmente:

```text
Controller
    │
    ▼
Service
    │
    ├── Verificar Token
    │
    ├── Obtener payload
    │
    └── Ejecutar operación
    │
    ▼
MongoDB
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

Una receta define los items necesarios y el resultado obtenido.

```text
Recipe
├── inputs[]
│   ├── itemId
│   ├── slot
│   └── quantity
│
└── outPut
    ├── itemId
    └── quantity
```

Las recetas utilizan referencias hacia `Item` mediante sus identificadores. El nombre del campo en el schema real es `outPut` con `P` mayúscula, tal como aparece en `src/recipes/schemas/recipe.schema.ts`.

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

El `inventory` utilizado por una instancia es el schema reutilizable definido en:

```text
common/schemas/inventory.schema.ts
```

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

La implementación real de los schemas refleja esta separación mediante:

- `src/combat-entities/schemas/combatEntity.schema.ts`
- `src/combat-entities/schemas/combatEntityInstance.schema.ts`
- `src/combat-entities/schemas/stat.schema.ts`

---

# CombatEntity

`CombatEntity` representa una definición reutilizable de una entidad combatible.

La estructura actual del schema es:

```text
CombatEntity
├── name
├── stats
│   ├── health
│   ├── attack
│   ├── defense
│   ├── velocity
│   ├── stamina
│   └── specialChance
└── specialAttacks[]
    ├── name
    ├── effects[]
    │   ├── stat
    │   ├── operation
    │   └── value
    └── specialAttackStats
        ├── velocityMultiply
        └── attackMultiply
```

Esta versión no incluye `sceneId`, `xpMultiplier`, `baseStats` ni campos como `damage`, `cooldown` o `range`, porque esos atributos no existen en el código actual.

---

# CombatEntityInstance

`CombatEntityInstance` representa la versión asociada al progreso de un usuario para una entidad combatible concreta.

```text
CombatEntityInstance
├── userId
├── combatEntityId
├── combatEntityStats
│   ├── health
│   ├── attack
│   ├── defense
│   ├── velocity
│   └── stamina
├── statPoints
├── experience
├── level
└── timestamps
```

La relación del sistema es:

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

Esto permite que distintos usuarios tengan progresiones diferentes para la misma entidad base sin duplicar la definición global de la entidad.

---

# Estadísticas de combate

Las estadísticas base pertenecen a `CombatEntity` y se almacenan en el subdocumento `stats`.

Actualmente se utilizan:

```text
health
attack
defense
velocity
stamina
specialChance
```

La instancia del usuario guarda una copia propia de las estadísticas combatientes en `combatEntityStats`, con sus valores actuales para el progreso del jugador:

```text
CombatEntityInstance
└── combatEntityStats
```

Conceptualmente:

```text
Definición base
    ↓
CombatEntity.stats
    ↓
Instancia del jugador
    ↓
CombatEntityInstance.combatEntityStats
```

---

# Special Attacks

Las entidades de combate pueden tener ataques especiales registrados en `specialAttacks`.

La estructura real del schema es:

```text
CombatEntity
└── specialAttacks[]
    ├── name
    ├── effects[]
    │   ├── stat
    │   ├── operation
    │   └── value
    └── specialAttackStats
        ├── velocityMultiply
        └── attackMultiply
```

Los ataques especiales no incluyen `damage`, `cooldown`, `range`, `scalingStat`, `scalingValue` ni `unlockLevel` en la implementación actual. Los modificadores concretos que existen son los multiplicadores de velocidad y ataque dentro de `specialAttackStats`.

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
    ├── inventory.schema.ts
    └── position.schema.ts
```

Estos schemas no representan módulos independientes de NestJS. Son estructuras de datos que pueden ser utilizadas por diferentes dominios.

---

## Position

Representa una posición bidimensional:

```json
{
  "x": 0,
  "y": 0
}
```

Puede utilizarse en diferentes entidades que necesiten almacenar una posición persistente.

---

## Inventory

Representa un inventario basado en slots.

Su estructura conceptual es:

```text
Inventory
├── width
├── height
└── slots[]
    ├── itemId
    └── quantity
```

El inventario puede ser utilizado por diferentes entidades del sistema.

Actualmente se utiliza principalmente en:

```text
User
WorldObjectInstance
```

El schema se encuentra en:

```text
common/schemas/inventory.schema.ts
```

No existe un `InventoryModule` independiente porque el inventario no posee endpoints ni una lógica de aplicación propia.

---

## Effect

Representa una modificación sobre una estadística:

```json
{
  "stat": "health",
  "operation": "add",
  "value": 50
}
```

Puede utilizarse como subdocumento en diferentes sistemas, como Items y ataques especiales.

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

La implementación actual del backend no expone un campo `sceneId` dentro de `CombatEntity`. La resolución visual o de escena del personaje queda como una responsabilidad del cliente si se decide mapearla por nombre o por ID interno.

Un flujo posible, sin depender de un campo persistido en MongoDB, es:

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
  │ name / stats / specialAttacks
  ▼
Godot
  │
  ▼
Resuelve el recurso visual y ejecuta la lógica del combate
```

Esto mantiene la base de datos enfocada en datos del juego y deja la representación gráfica en el cliente.

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
     ├── ItemsService
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

Los schemas reutilizables se encuentran en `Common` cuando no pertenecen exclusivamente a un dominio:

```text
common/schemas/
├── effect.schema.ts
├── inventory.schema.ts
└── position.schema.ts
```

Estos schemas pueden formar parte de documentos de diferentes colecciones sin convertirse en colecciones independientes.

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

Los schemas de `Common`, en cambio, pueden ser importados directamente por los dominios que los necesiten.

Por ejemplo:

```text
User
   │
   └── InventorySchema

WorldObjectInstance
   │
   └── InventorySchema
```

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

Los schemas de `Common` participan como estructuras de los documentos cuando son necesarios, pero no reciben solicitudes HTTP directamente.

---

# Flujo de autenticación

La autenticación se realiza mediante JWT y la validación necesaria se hace
manualmente desde la lógica de los services. No se utiliza un `AuthGuard`
para interceptar las solicitudes.

El login sigue este flujo:

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
   ├── Buscar usuario
   │
   ├── Verificar contraseña
   │
   ├── Generar Access Token
   │
   └── Generar Refresh Token
   │
   ▼
UserService
   │
   └── Guardar hash del Refresh Token
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

Para operaciones que necesitan validar una sesión, el service responsable
realiza la comprobación del JWT antes de continuar:

```text
Godot
   │
   │ HTTP / JSON + Token
   ▼
Controller
   │
   ▼
Service
   │
   ├── Verificar JWT
   │
   ├── Obtener payload
   │
   └── Validar condiciones de la operación
   │
   ▼
MongoDB
```

Esto mantiene la autenticación como parte de la lógica de aplicación sin
introducir una capa adicional de Guards.

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
   ├── stats
   ├── specialAttacks
   └── name
   │
   ▼
Godot
   │
   ├── resuelve recursos visuales
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
   ├── statPoints
   └── combatEntityStats
   │
   ▼
Godot
```

De esta forma, MongoDB proporciona la definición y la progresión necesaria, mientras Godot ejecuta la lógica de combate y la presentación del encuentro.

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

Los elementos reutilizables, como `Inventory`, `Position` y `Effect`, pueden compartirse entre estos dominios mediante `Common` sin necesidad de crear módulos independientes para cada uno.
