from flask import Flask, request, jsonify, send_from_directory
import sqlite3
from datetime import datetime

app = Flask(__name__, static_folder='.')
DB_NAME = 'contacts.db'

def init_db():
    """Initialize the SQLite database with contacts table."""
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS contacts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            service TEXT NOT NULL,
            message TEXT NOT NULL,
            submitted_at TEXT NOT NULL
        )
    ''')
    conn.commit()
    conn.close()

@app.route('/')
def index():
    """Serve the main HTML file."""
    return send_from_directory('.', 'index.html')

@app.route('/<path:filename>')
def serve_static(filename):
    """Serve static files."""
    return send_from_directory('.', filename)

@app.route('/api/contact', methods=['POST'])
def submit_contact():
    """Store a new contact form submission."""
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    name = data.get('name')
    email = data.get('email')
    service = data.get('service')
    message = data.get('message')
    
    if not all([name, email, service, message]):
        return jsonify({'error': 'Missing required fields'}), 400
    
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO contacts (name, email, service, message, submitted_at)
        VALUES (?, ?, ?, ?, ?)
    ''', (name, email, service, message, datetime.now().isoformat()))
    
    conn.commit()
    conn.close()
    
    return jsonify({'message': 'Contact submitted successfully', 'id': cursor.lastrowid}), 201

@app.route('/api/contacts', methods=['GET'])
def get_contacts():
    """Fetch all stored contact submissions."""
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute('''
        SELECT id, name, email, service, message, submitted_at
        FROM contacts
        ORDER BY submitted_at DESC
    ''')
    
    contacts = []
    for row in cursor.fetchall():
        contacts.append({
            'id': row[0],
            'name': row[1],
            'email': row[2],
            'service': row[3],
            'message': row[4],
            'submitted_at': row[5]
        })
    
    conn.close()
    return jsonify({'contacts': contacts}), 200

@app.route('/api/contacts/<int:contact_id>', methods=['DELETE'])
def delete_contact(contact_id):
    """Delete a contact submission."""
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute('DELETE FROM contacts WHERE id = ?', (contact_id,))
    conn.commit()
    conn.close()
    
    return jsonify({'message': 'Contact deleted successfully'}), 200

if __name__ == '__main__':
    init_db()
    app.run(host='0.0.0.0', port=8080, debug=True)
