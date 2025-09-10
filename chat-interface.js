/**
 * Chat Interface for Smart Travel Planning Assistant
 * Handles user input, message display, and chat functionality
 */

class ChatInterface {
    constructor() {
        this.messages = [];
        this.isTyping = false;
        this.currentMessageId = 0;
        
        this.initializeElements();
        this.setupEventListeners();
        this.loadMessageHistory();
    }

    initializeElements() {
        this.chatMessages = document.getElementById('chat-messages');
        this.chatInput = document.getElementById('chat-input');
        this.sendButton = document.getElementById('send-button');
        this.clearButton = document.getElementById('clear-chat');
        this.typingIndicator = document.getElementById('typing-indicator');
    }

    setupEventListeners() {
        // Send message on button click
        this.sendButton.addEventListener('click', () => this.sendMessage());
        
        // Send message on Enter key (Shift+Enter for new line)
        this.chatInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        // Enable/disable send button based on input
        this.chatInput.addEventListener('input', () => {
            this.sendButton.disabled = this.chatInput.value.trim().length === 0;
        });
        
        // Clear chat button
        this.clearButton.addEventListener('click', () => this.clearChat());
        
        // Auto-resize textarea
        this.chatInput.addEventListener('input', () => {
            this.autoResizeTextarea();
        });
    }

    autoResizeTextarea() {
        this.chatInput.style.height = 'auto';
        this.chatInput.style.height = Math.min(this.chatInput.scrollHeight, 120) + 'px';
    }

    async sendMessage() {
        const messageText = this.chatInput.value.trim();
        
        if (!messageText || this.isTyping) return;
        
        // Add user message
        this.addMessage(messageText, 'user');
        
        // Clear input
        this.chatInput.value = '';
        this.sendButton.disabled = true;
        this.autoResizeTextarea();
        
        // Show typing indicator
        this.showTypingIndicator();
        
        try {
            // Process the message and get response
            const response = await this.processMessage(messageText);
            
            // Hide typing indicator and add assistant response
            this.hideTypingIndicator();
            this.addMessage(response, 'assistant');
            
        } catch (error) {
            console.error('Error processing message:', error);
            this.hideTypingIndicator();
            this.addMessage('I apologize, but I encountered an error processing your request. Please try again.', 'assistant');
        }
        
        // Save message history
        this.saveMessageHistory();
    }

    addMessage(text, sender) {
        const messageId = ++this.currentMessageId;
        const message = {
            id: messageId,
            text,
            sender,
            timestamp: new Date()
        };
        
        this.messages.push(message);
        this.renderMessage(message);
        this.scrollToBottom();
    }

    renderMessage(message) {
        const messageElement = document.createElement('div');
        messageElement.className = `message ${message.sender}-message`;
        messageElement.dataset.messageId = message.id;
        
        const timeString = message.timestamp.toLocaleTimeString();
        
        messageElement.innerHTML = `
            <div class="message-content">
                ${this.formatMessageContent(message.text)}
            </div>
            <div class="message-time">${timeString}</div>
        `;
        
        this.chatMessages.appendChild(messageElement);
    }

    formatMessageContent(text) {
        // Convert URLs to links
        text = text.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
        
        // Convert line breaks to <br> tags
        text = text.replace(/\n/g, '<br>');
        
        // Format code blocks (simple implementation)
        text = text.replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>');
        
        // Format inline code
        text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
        
        // Format bold text
        text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
        
        // Format italic text
        text = text.replace(/\*([^*]+)\*/g, '<em>$1</em>');
        
        return text;
    }

    showTypingIndicator() {
        this.isTyping = true;
        this.typingIndicator.style.display = 'flex';
        this.scrollToBottom();
    }

    hideTypingIndicator() {
        this.isTyping = false;
        this.typingIndicator.style.display = 'none';
    }

    async processMessage(messageText) {
        // This method will be overridden by the TravelAssistant class
        // For now, return a simple response
        return "I'm processing your travel request. This is a placeholder response while the travel assistant logic is being implemented.";
    }

    clearChat() {
        if (confirm('Are you sure you want to clear the chat history?')) {
            this.messages = [];
            this.chatMessages.innerHTML = '';
            this.currentMessageId = 0;
            this.saveMessageHistory();
            
            // Add welcome message back
            this.addMessage(`👋 Hello! I'm your Smart Travel Planning Assistant. I can help you plan your perfect trip using real-time data from various services.

Try asking me things like:
• "What's the weather like in Paris next week?"
• "Find me restaurants near the Eiffel Tower"
• "Plan a 3-day trip to Tokyo"`, 'system');
        }
    }

    scrollToBottom() {
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }

    saveMessageHistory() {
        try {
            const messageData = {
                messages: this.messages.map(msg => ({
                    ...msg,
                    timestamp: msg.timestamp.toISOString()
                })),
                lastMessageId: this.currentMessageId
            };
            localStorage.setItem('travel-assistant-messages', JSON.stringify(messageData));
        } catch (error) {
            console.warn('Failed to save message history:', error);
        }
    }

    loadMessageHistory() {
        try {
            const savedData = localStorage.getItem('travel-assistant-messages');
            if (savedData) {
                const messageData = JSON.parse(savedData);
                this.messages = messageData.messages.map(msg => ({
                    ...msg,
                    timestamp: new Date(msg.timestamp)
                }));
                this.currentMessageId = messageData.lastMessageId || 0;
                
                // Render all saved messages
                this.messages.forEach(message => this.renderMessage(message));
            }
        } catch (error) {
            console.warn('Failed to load message history:', error);
        }
    }

    // Method to add tool call visualization to messages
    addToolCallToMessage(messageId, toolCall) {
        const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
        if (!messageElement) return;

        const toolCallElement = document.createElement('div');
        toolCallElement.className = 'tool-call';
        toolCallElement.innerHTML = `
            <div class="tool-call-header">
                <span class="tool-call-name">${toolCall.name}</span>
                <span class="tool-call-status ${toolCall.status}">${toolCall.status}</span>
            </div>
            ${toolCall.parameters ? `<div class="tool-call-params">Parameters: ${JSON.stringify(toolCall.parameters, null, 2)}</div>` : ''}
            ${toolCall.result ? `<div class="tool-call-result">Result: ${JSON.stringify(toolCall.result, null, 2)}</div>` : ''}
        `;

        messageElement.querySelector('.message-content').appendChild(toolCallElement);
    }

    // Method to update message content
    updateMessage(messageId, newText) {
        const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
        if (!messageElement) return;

        const contentElement = messageElement.querySelector('.message-content');
        if (contentElement) {
            contentElement.innerHTML = this.formatMessageContent(newText);
        }

        // Update in messages array
        const message = this.messages.find(msg => msg.id === messageId);
        if (message) {
            message.text = newText;
            this.saveMessageHistory();
        }
    }
}

// Create global chat interface instance
window.chatInterface = new ChatInterface();
