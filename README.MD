# Sistema de Tickets de Soporte

Sistema web de soporte técnico con tickets en tiempo real, desarrollado con Node.js, Express, MySQL y Socket.io.

---

##  Descripción

Plataforma que permite a los clientes crear tickets de soporte, chatear en tiempo real con el equipo de soporte técnico y hacer seguimiento del estado de sus consultas. Los empleados de soporte pueden gestionar los tickets, responder y actualizar su estado. El administrador gestiona los empleados y clientes del sistema.

---

##  Tecnologías utilizadas

| Tecnología      | Uso                               |
|-----------------|-----------------------------------|
| Node.js         | Entorno de ejecución              |
| Express         | Framework web y API REST          |
| MySQL 8.0       | Base de datos relacional          |
| Socket.io       | Chat en tiempo real               |
| JWT             | Autenticación con tokens          |
| bcryptjs        | Hasheo de contraseñas             |
| HTML + CSS + JS | Frontend vanilla                  |
| Canvas API      | Generación de tickets como imagen |

---

## Roles del sistema

| Rol         | Descripción                             |
|-------------|-----------------------------------------|
| `user`      | Cliente que crea y sigue sus tickets    |
| `support`   | Agente de soporte que gestiona tickets  |
| `admin`     | Administrador del sistema               |
| `pending`   | Empleado esperando aprobación del admin |
| `suspended` | Empleado deshabilitado temporalmente    |
| `banned`    | Cliente dado de baja                    |

---

## Base de datos

### Tablas principales

- `users` — Usuarios del sistema (clientes, soporte, admin)
- `categories` — Categorías de tickets
- `tickets` — Tickets de soporte
- `messages` — Mensajes del chat por ticket
- `settings` — Configuración del sistema (horarios, etc.)

### Características de la BD

-  5 Tablas  (relacionadas entre sí)
-  1 Trigger (`trg_ticket_assign_status`)
-  2 Stored Procedures (`sp_get_tickets_by_user`, `sp_create_ticket`)
-  1 Transacción con ROLLBACK (dentro de `sp_create_ticket`)

---

## Estructura del proyecto

```
proyecto/
├── server.js               # Servidor principal
├── package.json
├── .env                    # Variables de entorno (no subir)
├── .env.example
├── database.sql            # Script de base de datos
│
├── db/
│   └── index.js            # Conexión a MySQL
│
├── controllers/              # lógica de cada endpoint.
│   ├── authController.js
│   ├── ticketController.js
│   ├── messageController.js
│   ├── adminController.js
│   └── settingsController.js
│
├── routes/                # puertas de entrada (Conectan las URLs con los controllers.) 
│   ├── auth.js
│   ├── tickets.js
│   ├── messages.js
│   ├── admin.js
│   └── settings.js
│
├── models/               # Consultas a la BD. Si se emigra a otra BD, solo se modifican.  
|   |                                                              
│   ├── userModel.js               
│   ├── ticketModel.js                                     
│   ├── messageModel.js                                    
│   └── settingsModel.js                                   
│
├── middleware/
│   └── auth.js             # Verificación JWT y roles
│
├── services/
│   └── socketService.js    # Chat en tiempo real
│
└── public/
    ├── index.html           # Página de inicio
    ├── login-cliente.html
    ├── login-soporte.html
    ├── dashboard-user.html
    ├── dashboard-support.html
    ├── dashboard-admin.html
    ├── style.css
    ├── dashboard.css
    ├── app.js
    ├── login-cliente.js
    ├── login-soporte.js
    ├── dashboard-user.js
    ├── dashboard-support.js
    └── dashboard-admin.js
```

---

## Instalación y configuración

### 1. Clonar el repositorio

```bash
git clone https://github.com/cucu313/Sistema-de-tickets.git
cd Sistema-de-tickets
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Copiá el archivo de ejemplo y completá los datos validos:

```bash
cp .env.example .env
```

Editá el `.env`:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=ticket_db
JWT_SECRET=clave_secreta_larga
JWT_EXPIRES_IN=8h
```

### 4. Crear la base de datos

Ejecutá el script en MySQL Workbench o desde la terminal:

```bash
mysql -u root -p < database.sql
```

### 5. Iniciar el servidor

```bash
# Desarrollo (con recarga automática)
npm run dev

# Producción
npm start
```

