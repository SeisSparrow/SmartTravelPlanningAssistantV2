/**
 * MCP Client for Smart Travel Planning Assistant
 * Handles connections to various MCP servers for travel services
 */

class MCPClient {
    constructor() {
        this.servers = new Map();
        this.connections = new Map();
        this.toolLog = [];
        this.statusCallbacks = new Map();
        
        // Define available MCP servers for travel services
        this.availableServers = {
            weather: {
                name: 'Weather Service',
                description: 'Get weather forecasts and conditions',
                icon: 'fa-cloud-sun',
                tools: ['get_weather', 'get_forecast', 'get_weather_alerts']
            },
            maps: {
                name: 'Map Service',
                description: 'Location search and geocoding',
                icon: 'fa-map-marked-alt',
                tools: ['search_location', 'get_coordinates', 'get_place_details']
            },
            restaurants: {
                name: 'Restaurant Finder',
                description: 'Find restaurants and dining options',
                icon: 'fa-utensils',
                tools: ['search_restaurants', 'get_restaurant_details', 'get_reviews']
            },
            flights: {
                name: 'Flight Search',
                description: 'Search and book flights',
                icon: 'fa-plane-departure',
                tools: ['search_flights', 'get_flight_details', 'check_prices']
            },
            hotels: {
                name: 'Hotel Booking',
                description: 'Find and book hotels',
                icon: 'fa-hotel',
                tools: ['search_hotels', 'get_hotel_details', 'check_availability']
            }
        };
        
        this.initializeClient();
    }

    async initializeClient() {
        console.log('Initializing MCP Client...');
        this.updateConnectionStatus('connecting');
        
        try {
            // Simulate MCP server connections (in a real implementation,
            // these would be actual MCP server connections)
            await this.simulateConnections();
            this.updateConnectionStatus('connected');
            this.logActivity('MCP Client initialized successfully');
        } catch (error) {
            console.error('Failed to initialize MCP Client:', error);
            this.updateConnectionStatus('disconnected');
            this.logActivity('Failed to initialize MCP Client', 'error');
        }
    }

    async simulateConnections() {
        // Simulate connecting to different MCP servers
        for (const [serverId, serverConfig] of Object.entries(this.availableServers)) {
            try {
                await this.connectToServer(serverId, serverConfig);
            } catch (error) {
                console.warn(`Failed to connect to ${serverId} server:`, error);
                this.updateServerStatus(serverId, 'error');
            }
        }
    }

