# Generador de Contraseñas (Passfolio)- Integración Backend

Este proyecto integra un backend en Python con Flask a una aplicación frontend para generar contraseñas seguras, añadiendo una robusta gestión de perfiles de usuario y persistencia de datos. Esta versión restaura y mejora todas las funcionalidades de la aplicación original.

## Integrantes

- Omar Terbullino
- Jean Quispe
- Jhon Fernandez
- Anthony Perez
-

## Funcionalidad Agregada y Mejorada

- **Gestión de Perfiles (Backend):** Creación, selección, actualización y eliminación de perfiles de usuario. Cada perfil almacena su propio historial y sus preferencias de generación de contraseñas.
- **Persistencia de Datos:** La información se guarda en un archivo `perfiles.json` en el servidor, reemplazando `localStorage`.
- **Lógica de Frontend Modular:** El código JavaScript se ha dividido en `api.js` (comunicación con el servidor) y `main.js` (lógica de la interfaz), mejorando la organización del código.

## Funcionalidades Restauradas

- **Generador de Contraseña Garantizado:** El algoritmo asegura que la contraseña final contenga al menos un carácter de cada tipo seleccionado.
- **Exportar a TXT:** El historial de contraseñas del perfil actual se puede descargar como un archivo de texto.
- **Generador de Código QR:** Se puede generar un QR a partir de la contraseña creada.
- **Mejora de UX:** Feedback visual para todas las operaciones (carga, éxito, error) y paneles deshabilitados hasta que se carga un perfil.

## Estructura de Carpetas

```
.
├── backend/
│   ├── app.py              # Servidor Flask con la API RESTful
│   ├── perfiles.json       # Base de datos (se crea o actualiza automáticamente)
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

Sigue los mismos pasos de la versión anterior.

### Configurar Backend

1. Navega a `backend/`.
2. Crea y activa un entorno virtual:
    ```bash
    python -m venv venv
    source venv/bin/activate  # En Linux/Mac
    venv\Scripts\activate     # En Windows
    ```
3. Instala las dependencias:
    ```bash
    pip install -r requirements.txt
    ```

### Ejecutar Backend

Desde la carpeta `backend/`, ejecuta:

```bash
python app.py
```

El servidor se iniciará en [http://127.0.0.1:5000](http://127.0.0.1:5000).

### Abrir Frontend

Navega a la carpeta `frontend/` y abre `index.html` en tu navegador.

Si presentas algún problema con la primera opción, puedes abrir una nueva terminal en el directorio de frontend.

Seguidamente ejecuta: python -m http.server 8000

Por último en tu navegador escribe: http://localhost:8000

## Lista de Endpoints

- `POST /perfiles`: Crea un nuevo perfil.
- `GET /perfiles`: Obtiene la lista de todos los perfiles.
- `GET /perfiles/{id}`: Obtiene un perfil específico.
- `PUT /perfiles/{id}`: Actualiza un perfil (historial y/o preferencias).
- `OPTIONS /perfiles/{id}`: Se ejecuta automáticamente al leer un usuario para cargar las preferencias del perfil.
- `DELETE /perfiles/{id}`: Elimina un perfil.

## Lista de Comandos para probar los Endpoints
- `http://127.0.0.1:5000/perfiles`: Puedes ver los usuarios existentes abriendo el enlace en tu navegador.
- `curl -X GET http://127.0.0.1:5000/perfiles`: Puedes ver los usuarios existentes en consola.
- `curl.exe -X POST -H "Content-Type: application/json" -d "{\"nombre_perfil\": \"Usuario de Prueba\", \"email\": \"prueba@test.com\"}" http://127.0.0.1:5000/perfiles`: Crea un nuevo perfil de prueba.
- `curl -X DELETE http://127.0.0.1:5000/perfiles/{Ingrese el ID del usuario que quieras borrar}`: Eliminar un usuario por ID.
- `curl http://127.0.0.1:5000/perfiles/{Ingrese el ID del usuario}`: Leer los datos de un usuario por ID.
- `curl -X GET http://127.0.0.1:5000/perfiles/{Ingrese el ID del usuario}`: Manera alternativa de leer los datos de un usuario por ID.
- `curl.exe -X PUT -H "Content-Type: application/json" -d "{\"email\": \"email.actualizado@curlexe.com\"}" http://127.0.0.1:5000/perfiles/{Ingrese el ID del usuario}`: Actualizar los datos de un usuario por ID.
- Nota: En el comando PUT se está actualizando el email a manera de ejemplo. 