El servidor corre en `http://localhost:3000`
para poder usar en celular copias"http://ip4v(de tu pc):3000"
como saber cual es la ipv4 de tu pc ejecuta "ipconfig" en tu terminal.
# pd:
todavia no puedes registrarte o iniciar sección desde el celular, deberias remplazar el localhost por la ip de tu pc en todos los archivos JS.  Y la interfaz desde el celular no es muy buena deberia modificar eso en un futuro.


---

## API Endpoints

### Autenticación

| Método | Ruta                         | Descripción                 | Auth |
|--------|------------------------------|-----------------------------|------|
| POST   | `/api/auth/register`         | Registrar cliente           | No   |
| POST   | `/api/auth/register-soporte` | Solicitar acceso soporte    | No   |
| POST   | `/api/auth/login`            | Iniciar sesión              | No   |
| POST   | `/api/auth/recover`          | Recuperar contraseña        | No   |
| GET    | `/api/auth/me`               | Datos del usuario logueado  | JWT  |
| PATCH  | `/api/auth/update`           | Actualizar datos personales | JWT  |

### Tickets

| Método | Ruta                      | Descripción             | Auth    |
|--------|---------------------------|-------------------------|---------|
| GET    | `/api/tickets`            | Mis tickets             | JWT     |
| POST   | `/api/tickets`            | Crear ticket            | JWT     |
| GET    | `/api/tickets/all`        | Todos los tickets       | Soporte |
| GET    | `/api/tickets/categories` | Categorías              | JWT     |
| GET    | `/api/tickets/:id`        | Ver ticket              | JWT     |
| PATCH  | `/api/tickets/:id`        | Actualizar ticket       | Soporte |
| DELETE | `/api/tickets/:id`        | Eliminar ticket cerrado | JWT     |

### Mensajes

| Método | Ruta                      | Descripción    | Auth |
|--------|---------------------------|----------------|------|
| GET    | `/api/messages/:ticketId` | Ver mensajes   | JWT  |
| POST   | `/api/messages/:ticketId` | Enviar mensaje | JWT  |

### Administración

| Método | Ruta                     | Descripción            | Auth  |
|--------|--------------------------|------------------------|-------|
| GET    | `/api/admin/pending`     | Empleados pendientes   | Admin |
| GET    | `/api/admin/support`     | Empleados activos      | Admin |
| GET    | `/api/admin/suspended`   | Empleados suspendidos  | Admin |
| GET    | `/api/admin/clients`     | Clientes activos       | Admin |
| GET    | `/api/admin/banned`      | Clientes dados de baja | Admin |
| PATCH  | `/api/admin/approve/:id` | Aprobar empleado       | Admin |
| PATCH  | `/api/admin/reject/:id`  | Rechazar solicitud     | Admin |
| PATCH  | `/api/admin/role/:id`    | Cambiar rol            | Admin |
| DELETE | `/api/admin/user/:id`    | Eliminar usuario       | Admin |

### Configuración

| Método | Ruta                    | Descripción             | Auth  |
|--------|-------------------------|-------------------------|-------|
| GET    | `/api/settings/horario` | Ver horario de atención | No    |
| PATCH  | `/api/settings/horario` | Actualizar horario      | Admin |



## Funcionalidades principales

-  Registro y login con JWT
-  Recuperación de contraseña con pregunta de seguridad
-  Crear tickets con categoría y prioridad
-  Chat en tiempo real con Socket.io
-  Guardar tickets y mensajes como imagen PNG
-  Panel de soporte con filtros por estado
-  Panel de administración completo
-  Gestión de empleados (aprobar, suspender, despedir)
-  Gestión de clientes (dar de baja, reactivar, eliminar)
-  Horario de atención editable por el admin
-  Modo claro/oscuro
-  Diseño responsive

## paginas utiles:
 trello.com - fsymbols.com - devdocs.io - w3schools.com - nodejs.org - socket.io - jwt.io - npmjs.com/package/bcrypt
---
## PREGUNTAS Y RESPUESTAS:
1_ ¿Qué es un servidor web y cómo funciona el ciclo request-response?

Un servidor web es un programa que escucha peticiones de los clientes (navegadores, apps) y les devuelve una respuesta.
el ciclo es:

el cliente manda una request (petición) con una URL y método HTTP (GET, POST, etc.)
el servidor la recibe, procesa la lógica y consulta la base de datos si es necesario
el servidor devuelve una response (respuesta) con un código de estado (200, 404, 500) y los datos

