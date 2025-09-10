/**
 * Smart Travel Planning Assistant
 * Main application logic that integrates MCP tools with natural language processing
 */

class TravelAssistant {
    constructor() {
        this.mcpClient = window.mcpClient;
        this.chatInterface = window.chatInterface;
        
        // Override the chat interface's processMessage method
        this.chatInterface.processMessage = this.processMessage.bind(this);
        
        this.initializeAssistant();
    }

    async initializeAssistant() {
        console.log('Initializing Travel Assistant...');
        
        // Wait for MCP client to be ready
        if (this.mcpClient.connections.size === 0) {
            setTimeout(() => this.initializeAssistant(), 1000);
            return;
        }
        
        console.log('Travel Assistant ready!');
        this.chatInterface.addMessage("🌍 I'm ready to help you plan your perfect trip! I have access to real-time data about weather, locations, restaurants, flights, and hotels. What would you like to know?", 'assistant');
    }

    async processMessage(messageText) {
        console.log('Processing message:', messageText);
        
        try {
            // Analyze the message to determine intent and required tools
            const analysis = this.analyzeMessage(messageText);
            console.log('Message analysis:', analysis);
            
            // Execute the appropriate tools based on analysis
            const results = await this.executeTools(analysis);
            console.log('Tool execution results:', results);
            
            // Generate a natural language response
            const response = this.generateResponse(analysis, results);
            
            return response;
            
        } catch (error) {
            console.error('Error processing message:', error);
            return "I apologize, but I encountered an error while processing your request. Please try rephrasing your question or ask about something else.";
        }
    }

    analyzeMessage(messageText) {
        const lowerText = messageText.toLowerCase();
        const analysis = {
            intent: 'general',
            entities: {},
            tools: [],
            confidence: 0.5
        };

        // Weather-related queries
        if (lowerText.includes('weather') || lowerText.includes('temperature') || lowerText.includes('forecast')) {
            analysis.intent = 'weather_inquiry';
            analysis.tools.push('weather');
            
            // Extract location
            const locationMatch = messageText.match(/in\s+([A-Za-z\s]+?)(?:\?|$|\s+for|\s+next|\s+this)/i);
            if (locationMatch) {
                analysis.entities.location = locationMatch[1].trim();
            }
            
            // Extract time frame
            if (lowerText.includes('next week')) {
                analysis.entities.timeframe = 'next_week';
            } else if (lowerText.includes('tomorrow')) {
                analysis.entities.timeframe = 'tomorrow';
            } else if (lowerText.includes('today')) {
                analysis.entities.timeframe = 'today';
            }
            
            analysis.confidence = 0.8;
        }

        // Restaurant-related queries
        else if (lowerText.includes('restaurant') || lowerText.includes('food') || lowerText.includes('eat') || lowerText.includes('dining')) {
            analysis.intent = 'restaurant_inquiry';
            analysis.tools.push('restaurants');
            
            // Extract location
            const locationMatch = messageText.match(/near\s+([A-Za-z\s]+?)(?:\?|$|\s+or|\s+and)/i);
            if (locationMatch) {
                analysis.entities.location = locationMatch[1].trim();
            }
            
            // Extract cuisine type
            const cuisineMatch = messageText.match(/(Italian|Chinese|Mexican|Japanese|Indian|French|Thai|Greek|Spanish|American)\s+food/i);
            if (cuisineMatch) {
                analysis.entities.cuisine = cuisineMatch[1];
            }
            
            analysis.confidence = 0.8;
        }

        // Flight-related queries
        else if (lowerText.includes('flight') || lowerText.includes('fly') || lowerText.includes('airport') || lowerText.includes('plane')) {
            analysis.intent = 'flight_inquiry';
            analysis.tools.push('flights');
            
            // Extract origin and destination
            const flightMatch = messageText.match(/from\s+([A-Za-z\s]+?)\s+to\s+([A-Za-z\s]+?)(?:\?|$|\s+on|\s+for)/i);
            if (flightMatch) {
                analysis.entities.origin = flightMatch[1].trim();
                analysis.entities.destination = flightMatch[2].trim();
            }
            
            // Extract date
            const dateMatch = messageText.match(/on\s+(\w+\s+\d{1,2},?\s+\d{4}|\w+\s+\d{1,2}|\d{1,2}\/\d{1,2}\/\d{4})/i);
            if (dateMatch) {
                analysis.entities.date = dateMatch[1];
            }
            
            analysis.confidence = 0.7;
        }

        // Hotel-related queries
        else if (lowerText.includes('hotel') || lowerText.includes('stay') || lowerText.includes('accommodation')) {
            analysis.intent = 'hotel_inquiry';
            analysis.tools.push('hotels');
            
            // Extract location
            const locationMatch = messageText.match(/in\s+([A-Za-z\s]+?)(?:\?|$|\s+from|\s+on)/i);
            if (locationMatch) {
                analysis.entities.location = locationMatch[1].trim();
            }
            
            analysis.confidence = 0.7;
        }

        // Location/Map-related queries
        else if (lowerText.includes('where is') || lowerText.includes('location') || lowerText.includes('address') || lowerText.includes('coordinates')) {
            analysis.intent = 'location_inquiry';
            analysis.tools.push('maps');
            
            // Extract location query
            const locationMatch = messageText.match(/where is\s+([A-Za-z\s]+?)(?:\?|$)/i);
            if (locationMatch) {
                analysis.entities.query = locationMatch[1].trim();
            }
            
            analysis.confidence = 0.8;
        }

        // Travel planning queries
        else if (lowerText.includes('plan') || lowerText.includes('trip') || lowerText.includes('itinerary') || lowerText.includes('visit')) {
            analysis.intent = 'travel_planning';
            analysis.tools.push('weather', 'maps', 'restaurants', 'hotels');
            
            // Extract destination
            const destinationMatch = messageText.match(/(?:plan|visit|trip to)\s+([A-Za-z\s]+?)(?:\?|$|\s+for|\s+on)/i);
            if (destinationMatch) {
                analysis.entities.destination = destinationMatch[1].trim();
            }
            
            // Extract duration
            const durationMatch = messageText.match(/(\d+)\s*(?:day|days)/i);
            if (durationMatch) {
                analysis.entities.duration = parseInt(durationMatch[1]);
            }
            
            analysis.confidence = 0.6;
        }

        return analysis;
    }

