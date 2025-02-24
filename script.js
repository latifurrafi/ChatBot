document.addEventListener("DOMContentLoaded", () => {
    const messagesDiv = document.getElementById('messages');
    const chatForm = document.getElementById('chat-form');
    const userInput = document.getElementById('user-input');
    const voiceBtn = document.getElementById('voice-btn');

    function loadFuturisticStyles() {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "style.css"; // Ensure this path is correct
        link.id = "futuristic-chat-styles";
        document.head.appendChild(link);
    }
    // Call this function when needed
    loadFuturisticStyles();
    
    // Only add styles if they don't already exist
    if (!document.querySelector('#futuristic-chat-styles')) {
        document.head.appendChild(futuristicStyles);
    }

    function addMessage(text, isAi) {
        const messagesDiv = document.getElementById("messages");
        if (!messagesDiv) {
            console.error("Error: 'messagesDiv' not found!");
            return;
        }

        // Create message container
        const messageDiv = document.createElement("div");
        messageDiv.classList.add("flex", "items-end", "space-x-2", "p-2", "message-container");
        messageDiv.dataset.timestamp = Date.now(); // Store timestamp for future animations

        if (isAi) {
            messageDiv.classList.add("justify-start"); // AI messages align left
        } else {
            messageDiv.classList.add("justify-end"); // User messages align right
        }

        // Avatar with enhanced styling
        const avatar = document.createElement("div");
        avatar.classList.add("w-10", "h-10", "flex", "items-center", "justify-center", "rounded-full", "text-white", "font-bold", "shadow-lg", "avatar");

        if (isAi) {
            avatar.classList.add("bg-gradient-to-r", "from-gray-700", "to-gray-900", "ai");
            avatar.textContent = "AI";
            
            // Add AI indicator animation
            const aiIndicator = document.createElement("div");
            aiIndicator.classList.add("absolute", "-top-1", "-right-1", "w-3", "h-3", "bg-cyan-400", "rounded-full");
            aiIndicator.style.animation = "pulse 1.5s infinite";
            avatar.appendChild(aiIndicator);
        } else {
            avatar.classList.add("bg-gradient-to-r", "from-green-500", "to-lime-500");
            avatar.textContent = "U";
        }

        // Message bubble with futuristic styling
        const content = document.createElement("div");
        content.classList.add("max-w-[75%]", "px-4", "py-2", "text-white", "rounded-xl", "shadow-md", "backdrop-blur-md", "bg-opacity-80", "message-bubble");

        if (isAi) {
            content.classList.add("bg-gradient-to-r", "from-gray-700", "to-gray-900", "rounded-bl-none", "ai-message");
            
            // Create futuristic loading indicator for AI messages
            const loadingContainer = document.createElement("div");
            loadingContainer.classList.add("flex", "items-center", "space-x-1");
            
            // Create the dots container with pulse animation
            const dotsContainer = document.createElement("div");
            dotsContainer.classList.add("dots-container");
            dotsContainer.innerHTML = `
                <span class="dot dot1"></span>
                <span class="dot dot2"></span>
                <span class="dot dot3"></span>
            `;
            
            loadingContainer.appendChild(dotsContainer);
            content.appendChild(loadingContainer);
            
            // Futuristic scanner line effect
            const scannerLine = document.createElement("div");
            scannerLine.classList.add("absolute", "w-full", "h-px", "bg-cyan-400", "left-0", "scan-line");
            scannerLine.style.top = "0";
            scannerLine.style.animation = "scan 2s infinite";
            content.appendChild(scannerLine);
            
            // After a delay, remove the loading indicator and start the typing effect
            setTimeout(() => {
                content.innerHTML = '';
                startTypingEffect(content, text);
            }, 1800); // Wait 1.8 seconds before showing the response
        } else {
            content.textContent = text; // User messages appear instantly
            content.classList.add("bg-gradient-to-r", "from-green-500", "to-lime-500", "rounded-br-none", "user-message");
        }
            
        // Enhanced timestamp with futuristic styling
        const timestampDiv = document.createElement("div");
        timestampDiv.classList.add("text-xs", "text-cyan-300", "mt-1", "opacity-70", "timestamp");
        timestampDiv.textContent = new Date().toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: true
        });

        // Append elements (Align AI messages left, User messages right)
        if (isAi) {
            messageDiv.appendChild(avatar);
            messageDiv.appendChild(content);
        } else {
            messageDiv.appendChild(content);
            messageDiv.appendChild(avatar);
        } 
        messageDiv.appendChild(timestampDiv);
        
        // Add entry animation
        messageDiv.style.animation = "fadeInUp 0.3s forwards";
        messageDiv.style.opacity = "0";
        messageDiv.style.transform = "translateY(20px)";
        
        // Add @keyframes for entry animation if not already present
        if (!document.querySelector('#entry-animation')) {
            const entryAnimation = document.createElement("style");
            entryAnimation.id = 'entry-animation';
            entryAnimation.textContent = `
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                @keyframes scan {
                    0% { top: 0; opacity: 0.8; }
                    50% { top: 100%; opacity: 0.5; }
                    100% { top: 0; opacity: 0.8; }
                }
            `;
            document.head.appendChild(entryAnimation);
        }
        
        messagesDiv.appendChild(messageDiv);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }

    // Function to handle the typing effect with Markdown
    function startTypingEffect(element, text) {
        let index = 0;
        
        // Add a futuristic cursor
        const cursor = document.createElement("span");
        cursor.classList.add("typing-cursor");
        cursor.style.display = "inline-block";
        cursor.style.width = "2px";
        cursor.style.height = "16px";
        cursor.style.backgroundColor = "#00FFFF";
        cursor.style.marginLeft = "2px";
        cursor.style.animation = "blink 1s infinite";
        
        // Add cursor animation
        if (!document.querySelector('#cursor-animation')) {
            const cursorAnimation = document.createElement("style");
            cursorAnimation.id = 'cursor-animation';
            cursorAnimation.textContent = `
                @keyframes blink {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0; }
                }
            `;
            document.head.appendChild(cursorAnimation);
        }
        
        function typeWriter() {
            if (index < text.length) {
                // Process Markdown and add cursor
                element.innerHTML = marked.parse(text.substring(0, index + 1), {sanitize: true});
                element.appendChild(cursor);
                
                // Add random typing speed for more realistic effect
                const typingSpeed = Math.floor(Math.random() * 15) + 5; // 5-20ms
                index++;
                setTimeout(typeWriter, typingSpeed);
            } else {
                cursor.style.display = "none"; // Hide cursor when done
                element.classList.add("blur-fade-in");
                // Final Markdown rendering
                element.innerHTML = marked.parse(text, {sanitize: true});
                
                // Add completion animation
                const completionEffect = document.createElement("div");
                completionEffect.className = "completion-effect";
                completionEffect.style.position = "absolute";
                completionEffect.style.bottom = "0";
                completionEffect.style.left = "0";
                completionEffect.style.width = "100%";
                completionEffect.style.height = "2px";
                completionEffect.style.background = "linear-gradient(90deg, transparent, #00FFFF, transparent)";
                completionEffect.style.animation = "shimmer 2s ease-in-out";
                element.appendChild(completionEffect);
                
                // Add shimmer animation
                if (!document.querySelector('#shimmer-animation')) {
                    const shimmerAnimation = document.createElement("style");
                    shimmerAnimation.id = 'shimmer-animation';
                    shimmerAnimation.textContent = `
                        @keyframes shimmer {
                            0% { transform: translateX(-100%); }
                            100% { transform: translateX(100%); }
                        }
                    `;
                    document.head.appendChild(shimmerAnimation);
                }
            }
        }
        
        typeWriter();
    }

    // Add futuristic sound effects
    function playSound(type) {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        if (type === 'send') {
            // Higher pitch for sending message
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.2);
        } else if (type === 'receive') {
            // Lower pitch for receiving message
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.3);
        }
    }

    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const message = userInput.value.trim();
        if (!message) 
            return;
        
        // Play send sound
        playSound('send');
        
        addMessage(message, false);
        userInput.value = '';
        try {
            const response = await fetch('http://127.0.0.1:5000/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({message})
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            
            // Play receive sound
            playSound('receive');
            
            addMessage(data.response, true);
        } catch (error) {
            console.error('Error:', error);
            addMessage('Sorry, there was an error processing your request.', true);
        }
    });

    // Enhanced voice to text functionality
    if ('webkitSpeechRecognition' in window) {
        const recognition = new webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        voiceBtn.addEventListener('click', () => {
            recognition.start();
            voiceBtn.classList.add('listening');
            
            // Add futuristic pulse ring animation to voice button
            const pulseRing = document.createElement("div");
            pulseRing.classList.add("absolute", "w-full", "h-full", "rounded-full");
            pulseRing.style.border = "2px solid rgba(0, 255, 255, 0.7)";
            pulseRing.style.animation = "pulse-ring 1.5s cubic-bezier(0.215, 0.61, 0.355, 1) infinite";
            voiceBtn.appendChild(pulseRing);
            
            // Add listening sound
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
            gainNode.gain.setValueAtTime(0.05, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.5);
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
            // Remove pulse ring animation
            const pulseRing = voiceBtn.querySelector(".absolute");
            if (pulseRing) {
                pulseRing.remove();
            }
        };
    } else {
        voiceBtn.disabled = true;
        voiceBtn.title = "Voice recognition not supported in this browser.";
    }

    // Focus input on load
    userInput.focus();
    
    // Add futuristic init animation
    const initAnimation = document.createElement("div");
    initAnimation.id = "init-animation";
    initAnimation.style.position = "fixed";
    initAnimation.style.top = "0";
    initAnimation.style.left = "0";
    initAnimation.style.width = "100%";
    initAnimation.style.height = "100%";
    initAnimation.style.background = "black";
    initAnimation.style.display = "flex";
    initAnimation.style.justifyContent = "center";
    initAnimation.style.alignItems = "center";
    initAnimation.style.zIndex = "9999";
    initAnimation.innerHTML = `
        <div style="text-align: center; color: cyan; font-family: monospace;">
            <div style="font-size: 24px; margin-bottom: 20px;">INITIALIZING AI CHAT SYSTEM</div>
            <div class="loading-bar" style="width: 300px; height: 5px; background: rgba(0, 255, 255, 0.2); margin: 0 auto; border-radius: 5px; overflow: hidden;">
                <div class="loading-progress" style="height: 100%; background: cyan; width: 0%; transition: width 2s linear;"></div>
            </div>
            <div class="loading-text" style="margin-top: 10px; font-size: 14px;">Loading system components...</div>
        </div>
    `;
    document.body.appendChild(initAnimation);
    
    // Animate loading bar
    setTimeout(() => {
        const loadingProgress = document.querySelector(".loading-progress");
        if (loadingProgress) {
            loadingProgress.style.width = "100%";
        }
        const loadingText = document.querySelector(".loading-text");
        if (loadingText) {
            loadingText.textContent = "System ready";
        }
    }, 100);
    
    // Remove init animation
    setTimeout(() => {
        initAnimation.style.opacity = "0";
        initAnimation.style.transition = "opacity 0.5s ease";
        setTimeout(() => {
            initAnimation.remove();
        }, 500);
    }, 2000);
});