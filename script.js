document.addEventListener("DOMContentLoaded", () => {
    const messagesDiv = document.getElementById('messages');
    const chatForm = document.getElementById('chat-form');
    const userInput = document.getElementById('user-input');
    const voiceBtn = document.getElementById('voice-btn');


    function addMessage(text, isAi) {
        const messagesDiv = document.getElementById("messages");
        if (! messagesDiv) {
            console.error("Error: 'messagesDiv' not found!");
            return;
        }

        // Create message container
        const messageDiv = document.createElement("div");
        messageDiv.classList.add("flex", "items-end", "space-x-2", "p-2");

        if (isAi) {
            messageDiv.classList.add("justify-start"); // AI messages align left
        } else {
            messageDiv.classList.add("justify-end"); // User messages align right
        }

        // Avatar
        const avatar = document.createElement("div");
        avatar.classList.add("w-10", "h-10", "flex", "items-center", "justify-center", "rounded-full", "text-white", "font-bold", "shadow-lg");

        if (isAi) {
            avatar.classList.add("bg-gradient-to-r", "from-gray-700", "to-gray-900");
            avatar.textContent = "AI";
        } else {
            avatar.classList.add("bg-gradient-to-r", "from-green-500", "to-lime-500");
            avatar.textContent = "U";
        }

        // Message bubble
        const content = document.createElement("div");
        content.classList.add("max-w-[75%]", "px-4", "py-2", "text-white", "rounded-xl", "shadow-md", "backdrop-blur-md", "bg-opacity-80");

        if (isAi) {
            content.classList.add("bg-gradient-to-r", "from-gray-700", "to-gray-900", "rounded-bl-none");
        } else {
            content.classList.add("bg-gradient-to-r", "from-green-500", "to-lime-500", "rounded-br-none");
        }

        // Placeholder for AI typing effect
        if (isAi) {
            content.innerHTML = "<span class='dots'>...</span>"; // "Thinking..." dots effect
        } else {
            content.textContent = text; // User messages appear instantly
        }

        // Timestamp
        const timestampDiv = document.createElement("div");
        timestampDiv.classList.add("text-xs", "text-gray-300", "mt-1");
        timestampDiv.textContent = new Date().toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true
        });

        // Append elements (Align AI messages left, User messages right)
        if (isAi) {
            messageDiv.appendChild(avatar);
            messageDiv.appendChild(content);
        } else {
            messageDiv.appendChild(content);
            messageDiv.appendChild(avatar);
        } messageDiv.appendChild(timestampDiv);
        messagesDiv.appendChild(messageDiv);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;

        // AI Typing Effect with Markdown Support
        if (isAi) {
            let index = 0;
            setTimeout(() => {
                function typeWriter() {
                    if (index < text.length) { // Apply Markdown as it types
                        content.innerHTML = marked.parse(text.substring(0, index + 1), {sanitize: true});
                        index++;
                        setTimeout(typeWriter, 0); // Adjust typing speed
                    } else {
                        content.classList.add("blur-fade-in");
                        // Fade-in animation
                        // Final Markdown rendering
                        content.innerHTML = marked.parse(text, {sanitize: true});
                    }
                }
                typeWriter();
            }, 500); // Delay before typing starts
        }
    }


    function addLoadingMessage() {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message ai loading';
        messageDiv.id = 'loading-message';

        const avatar = document.createElement('div');
        avatar.className = 'avatar';
        avatar.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2a3 3 0 0 0-3 3v1h6V5a3 3 0 0 0-3-3Z"/>
            <path d="M19 8v8a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4V8a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4Z"/>
            <path d="M9 12h6"/>
            <path d="M16 9v6"/>
        </svg>`;

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

    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const message = userInput.value.trim();
        if (! message) 
            return;
        


        addMessage(message, false);
        userInput.value = '';
        addLoadingMessage();

        try {
            const response = await fetch('http://127.0.0.1:5000/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({message})
            });

            removeLoadingMessage();

            if (! response.ok) {
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

    // Voice to text functionality
    if ('webkitSpeechRecognition' in window) {
        const recognition = new webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        voiceBtn.addEventListener('click', () => {
            recognition.start();
            voiceBtn.classList.add('listening'); // Indicate listening state
        });

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            userInput.value = transcript;
            // Auto-submit the form after recognizing speech
            chatForm.dispatchEvent(new Event('submit'));
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
        };

        recognition.onend = () => {
            voiceBtn.classList.remove('listening');
        };
    } else {
        voiceBtn.disabled = true;
        voiceBtn.title = "Voice recognition not supported in this browser.";
    }

    // Focus input on load
    userInput.focus();
});
