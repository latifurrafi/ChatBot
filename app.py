from flask import Flask, request, jsonify, send_from_directory, session
from flask_cors import CORS
import google.generativeai as genai
import os

from dotenv import load_dotenv, dotenv_values 
# loading variables from .env file
load_dotenv() 

# accessing and printing value
API_KEY = os.getenv('GENAI_API_KEY')

app = Flask(__name__, static_folder='.')
app.secret_key = os.urandom(24)  # Required for session management
CORS(app)  # Enable CORS for all routes

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

        # Check if there is previous context in the session
        if 'chat_history' not in session:
            session['chat_history'] = []

        # Add user message to chat history
        session['chat_history'].append(f"User: {user_message}")

        # Combine all prior messages for context
        context = "\n".join(session.get('chat_history'))

        print(context)

        # Generate response using Gemini with context
        response = model.generate_content(context)

        # Add AI's response to the chat history
        session['chat_history'].append(f"{response.text}")


        return jsonify({
            'response': response.text
        })
    except Exception as e:
        print(f"Error: {str(e)}")  # Add logging for debugging
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
