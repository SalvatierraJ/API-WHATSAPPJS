# API WhatsApp

## Descripción

Este proyecto es una API desarrollada en **Node.js** con **Express** que permite enviar mensajes de WhatsApp de manera automatizada utilizando  **whatsapp-web.js** . La API maneja sesiones múltiples, encola mensajes con **Bee-Queue** y almacena sesiones en una base de datos  **MySQL** .

## Características

* Manejo de múltiples sesiones de WhatsApp
* Uso de colas de mensajes para enviar mensajes de manera escalonada
* Persistencia de sesiones en MySQL
* API REST para enviar mensajes y consultar estado de sesiones y la cola de mensajes

## Requisitos Previos

Antes de ejecutar el proyecto, asegúrate de tener instalado:

* **Node.js** (versión recomendada: 14+)
* **MySQL**

## Instalación

1. Clona este repositorio:
   ```sh
   git clone git@github.com:SalvatierraJ/API-WHATSAPPJS.git
   ```
2. Entra en el directorio del proyecto:
   ```sh
   cd API-WHATSAPPJS
   ```
3. Instala las dependencias necesarias:
   ```sh
   npm install
   ```

## Configuración de la Base de Datos

1. Asegúrate de que MySQL esté ejecutándose y crea la base de datos:
   ```sql
   CREATE DATABASE sorteocasos;
   ```
2. Verifica la configuración de conexión en `basededatos.js`:
   ```js
   const db = mysql.createConnection({
       host: 'localhost',
       user: 'root',
       password: '',
       database: 'sorteocasos',
       port: 3306
   });
   ```
3. Ejecuta el script para crear la tabla de sesiones:
   ```sh
   node basededatos.js
   ```

## Uso

### Iniciar el Servidor

Para iniciar la API, ejecuta el siguiente comando:

```sh
node server.js
```

El servidor estará corriendo en: `http://localhost:3000`

### Escanear Código QR

Cuando inicias el servidor por primera vez, se generará un código QR en la terminal. Escanéalo con WhatsApp Web en tu teléfono para autenticar la sesión.

### Endpoints Disponibles

#### Enviar un mensaje

**POST** `/send-message`

**Cuerpo de la solicitud (JSON):**

```json
{
    "phone": "591XXXXXXXX",
    "message": "Hola, este es un mensaje de prueba."
}
```

#### Consultar sesiones activas

**GET** `/session-status`

**Respuesta:**

```json
{
    "active_sessions": ["session1", "session2"]
}
```

#### Consultar estado de la cola de mensajes

**GET** `/queue-status`

**Respuesta:**

```json
{
    "queue_length": 5
}
```

## Consideraciones

* Si no hay sesiones activas, los mensajes no se enviarán.
* Si el servidor se detiene, deberás volver a escanear el código QR.

## Licencia

Este proyecto es de código abierto bajo la licencia MIT.