    async executeTools(analysis) {
        const results = {};
        
        for (const tool of analysis.tools) {
            try {
                switch (tool) {
                    case 'weather':
                        results.weather = await this.executeWeatherTools(analysis.entities);
                        break;
                    case 'restaurants':
                        results.restaurants = await this.executeRestaurantTools(analysis.entities);
                        break;
                    case 'flights':
                        results.flights = await this.executeFlightTools(analysis.entities);
                        break;
                    case 'hotels':
                        results.hotels = await this.executeHotelTools(analysis.entities);
                        break;
                    case 'maps':
                        results.maps = await this.executeMapTools(analysis.entities);
                        break;
                }
            } catch (error) {
                console.error(`Error executing ${tool} tools:`, error);
                results[tool] = { error: error.message };
            }
        }
        
        return results;
    }

    async executeWeatherTools(entities) {
        const results = {};
        
        if (entities.location) {
            // Get current weather
            const currentWeather = await this.mcpClient.callTool('weather', 'get_weather', {
                location: entities.location
            });
            results.current = currentWeather;
            
            // Get forecast if timeframe is specified
            if (entities.timeframe === 'next_week') {
                const forecast = await this.mcpClient.callTool('weather', 'get_forecast', {
                    location: entities.location
                });
                results.forecast = forecast;
            }
        }
        
        return results;
    }

    async executeRestaurantTools(entities) {
        if (!entities.location) {
            throw new Error('Location is required for restaurant search');
        }
        
        const parameters = {
            location: entities.location
        };
        
        if (entities.cuisine) {
            parameters.cuisine = entities.cuisine;
        }
        
        return await this.mcpClient.callTool('restaurants', 'search_restaurants', parameters);
    }

    async executeFlightTools(entities) {
        const parameters = {};
        
        if (entities.origin) {
            parameters.from = entities.origin;
        }
        
        if (entities.destination) {
            parameters.to = entities.destination;
        }
        
        if (entities.date) {
            parameters.date = entities.date;
        } else {
            parameters.date = new Date().toISOString().split('T')[0];
        }
        
        return await this.mcpClient.callTool('flights', 'search_flights', parameters);
    }

