// State management
let currentRoomId = null;
let chatRooms = {};
let roomCounter = 0;

// DOM Elements
const messagesDiv = document.getElementById('messages');
const chatForm = document.getElementById('chat-form');
const userInput = document.getElementById('user-input');
const themeToggle = document.getElementById('theme-toggle');
const colorOptions = document.querySelectorAll('.color-option');
const sidebar = document.getElementById('sidebar');
const sidebarToggle = document.getElementById('sidebar-toggle');
const sidebarClose = document.getElementById('sidebar-close');
const chatRoomsContainer = document.getElementById('chat-rooms');
const newChatBtn = document.getElementById('new-chat-btn');
const currentRoomTitle = document.getElementById('current-room-title');
const userProfile = document.getElementById('user-profile');
const userMenu = document.getElementById('user-menu');
const voiceInputBtn = document.getElementById('voice-input-btn');

// User profile menu toggle
userProfile.addEventListener('click', (e) => {
    e.stopPropagation();
    userMenu.classList.toggle('open');
});

document.addEventListener('click', () => {
    userMenu.classList.remove('open');
});

// Sidebar toggle
sidebarToggle.addEventListener('click', () => {
    sidebar.classList.add('open');
});

sidebarClose.addEventListener('click', () => {
    sidebar.classList.remove('open');
});

// Theme toggle
themeToggle.addEventListener('click', () => {
    document.documentElement.setAttribute('data-theme',
        document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'
    );
});

// Color theme
colorOptions.forEach(option => {
    option.addEventListener('click', () => {
        const bgColor = option.dataset.color;
        const textColor = option.dataset.text;
        document.documentElement.style.setProperty('--message-bg-ai', bgColor);
        document.documentElement.style.setProperty('--message-bg-user', bgColor);
        document.documentElement.style.setProperty('--text-color', textColor);
        colorOptions.forEach(opt => opt.classList.remove('active'));
        option.classList.add('active');
    });
});

// Extract context from messages

function extractContext(messages) {
    if (!messages || messages.length === 0) return "New Chat";

    // Get the first meaningful user message
    const userMessages = messages.filter(msg => !msg.isAi && msg.text.trim() !== "");
    if (userMessages.length === 0) return "New Chat";

    // Extract the first 50 characters for the title
    const firstMessage = userMessages[0].text.trim();
    return firstMessage.length > 50 ? firstMessage.substring(0, 47) + "..." : firstMessage;
}

function createNewRoom() {
    roomCounter++;
    const roomId = `room-${roomCounter}`;

    chatRooms[roomId] = {
        messages: [],
        created: new Date()
    };

    const roomElement = document.createElement('div');
    roomElement.className = 'chat-room';
    roomElement.dataset.roomId = roomId;
    roomElement.innerHTML = `
<div class="chat-room-content">
    <div class="chat-room-title">New Chat</div>
</div>
`;

    roomElement.addEventListener('click', () => switchRoom(roomId));
    chatRoomsContainer.insertBefore(roomElement, chatRoomsContainer.firstChild);
    return roomId;
}

function updateRoomTitle(roomId) {
    const room = chatRooms[roomId];
    const context = extractContext(room.messages);
    const roomElement = document.querySelector(`[data-room-id="${roomId}"]`);

    if (roomElement) {
        const titleElement = roomElement.querySelector('.chat-room-title');
        titleElement.textContent = context;
    }
}

function switchRoom(roomId) {
    if (currentRoomId === roomId) return;

    document.querySelectorAll('.chat-room').forEach(room => {
        room.classList.toggle('active', room.dataset.roomId === roomId);
    });

    currentRoomId = roomId;

    messagesDiv.innerHTML = '';
    chatRooms[roomId].messages.forEach(msg => {
        addMessage(msg.text, msg.isAi, false);
    });

    sidebar.classList.remove('open');
}

function addMessage(text, isAi, saveToRoom = true) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isAi ? 'ai' : 'user'}`;

    const content = document.createElement('div');
    content.className = 'content typing';

    // If AI message, process Markdown
    if (isAi) {
        content.innerHTML = marked.parse(''); // Initialize empty, will type later
    } else {
        content.textContent = text; // User messages remain plain text
    }

    const timestamp = document.createElement('div');
    timestamp.className = 'timestamp';
    timestamp.textContent = new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });

    messageDiv.appendChild(content);
    messageDiv.appendChild(timestamp);
    messagesDiv.appendChild(messageDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;

    if (isAi) {
        let index = 0;
        function typeWriter() {
            if (index < text.length) {
                content.innerHTML = marked.parse(text.substring(0, index + 1));
                index++;
                setTimeout(typeWriter, 0); // Adjust typing speed
            } else {
                content.classList.remove('typing');
                content.classList.add('blur-fade-in');
                content.innerHTML = marked.parse(text); // Final rendering
            }
        }
        setTimeout(typeWriter, 0);
    } else {
        content.textContent = text;
    }

    if (saveToRoom) {
        chatRooms[currentRoomId].messages.push({ text, isAi });
        updateRoomTitle(currentRoomId);
    }
}




function addLoadingMessage() {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message ai';
    messageDiv.id = 'loading-message';

    const avatar = document.createElement('div');
    avatar.className = 'avatar';
    avatar.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2a3 3 0 0 0-3 3v1h6V5a3 3 0 0 0-3-3Z"/>
            <path d="M19 8v8a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4V8a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4Z"/>
            <path d="M9 12h6"/>
            <path d="M16 9v6"/>
        </svg>
    `;

    const content = document.createElement('div');
    content.className = 'content';
    content.textContent = 'Thinking...';

    messageDiv.appendChild(avatar);
    messageDiv.appendChild(content);
    messagesDiv.appendChild(messageDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function removeLoadingMessage() {
    const loadingMessage = document.getElementById('loading-message');
    if (loadingMessage) {
        loadingMessage.remove();
    }
}

// Event Listeners
chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const message = userInput.value.trim();
    if (!message) return;

    if (!currentRoomId) {
        currentRoomId = createNewRoom();
        switchRoom(currentRoomId);
    }

    addMessage(message, false);
    userInput.value = '';
    addLoadingMessage();

    try {
        const response = await fetch('http://127.0.0.1:5000', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message }),
        });

        removeLoadingMessage();

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        addMessage(data.response, true);
    } catch (error) {
        console.error('Error:', error);
        removeLoadingMessage();
        addMessage('Sorry, there was an error processing your request.', true);
    }
});

