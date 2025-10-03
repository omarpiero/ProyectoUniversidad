import uuid
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
import os

# Initialization of the Flask application
app = Flask(__name__)
# Enable CORS for smooth communication with the frontend
CORS(app)

# Path to the file that will function as our database
DB_FILE = 'perfiles.json'

def read_db():
    """Safely reads the profile database from the JSON file."""
    if not os.path.exists(DB_FILE):
        return {}
    try:
        with open(DB_FILE, 'r', encoding='utf-8') as f:
            content = f.read()
            if not content:
                return {}
            return json.loads(content)
    except (IOError, json.JSONDecodeError):
        return {}

def write_db(data):
    """Writes the profile data to the JSON file."""
    with open(DB_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=4, ensure_ascii=False)

# --- RESTful API ENDPOINTS ---

@app.route('/perfiles', methods=['POST'])
def create_profile():
    """Creates a new profile with default values."""
    data = request.json
    if not data or 'nombre_perfil' not in data or 'email' not in data:
        return jsonify({"error": "Fields 'nombre_perfil' and 'email' are missing"}), 400

    db = read_db()
    
    new_profile = {
        "id": str(uuid.uuid4()),
        "nombre_perfil": data['nombre_perfil'],
        "email": data['email'],
        "preferencias": {
            "length": 16,
            "uppercase": True,
            "lowercase": True,
            "numbers": True,
            "symbols": True
        },
        "historial": []
    }
    
    db[new_profile['id']] = new_profile
    write_db(db)
    
    return jsonify(new_profile), 201

@app.route('/perfiles', methods=['GET'])
def get_all_profiles():
    """Gets a list of all profiles."""
    db = read_db()
    return jsonify(list(db.values())), 200

@app.route('/perfiles/<profile_id>', methods=['GET'])
def get_profile(profile_id):
    """Gets a specific profile by its ID."""
    db = read_db()
    profile = db.get(profile_id)
    if profile:
        return jsonify(profile), 200
    return jsonify({"error": "Profile not found"}), 404

@app.route('/perfiles/<profile_id>', methods=['PUT'])
def update_profile(profile_id):
    """Updates an existing profile (history or preferences)."""
    db = read_db()
    if profile_id not in db:
        return jsonify({"error": "Profile not found"}), 404
    
    update_data = request.json
    if not update_data:
        return jsonify({"error": "No data provided for update"}), 400
        
    db[profile_id].update(update_data)
    write_db(db)
    
    return jsonify(db[profile_id]), 200

@app.route('/perfiles/<profile_id>', methods=['DELETE'])
def delete_profile(profile_id):
    """Deletes a profile by its ID."""
    db = read_db()
    if profile_id in db:
        deleted_profile = db.pop(profile_id)
        write_db(db)
        return jsonify({"message": "Profile deleted successfully", "perfil": deleted_profile}), 200
    return jsonify({"error": "Profile not found"}), 404

if __name__ == '__main__':
    app.run(debug=True, port=5000)