    async executeHotelTools(entities) {
        if (!entities.location) {
            throw new Error('Location is required for hotel search');
        }
        
        const parameters = {
            location: entities.location
        };
        
        if (entities.check_in) {
            parameters.check_in = entities.check_in;
        }
        
        if (entities.check_out) {
            parameters.check_out = entities.check_out;
        }
        
        return await this.mcpClient.callTool('hotels', 'search_hotels', parameters);
    }

    async executeMapTools(entities) {
        if (!entities.query && !entities.location) {
            throw new Error('Query or location is required for map search');
        }
        
        const parameters = {};
        
        if (entities.query) {
            parameters.query = entities.query;
            return await this.mcpClient.callTool('maps', 'search_location', parameters);
        } else if (entities.location) {
            parameters.location = entities.location;
            return await this.mcpClient.callTool('maps', 'get_coordinates', parameters);
        }
    }

    generateResponse(analysis, results) {
        let response = '';
        
        switch (analysis.intent) {
            case 'weather_inquiry':
                response = this.generateWeatherResponse(results.weather, analysis.entities);
                break;
            case 'restaurant_inquiry':
                response = this.generateRestaurantResponse(results.restaurants, analysis.entities);
                break;
            case 'flight_inquiry':
                response = this.generateFlightResponse(results.flights, analysis.entities);
                break;
            case 'hotel_inquiry':
                response = this.generateHotelResponse(results.hotels, analysis.entities);
                break;
            case 'location_inquiry':
                response = this.generateLocationResponse(results.maps, analysis.entities);
                break;
            case 'travel_planning':
                response = this.generateTravelPlanningResponse(results, analysis.entities);
                break;
            default:
                response = this.generateGeneralResponse();
        }
        
        return response;
    }

    generateWeatherResponse(weatherData, entities) {
        if (!weatherData || weatherData.error) {
            return "I couldn't retrieve weather information. Please try again or specify a different location.";
        }
        
        let response = `Here's the weather information for ${entities.location}:\n\n`;
        
        if (weatherData.current) {
            const current = weatherData.current;
            response += `**Current Weather:**\n`;
            response += `🌡️ Temperature: ${current.temperature}°C\n`;
            response += `☁️ Condition: ${current.condition}\n`;
            response += `💧 Humidity: ${current.humidity}%\n`;
            response += `💨 Wind Speed: ${current.wind_speed} km/h\n\n`;
        }
        
        if (weatherData.forecast) {
            response += `**5-Day Forecast:**\n`;
            weatherData.forecast.days.forEach(day => {
                response += `📅 ${day.date}: ${day.condition}, High: ${day.high}°C, Low: ${day.low}°C\n`;
            });
        }
        
        return response;
    }

    generateRestaurantResponse(restaurantData, entities) {
        if (!restaurantData || restaurantData.error) {
            return "I couldn't find restaurant information. Please try again or specify a different location.";
        }
        
        let response = `Here are some restaurant recommendations near ${entities.location}:\n\n`;
        
        if (entities.cuisine) {
            response += `**${entities.cuisine} Restaurants:**\n`;
        } else {
            response += `**Top Restaurants:**\n`;
        }
        
        restaurantData.results.forEach((restaurant, index) => {
            response += `${index + 1}. **${restaurant.name}**\n`;
            response += `   ⭐ Rating: ${restaurant.rating}/5\n`;
            response += `   💰 Price: ${restaurant.price_level}\n`;
            response += `   📍 Address: ${restaurant.address}\n`;
            response += `   📞 Phone: ${restaurant.phone}\n\n`;
        });
        
        return response;
    }

    generateFlightResponse(flightData, entities) {
        if (!flightData || flightData.error) {
            return "I couldn't find flight information. Please try again or specify different locations.";
        }
        
        let response = `Here are some flight options from ${entities.origin} to ${entities.destination}:\n\n`;
        
        flightData.results.forEach((flight, index) => {
            response += `${index + 1}. **${flight.airline} - ${flight.flight_number}**\n`;
            response += `   ✈️ Departure: ${flight.departure_time}\n`;
            response += `   🛬 Arrival: ${flight.arrival_time}\n`;
            response += `   ⏱️ Duration: ${flight.duration}\n`;
            response += `   💰 Price: $${flight.price}\n`;
            response += `   🔄 Stops: ${flight.stops === 0 ? 'Direct' : flight.stops + ' stop(s)'}\n\n`;
        });
        
        return response;
    }

