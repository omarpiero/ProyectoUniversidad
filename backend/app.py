import uuid
import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy

# --- 1. Configuración de la App y Base de Datos ---

# Inicialización de la aplicación Flask
app = Flask(__name__)
# Habilitar CORS para comunicación con el frontend
CORS(app)

# Configura la ubicación del archivo de la base de datos (SQLite)
basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'perfiles.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Inicializa la extensión SQLAlchemy
db = SQLAlchemy(app)

# --- 2. Definición del Modelo de Datos ---

class Perfil(db.Model):
    """
    Define la tabla 'perfil' en la base de datos.
    Esto reemplaza la estructura del JSON.S
    """
    __tablename__ = 'perfil'
    
    # Columnas de la tabla
    id = db.Column(db.String(36), primary_key=True)
    nombre_perfil = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    
    # Usamos db.JSON para almacenar diccionarios y listas,
    # perfecto para las preferencias y el historial.
    preferencias = db.Column(db.JSON, nullable=False)
    historial = db.Column(db.JSON, nullable=False)

    def to_dict(self):
        """
        Función helper para convertir el objeto Perfil (de Python)
        en un diccionario (para poder enviarlo como JSON).
        """
        return {
            "id": self.id,
            "nombre_perfil": self.nombre_perfil,
            "email": self.email,
            "preferencias": self.preferencias,
            "historial": self.historial
        }

# --- 3. Endpoints de la API RESTful (Refactorizados) ---

@app.route('/perfiles', methods=['POST'])
def create_profile():
    """Crea un nuevo perfil con valores por defecto."""
    data = request.json
    if not data or 'nombre_perfil' not in data or 'email' not in data:
        return jsonify({"error": "Campos 'nombre_perfil' y 'email' son requeridos"}), 400

    # Comprobar si el email ya existe
    if Perfil.query.filter_by(email=data['email']).first():
        return jsonify({"error": "El email ya está en uso"}), 409 # 409 Conflict

    # Crea una instancia del objeto Perfil
    new_profile = Perfil(
        id=str(uuid.uuid4()),
        nombre_perfil=data['nombre_perfil'],
        email=data['email'],
        # Valores por defecto (igual que en tu app original)
        preferencias={
            "length": 16,
            "uppercase": True,
            "lowercase": True,
            "numbers": True,
            "symbols": True
        },
        historial=[]
    )
    
    try:
        # Añade el nuevo objeto a la sesión y guarda en la BD
        db.session.add(new_profile)
        db.session.commit()
        # Devuelve el nuevo perfil como diccionario
        return jsonify(new_profile.to_dict()), 201
    except Exception as e:
        db.session.rollback() # Revierte la transacción en caso de error
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500

@app.route('/perfiles', methods=['GET'])
def get_all_profiles():
    """Obtiene una lista de todos los perfiles."""
    # Consulta todos los perfiles en la tabla
    perfiles_objetos = Perfil.query.all()
    # Convierte cada objeto a un diccionario
    perfiles_dict = [p.to_dict() for p in perfiles_objetos]
    return jsonify(perfiles_dict), 200

@app.route('/perfiles/<profile_id>', methods=['GET'])
def get_profile(profile_id):
    """Obtiene un perfil específico por su ID."""
    # Busca el perfil por su clave primaria (es más rápido que 'filter_by')
    profile = Perfil.query.get(profile_id)
    if profile:
        return jsonify(profile.to_dict()), 200
    return jsonify({"error": "Perfil no encontrado"}), 404

@app.route('/perfiles/<profile_id>', methods=['PUT'])
def update_profile(profile_id):
    """Actualiza un perfil existente (historial, preferencias, etc.)."""
    # Busca el perfil a actualizar
    profile = Perfil.query.get(profile_id)
    if not profile:
        return jsonify({"error": "Perfil no encontrado"}), 404
    
    update_data = request.json
    if not update_data:
        return jsonify({"error": "No hay datos para actualizar"}), 400
        
    # Actualiza los campos del objeto si vienen en el JSON
    if 'historial' in update_data:
        profile.historial = update_data['historial']
    if 'preferencias' in update_data:
        profile.preferencias = update_data['preferencias']
    if 'email' in update_data:
        profile.email = update_data['email']
    if 'nombre_perfil' in update_data:
        profile.nombre_perfil = update_data['nombre_perfil']
    
    try:
        # Guarda (confirma) los cambios en la base de datos
        db.session.commit()
        return jsonify(profile.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Error al actualizar: {str(e)}"}), 500

@app.route('/perfiles/<profile_id>', methods=['DELETE'])
def delete_profile(profile_id):
    """Elimina un perfil por su ID."""
    # Busca el perfil a eliminar
    profile = Perfil.query.get(profile_id)
    if profile:
        try:
            # Captura los datos para devolverlos (opcional pero bueno)
            deleted_profile_data = profile.to_dict()
            # Elimina el objeto de la sesión y guarda los cambios
            db.session.delete(profile)
            db.session.commit()
            return jsonify({"message": "Perfil eliminado exitosamente", "perfil": deleted_profile_data}), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": f"Error al eliminar: {str(e)}"}), 500
    return jsonify({"error": "Perfil no encontrado"}), 404

# --- 4. Ejecución de la Aplicación ---

if __name__ == '__main__':
    # (Opcional) Crea la base de datos y tablas si no existen
    # al iniciar la app.
        
    app.run(debug=True, port=5000)