newChatBtn.addEventListener('click', () => {
    const newRoomId = createNewRoom();
    switchRoom(newRoomId);
    // Stop voice recognition if running
    if (recognition && recognition.abort) {
        recognition.abort();
    }
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    const chatHistory = document.getElementById('chat-rooms');
    const deleteAllBtn = document.createElement('button');

    deleteAllBtn.textContent = "🗑️ Delete All";
    deleteAllBtn.classList.add("delete-all-btn");
    chatHistory.insertAdjacentElement('beforebegin', deleteAllBtn);

    deleteAllBtn.addEventListener('click', () => {
        if (confirm("Are you sure you want to delete all conversations?")) {
            chatHistory.innerHTML = "";
            localStorage.removeItem('chatRooms');
        }
    });

    function renderChatRooms() {
        chatHistory.innerHTML = "";
        Object.keys(chatRooms).forEach(roomId => {
            const chatItem = document.createElement('div');
            chatItem.className = 'chat-item';
            chatItem.textContent = chatRooms[roomId].name || "Unnamed Chat";

            const optionsBtn = document.createElement('button');
            optionsBtn.textContent = "⋮";
            optionsBtn.classList.add('options-btn');
            chatItem.appendChild(optionsBtn);

            const optionsMenu = document.createElement('div');
            optionsMenu.className = 'options-menu hidden';
            optionsMenu.innerHTML = `
                <button class="share-btn">🔗 Share</button>
                <button class="rename-btn">✏️ Rename</button>
                <button class="delete-btn">🗑️ Delete</button>
            `;
            chatItem.appendChild(optionsMenu);

            optionsBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                optionsMenu.classList.toggle('hidden');
            });

            optionsMenu.querySelector('.delete-btn').addEventListener('click', () => {
                if (confirm("Delete this conversation?")) {
                    delete chatRooms[roomId];
                    localStorage.setItem('chatRooms', JSON.stringify(chatRooms));
                    renderChatRooms();
                }
            });

            optionsMenu.querySelector('.rename-btn').addEventListener('click', () => {
                const newName = prompt("Enter new name:", chatRooms[roomId].name);
                if (newName) {
                    chatRooms[roomId].name = newName;
                    localStorage.setItem('chatRooms', JSON.stringify(chatRooms));
                    renderChatRooms();
                }
            });

            optionsMenu.querySelector('.share-btn').addEventListener('click', () => {
                const chatData = chatRooms[roomId].messages.map(m => `${m.isAi ? "AI: " : "You: "}${m.text}`).join("\n");
                navigator.clipboard.writeText(chatData);
                alert("Conversation copied to clipboard!");
            });

            chatHistory.appendChild(chatItem);
        });
    }

    renderChatRooms();

    // let currentRoomId = null;
    let recognition;


    // 🎙️ Initialize Speech Recognition
    if ('webkitSpeechRecognition' in window) {
        recognition = new webkitSpeechRecognition();
    } else if ('SpeechRecognition' in window) {
        recognition = new SpeechRecognition();
    } else {
        alert("Your browser does not support speech recognition.");
    }

    if (recognition) {
        recognition.continuous = false;
        recognition.lang = "en-US";

        recognition.onstart = () => {
            voiceInputBtn.classList.add('recording');
            voiceInputBtn.textContent = "🎙️ Listening...";
        };

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            userInput.value = transcript;
        };

        recognition.onerror = (event) => {
            console.error("Speech Recognition Error:", event.error);
        };

        recognition.onend = () => {
            voiceInputBtn.classList.remove('recording');
            voiceInputBtn.textContent = "🎤";
            if (userInput.value.trim()) {
                chatForm.dispatchEvent(new Event('submit'));
            }
        };

        voiceInputBtn.addEventListener('click', () => {
            recognition.start();
        });
    }

    const initialRoomId = createNewRoom();
    switchRoom(initialRoomId);
    addMessage('Hello! How can I help you today?', true);
    userInput.focus();



});