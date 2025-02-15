from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import google.generativeai as genai
import os

app = Flask(__name__, static_folder='.')
CORS(app)  # Enable CORS for all routes

# Configure the API key securely
API_KEY = os.getenv("GENAI_API_KEY")
if not API_KEY:
    raise ValueError("API key not found. Set the 'GENAI_API_KEY' environment variable.")

genai.configure(api_key=API_KEY)

# Initialize the model
model = genai.GenerativeModel('gemini-1.5-flash')

@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/style.css')
def styles():
    return send_from_directory('.', 'style.css')

@app.route('/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        user_message = data.get('message')
        
        if not user_message:
            return jsonify({'error': 'No message provided'}), 400
        
        # Generate response using Gemini
        response = model.generate_content(user_message)
        
        return jsonify({
            'response': response.text
        })
    except Exception as e:
        print(f"Error: {str(e)}")  # Add logging for debugging
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)