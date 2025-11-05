
# Generador de Contraseñas (Passfolio) - Integración Backend

Este proyecto integra un backend en Python con Flask a una aplicación frontend para generar contraseñas seguras, añadiendo una robusta gestión de perfiles de usuario y persistencia de datos.

## Integrantes

  - Omar Terbullino
  - Jean Quispe
  - Jhon Fernandez
  - Anthony Perez
  - Pool Caceda
## Funcionalidad Agregada y Mejorada

  - **Gestión de Perfiles (Backend):** Creación, selección, actualización y eliminación de perfiles de usuario (CRUD). Cada perfil almacena su propio historial y sus preferencias de generación de contraseñas.
  - **Persistencia de Datos Profesional:** La información ya no se guarda en un archivo `perfiles.json`. Se ha migrado a una base de datos **SQLite** (`perfiles.db`). La interacción con la base de datos se gestiona a través del ORM (Object-Relational Mapper) **Flask-SQLAlchemy**, permitiendo una gestión de datos segura y eficiente.
  - **Lógica de Frontend Modular:** El código JavaScript se ha dividido en `api.js` (comunicación con el servidor) y `main.js` (lógica de la interfaz), mejorando la organización del código.

## Funcionalidades Restauradas

  - **Generador de Contraseña Garantizado:** El algoritmo asegura que la contraseña final contenga al menos un carácter de cada tipo seleccionado.
  - **Exportar a TXT:** El historial de contraseñas del perfil actual se puede descargar como un archivo de texto.
  - **Generador de Código QR:** Se puede generar un QR a partir de la contraseña creada.
  - **Mejora de UX:** Feedback visual para todas las operaciones (carga, éxito, error) y paneles deshabilitados hasta que se carga un perfil.

## Estructura de Carpetas

La estructura de carpetas ahora refleja la nueva persistencia de datos:

```
.
├── backend/
│   ├── app.py              # Servidor Flask con la API RESTful y lógica de SQLAlchemy
│   ├── perfiles.db         # Base de datos SQLite (reemplaza a perfiles.json)
│   └── requirements.txt    # Dependencias de Python
│
├── frontend/
│   ├── index.html          # Estructura de la aplicación
│   ├── styles.css          # Hoja de estilos externa
│   ├── api.js              # Módulo para la comunicación con el backend
│   └── main.js             # Lógica principal de la interfaz y generación
│
└── README.md               # Este archivo
```

## Cómo Instalar y Ejecutar

Los pasos de instalación ahora incluyen la configuración de la base de datos.

### Configurar Backend

1.  **Navega a `backend/`**.

2.  **Crea y activa un entorno virtual:**

    ```bash
    python -m venv venv
    source venv/bin/activate  # En Linux/Mac
    venv\Scripts\activate     # En Windows
    ```

3.  **Instala las dependencias:**
    ```
    Flask==2.2.5
    flask-cors==3.0.10
    Werkzeug==2.3.8
    Flask-SQLAlchemy==3.0.5
    ```

    ```bash
    pip install -r requirements.txt
    ```

4.  **Crea la Base de Datos:**
    Este es un paso que se realiza **una sola vez** para crear el archivo `perfiles.db` y las tablas definidas en `app.py`. Ejecuta los siguientes comandos uno por uno en tu terminal (estando en la carpeta `backend/`):

    ```bash
    # 1. Inicia el intérprete de Python
    python

    # 2. Importa la app y el objeto 'db' desde tu archivo app.py
    >>> from app import app, db

    # 3. Entra en el contexto de la aplicación
    >>> with app.app_context():
    ...     db.create_all()
    ...

    # 4. Sal del intérprete
    >>> exit()
    ```

    Ahora deberías tener un nuevo archivo `perfiles.db` en tu carpeta `backend/`.

### Ejecutar Backend

Desde la carpeta `backend/`, con tu entorno virtual activado, ejecuta:

```bash
python app.py
```

El servidor se iniciará en `http://127.0.0.1:5000`.

### Abrir Frontend

Navega a la carpeta `frontend/` y abre `index.html` en tu navegador.

Si presentas algún problema, puedes servirlo con un servidor local simple:

1.  Abre una **nueva terminal** en el directorio `frontend/`.
2.  Ejecuta: `python -m http.server 8000`
3.  En tu navegador, ve a: `http://localhost:8000`

## Lista de Endpoints

La API (el "menú") no ha cambiado, lo que significa que el frontend no necesita modificaciones. Lo que cambió fue la "cocina" (cómo el backend maneja los datos).

  - `POST /perfiles`: Crea un nuevo perfil.
  - `GET /perfiles`: Obtiene la lista de todos los perfiles.
  - `GET /perfiles/{id}`: Obtiene un perfil específico.
  - `PUT /perfiles/{id}`: Actualiza un perfil (historial y/o preferencias).
  - `DELETE /perfiles/{id}`: Elimina un perfil.
  - `OPTIONS /perfiles/{id}`: Manejado automáticamente por `Flask-CORS` para las solicitudes pre-flight del navegador.

## Lista de Comandos para probar los Endpoints

Todos los comandos de prueba siguen funcionando exactamente igual, demostrando la ventaja de una API bien definida.

  - **Ver todos (Navegador):** `http://127.0.0.1:5000/perfiles`
  - **Ver todos (Consola):** `curl -X GET http://127.0.0.1:5000/perfiles`
  - **Crear un perfil:**
    ```bash
    curl.exe -X POST -H "Content-Type: application/json" -d "{\"nombre_perfil\": \"Usuario de Prueba\", \"email\": \"prueba@test.com\"}" http://127.0.0.1:5000/perfiles
    ```
  - **Ver un perfil (por ID):**
    ```bash
    curl http://127.0.0.1:5000/perfiles/{ID_DEL_USUARIO}
    ```
  - **Actualizar un perfil (por ID):**
    ```bash
    curl.exe -X PUT -H "Content-Type: application/json" -d "{\"email\": \"email.actualizado@curlexe.com\"}" http://127.0.0.1:5000/perfiles/{ID_DEL_USUARIO}
    ```
  - **Eliminar un perfil (por ID):**
    ```bash
    curl -X DELETE http://127.0.0.1:5000/perfiles/{ID_DEL_USUARIO}
    ```