en mi proyecto: cuando el cliente hace login, manda un POST a /api/auth/login → el servidor verifica las credenciales → devuelve el token JWT.


2_ ¿Qué es Express y por qué lo usamos en lugar de usar solo Node.js?

Node.js solo tiene capacidades básicas para manejar peticiones HTTP. Express es un framework que simplifica enormemente el trabajo.
sin Express tendríamos que manejar todo manualmente:
javascript// Node.js puro — muy verboso
```javascript 
if (req.url === '/login' && req.method === 'POST') { ... }
```
Con Express es mucho más simple:
```javascript 
javascript router.post('/login', authController.login);
```
Express también maneja middlewares, rutas, errores y archivos estáticos de forma ordenada.


3_ ¿Qué es un JWT y cómo se diferencia de guardar la sesión en el servidor?

JWT (JSON Web Token) es un token que contiene los datos del usuario encriptados. Se genera al hacer login y el cliente lo guarda en localStorage.

 |-----------------------------------------|-----------------------------------------------------|
 | Sesión en servidor                      |      JWT                                            |
 |-----------------------------------------|-----------------------------------------------------|
 | el servidor guarda los datos de sesión  |   el cliente guarda el token                        |
 | consume memoria del servidor            |   el servidor no guarda nada                        |
 | no escala bien                          |   escala fácilmente                                 |
 | si el servidor se reinicia, se pierde   |   el token sigue siendo válido                      |
 |-----------------------------------------|-----------------------------------------------------|

en mi proyecto: el token contiene id, name, email y role. En cada petición el cliente lo manda en el header Authorization: Bearer <token> y el servidor lo verifica.
              

4_ ¿Qué ventaja tiene usar un procedimiento almacenado en lugar de escribir ese SQL desde Node.js?

Un procedimiento almacenado (Stored Procedure) es código SQL guardado en la base de datos que se puede llamar con un solo comando.
Ventajas:

A_ Rendimiento — ya está compilado en la BD, ejecuta más rápido
B_ Seguridad — el código SQL no viaja por la red
C_ Reutilización — cualquier aplicación puede llamarlo sin reescribir el SQL
D_ Mantenimiento — si cambia la lógica, solo modificás el procedure, no el código de Node.js

en mi proyecto: sp_get_tickets_by_user(id) devuelve todos los tickets de un usuario con la categoría incluida, con una sola llamada.

5. ¿Por qué es importante usar transacciones? Ejemplo con ROLLBACK.

Una transacción agrupa varias operaciones SQL que deben ejecutarse todas juntas o ninguna. Si algo falla en el medio, el ROLLBACK deshace todo.
Ejemplo sin transacción (peligroso):
```sql
sqlINSERT INTO tickets (...);   -- si esto funciona
-- pero esto falla por error
UPDATE users SET ...;        -- la BD queda en estado inconsistente
Con transacción y ROLLBACK:
sqlSTART TRANSACTION;
  INSERT INTO tickets (...);
  UPDATE users SET ...;
COMMIT;   -- si todo salió bien, guarda
```
-- Si algo falla → ROLLBACK → vuelve al estado anterior
en mi proyecto: sp_create_ticket usa transacción para asegurarse que si falla la inserción del ticket, no queden datos a medias.

6. ¿Qué es un trigger? Describe el trigger que implementaste y en qué momento se dispara.

Un trigger es código SQL que se ejecuta automáticamente cuando ocurre un evento en la base de datos (INSERT, UPDATE, DELETE), sin que nadie lo llame.
El trigger que implemente es trg_ticket_assign_status:
```sql
CREATE TRIGGER trg_ticket_assign_status
BEFORE UPDATE ON tickets
FOR EACH ROW
BEGIN
  IF NEW.assigned_to IS NOT NULL
     AND OLD.assigned_to IS NULL
     AND NEW.status = 'pending'
  THEN
    SET NEW.status = 'in_progress';
  END IF;
END
```

Se dispara: antes de cada UPDATE en la tabla tickets.
Qué hace: cuando el soporte se asigna a un ticket (assigned_to pasa de NULL a un valor) y el ticket estaba pendiente, automáticamente cambia el estado a in_progress. Nadie tiene que hacerlo manualmente, el trigger lo detecta y lo cambia solo.

---

# *Gonzalez Roberto Rafael* 
# *TP3 — Sistema de Tickets de Soporte.*

---