    async connectToServer(serverId, serverConfig) {
        console.log(`Connecting to ${serverId} server...`);
        
        // Simulate connection delay
        await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));
        
        // Simulate successful connection (in real implementation, this would be actual MCP connection)
        const connection = {
            id: serverId,
            name: serverConfig.name,
            status: 'connected',
            tools: serverConfig.tools,
            lastActivity: new Date()
        };
        
        this.connections.set(serverId, connection);
        this.updateServerStatus(serverId, 'connected');
        this.logActivity(`Connected to ${serverConfig.name}`, 'success');
        
        return connection;
    }

    async callTool(serverId, toolName, parameters = {}) {
        const connection = this.connections.get(serverId);
        
        if (!connection) {
            throw new Error(`Server ${serverId} is not connected`);
        }
        
        if (!connection.tools.includes(toolName)) {
            throw new Error(`Tool ${toolName} is not available on server ${serverId}`);
        }
        
        this.logActivity(`Calling ${toolName} on ${connection.name}`, 'info', parameters);
        this.updateServerStatus(serverId, 'loading');
        
        try {
            // Simulate tool execution (in real implementation, this would call actual MCP tools)
            const result = await this.simulateToolCall(serverId, toolName, parameters);
            
            this.logActivity(`Successfully executed ${toolName}`, 'success', result);
            this.updateServerStatus(serverId, 'connected');
            
            return result;
        } catch (error) {
            this.logActivity(`Failed to execute ${toolName}: ${error.message}`, 'error');
            this.updateServerStatus(serverId, 'error');
            throw error;
        }
    }

    async simulateToolCall(serverId, toolName, parameters) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, Math.random() * 1500 + 800));
        
        // Simulate different responses based on server and tool
        switch (serverId) {
            case 'weather':
                return this.simulateWeatherTool(toolName, parameters);
            case 'maps':
                return this.simulateMapsTool(toolName, parameters);
            case 'restaurants':
                return this.simulateRestaurantsTool(toolName, parameters);
            case 'flights':
                return this.simulateFlightsTool(toolName, parameters);
            case 'hotels':
                return this.simulateHotelsTool(toolName, parameters);
            default:
                throw new Error(`Unknown server: ${serverId}`);
        }
    }

    simulateWeatherTool(toolName, parameters) {
        switch (toolName) {
            case 'get_weather':
                return {
                    location: parameters.location || 'Unknown',
                    temperature: Math.floor(Math.random() * 30) + 10,
                    condition: ['Sunny', 'Cloudy', 'Rainy', 'Partly Cloudy'][Math.floor(Math.random() * 4)],
                    humidity: Math.floor(Math.random() * 40) + 40,
                    wind_speed: Math.floor(Math.random() * 20) + 5,
                    timestamp: new Date().toISOString()
                };
            case 'get_forecast':
                return {
                    location: parameters.location || 'Unknown',
                    days: Array.from({ length: 5 }, (_, i) => ({
                        date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                        high: Math.floor(Math.random() * 30) + 15,
                        low: Math.floor(Math.random() * 20) + 5,
                        condition: ['Sunny', 'Cloudy', 'Rainy', 'Partly Cloudy'][Math.floor(Math.random() * 4)]
                    }))
                };
            default:
                throw new Error(`Unknown weather tool: ${toolName}`);
        }
    }

    simulateMapsTool(toolName, parameters) {
        switch (toolName) {
            case 'search_location':
                return {
                    query: parameters.query || 'Unknown',
                    results: [
                        {
                            name: `${parameters.query} City Center`,
                            address: `123 Main St, ${parameters.query}`,
                            coordinates: { lat: 40.7128 + Math.random() * 0.1, lng: -74.0060 + Math.random() * 0.1 },
                            type: 'city'
                        },
                        {
                            name: `${parameters.query} Airport`,
                            address: `Airport Rd, ${parameters.query}`,
                            coordinates: { lat: 40.7128 + Math.random() * 0.2, lng: -74.0060 + Math.random() * 0.2 },
                            type: 'airport'
                        }
                    ]
                };
            case 'get_coordinates':
                return {
                    location: parameters.location || 'Unknown',
                    coordinates: {
                        lat: 40.7128 + Math.random() * 0.5,
                        lng: -74.0060 + Math.random() * 0.5
                    },
                    timezone: 'America/New_York'
                };
            default:
                throw new Error(`Unknown maps tool: ${toolName}`);
        }
    }

    simulateRestaurantsTool(toolName, parameters) {
        switch (toolName) {
            case 'search_restaurants':
                return {
                    location: parameters.location || 'Unknown',
                    cuisine: parameters.cuisine || 'Any',
                    results: Array.from({ length: 5 }, (_, i) => ({
                        id: i + 1,
                        name: [`The ${parameters.cuisine || 'Local'} Kitchen`, 'Bella Vista', 'Ocean Breeze', 'Mountain View', 'City Lights'][i],
                        rating: (Math.random() * 2 + 3).toFixed(1),
                        price_level: ['$', '$$', '$$$'][Math.floor(Math.random() * 3)],
                        address: `${i + 1}00 Main St, ${parameters.location || 'Unknown'}`,
                        phone: `+1 (555) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`
                    }))
                };
            default:
                throw new Error(`Unknown restaurants tool: ${toolName}`);
        }
    }

    simulateFlightsTool(toolName, parameters) {
        switch (toolName) {
            case 'search_flights':
                return {
                    from: parameters.from || 'Unknown',
                    to: parameters.to || 'Unknown',
                    date: parameters.date || new Date().toISOString().split('T')[0],
                    results: Array.from({ length: 3 }, (_, i) => ({
                        flight_number: `${['AA', 'UA', 'DL'][i]}${Math.floor(Math.random() * 900) + 100}`,
                        airline: ['American Airlines', 'United Airlines', 'Delta Air Lines'][i],
                        departure_time: `${Math.floor(Math.random() * 12) + 6}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')} AM`,
                        arrival_time: `${Math.floor(Math.random() * 12) + 1}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')} PM`,
                        duration: `${Math.floor(Math.random() * 3) + 2}h ${Math.floor(Math.random() * 60).toString().padStart(2, '0')}m`,
                        price: Math.floor(Math.random() * 500) + 200,
                        stops: Math.floor(Math.random() * 3)
                    }))
                };
            default:
                throw new Error(`Unknown flights tool: ${toolName}`);
        }
    }

    simulateHotelsTool(toolName, parameters) {
        switch (toolName) {
            case 'search_hotels':
                return {
                    location: parameters.location || 'Unknown',
                    check_in: parameters.check_in || new Date().toISOString().split('T')[0],
                    check_out: parameters.check_out || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    results: Array.from({ length: 4 }, (_, i) => ({
                        name: ['Grand Hotel', 'City Center Inn', 'Beachside Resort', 'Mountain Lodge'][i],
                        rating: (Math.random() * 2 + 3).toFixed(1),
                        price_per_night: Math.floor(Math.random() * 200) + 100,
                        amenities: ['WiFi', 'Pool', 'Gym', 'Restaurant', 'Spa'].slice(0, Math.floor(Math.random() * 3) + 2),
                        address: `${i + 1}00 Hotel St, ${parameters.location || 'Unknown'}`
                    }))
                };
            default:
                throw new Error(`Unknown hotels tool: ${toolName}`);
        }
    }

    // UI Update Methods
    updateConnectionStatus(status) {
        const statusElement = document.getElementById('mcp-status');
        if (statusElement) {
            statusElement.className = `status-indicator ${status}`;
            statusElement.innerHTML = `<i class="fas fa-circle"></i> MCP ${status.charAt(0).toUpperCase() + status.slice(1)}`;
        }
    }

    updateServerStatus(serverId, status) {
        const statusElement = document.getElementById(`${serverId}-status`);
        if (statusElement) {
            const dot = statusElement.querySelector('.status-dot');
            if (dot) {
                dot.className = `status-dot ${status}`;
            }
        }
    }

    logActivity(message, type = 'info', data = null) {
        const timestamp = new Date().toLocaleTimeString();
        const activity = {
            timestamp,
            message,
            type,
            data
        };
        
        this.toolLog.unshift(activity);
        
        // Keep only last 50 activities
        if (this.toolLog.length > 50) {
            this.toolLog = this.toolLog.slice(0, 50);
        }
        
        this.updateActivityLog();
    }

    updateActivityLog() {
        const logElement = document.getElementById('tool-log');
        if (!logElement) return;
        
        logElement.innerHTML = this.toolLog.map(activity => `
            <div class="log-entry ${activity.type}">
                <span class="timestamp">${activity.timestamp}</span>
                <span class="activity">${activity.message}</span>
            </div>
        `).join('');
    }

    // Utility Methods
    getConnectionStatus(serverId) {
        const connection = this.connections.get(serverId);
        return connection ? connection.status : 'disconnected';
    }

    getAvailableTools(serverId) {
        const connection = this.connections.get(serverId);
        return connection ? connection.tools : [];
    }

    getAllConnections() {
        return Array.from(this.connections.values());
    }

    // Event Registration
    onStatusChange(callback) {
        this.statusCallbacks.set(callback, callback);
    }

    offStatusChange(callback) {
        this.statusCallbacks.delete(callback);
    }

    notifyStatusChange(serverId, status) {
        this.statusCallbacks.forEach(callback => {
            try {
                callback(serverId, status);
            } catch (error) {
                console.error('Error in status callback:', error);
            }
        });
    }
}

// Create global MCP client instance
window.mcpClient = new MCPClient();