    generateHotelResponse(hotelData, entities) {
        if (!hotelData || hotelData.error) {
            return "I couldn't find hotel information. Please try again or specify a different location.";
        }
        
        let response = `Here are some hotel options in ${entities.location}:\n\n`;
        
        hotelData.results.forEach((hotel, index) => {
            response += `${index + 1}. **${hotel.name}**\n`;
            response += `   ⭐ Rating: ${hotel.rating}/5\n`;
            response += `   💰 Price per night: $${hotel.price_per_night}\n`;
            response += `   📍 Address: ${hotel.address}\n`;
            response += `   🏨 Amenities: ${hotel.amenities.join(', ')}\n\n`;
        });
        
        return response;
    }

    generateLocationResponse(locationData, entities) {
        if (!locationData || locationData.error) {
            return "I couldn't find location information. Please try again with a different query.";
        }
        
        if (locationData.results) {
            // Search location response
            let response = `Here are some locations matching "${entities.query}":\n\n`;
            locationData.results.forEach((location, index) => {
                response += `${index + 1}. **${location.name}**\n`;
                response += `   📍 Address: ${location.address}\n`;
                response += `   📍 Coordinates: ${location.coordinates.lat.toFixed(4)}, ${location.coordinates.lng.toFixed(4)}\n`;
                response += `   🏷️ Type: ${location.type}\n\n`;
            });
            return response;
        } else if (locationData.coordinates) {
            // Get coordinates response
            return `Here are the coordinates for ${entities.location}:\n\n` +
                   `📍 Latitude: ${locationData.coordinates.lat.toFixed(4)}\n` +
                   `📍 Longitude: ${locationData.coordinates.lng.toFixed(4)}\n` +
                   `🌍 Timezone: ${locationData.timezone}`;
        }
        
        return "Location information not available.";
    }

    generateTravelPlanningResponse(results, entities) {
        let response = `Here's a travel plan for your ${entities.duration || ''} day trip to ${entities.destination}:\n\n`;
        
        // Weather information
        if (results.weather && results.weather.current) {
            const weather = results.weather.current;
            response += `**Weather:**\n`;
            response += `🌡️ Current temperature: ${weather.temperature}°C\n`;
            response += `☁️ Condition: ${weather.condition}\n\n`;
        }
        
        // Hotel recommendations
        if (results.hotels && results.hotels.results && results.hotels.results.length > 0) {
            response += `**Recommended Hotels:**\n`;
            results.hotels.results.slice(0, 3).forEach((hotel, index) => {
                response += `${index + 1}. **${hotel.name}** - ⭐ ${hotel.rating}/5 - 💰 $${hotel.price_per_night}/night\n`;
            });
            response += '\n';
        }
        
        // Restaurant recommendations
        if (results.restaurants && results.restaurants.results && results.restaurants.results.length > 0) {
            response += `**Top Restaurants:**\n`;
            results.restaurants.results.slice(0, 3).forEach((restaurant, index) => {
                response += `${index + 1}. **${restaurant.name}** - ⭐ ${restaurant.rating}/5 - 💰 ${restaurant.price_level}\n`;
            });
            response += '\n';
        }
        
        response += `**Tips for your trip:**\n`;
        response += `• Check the weather forecast before packing\n`;
        response += `• Book accommodations in advance for better rates\n`;
        response += `• Try local cuisine at recommended restaurants\n`;
        response += `• Consider travel insurance for peace of mind\n`;
        
        return response;
    }

    generateGeneralResponse() {
        return `I'm here to help you plan your perfect trip! I can assist you with:\n\n` +
               `🌤️ **Weather information** - "What's the weather like in Paris next week?"\n` +
               `🍽️ **Restaurant recommendations** - "Find Italian restaurants near the Eiffel Tower"\n` +
               `✈️ **Flight search** - "Find flights from New York to London on March 15"\n` +
               `🏨 **Hotel booking** - "Find hotels in Tokyo with good ratings"\n` +
               `📍 **Location information** - "Where is the Colosseum?"\n` +
               `🗺️ **Travel planning** - "Plan a 5-day trip to Rome"\n\n` +
               `What would you like to know about your next adventure?`;
    }
}

// Initialize the travel assistant when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.travelAssistant = new TravelAssistant();
});
