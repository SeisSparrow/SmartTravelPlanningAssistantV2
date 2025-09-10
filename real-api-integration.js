/**
 * Real API Integration for Smart Travel Planning Assistant
 * Demonstrates how to connect to actual travel APIs instead of mock data
 */

class RealAPIIntegration {
    constructor() {
        // API Keys (you'll need to get your own free keys)
        this.apiKeys = {
            weather: 'YOUR_OPENWEATHERMAP_API_KEY', // Get free at openweathermap.org
            restaurants: 'YOUR_YELP_API_KEY', // Get at yelp.com/developers
            maps: 'YOUR_GOOGLE_MAPS_API_KEY', // Get at console.cloud.google.com
            flights: 'YOUR_AMADEUS_API_KEY', // Get at developers.amadeus.com
            hotels: 'YOUR_BOOKING_API_KEY' // Get at booking.com/api
        };
        
        this.initializeRealAPIs();
    }

    async initializeRealAPIs() {
        console.log('Initializing Real API Integration...');
        
        // Test API connections
        await this.testWeatherAPI();
        await this.testRestaurantAPI();
        await this.testMapsAPI();
        
        console.log('Real APIs ready for integration!');
    }

    // ==========================================
    // WEATHER API - OpenWeatherMap (FREE TIER)
    // ==========================================
    async getRealWeather(location) {
        try {
            const apiKey = this.apiKeys.weather;
            const response = await fetch(
                `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${apiKey}&units=metric`
            );
            
            if (!response.ok) {
                throw new Error(`Weather API error: ${response.status}`);
            }
            
            const data = await response.json();
            
            return {
                location: data.name,
                temperature: Math.round(data.main.temp),
                condition: data.weather[0].description,
                humidity: data.main.humidity,
                wind_speed: Math.round(data.wind.speed * 3.6), // Convert m/s to km/h
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('Weather API error:', error);
            // Fallback to mock data if API fails
            return this.getMockWeather(location);
        }
    }

    async getRealWeatherForecast(location) {
        try {
            const apiKey = this.apiKeys.weather;
            const response = await fetch(
                `https://api.openweathermap.org/data/2.5/forecast?q=${location}&appid=${apiKey}&units=metric`
            );
            
            if (!response.ok) {
                throw new Error(`Weather forecast API error: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Extract 5-day forecast
            const dailyForecasts = {};
            data.list.forEach(item => {
                const date = item.dt_txt.split(' ')[0];
                if (!dailyForecasts[date]) {
                    dailyForecasts[date] = {
                        date: date,
                        high: Math.round(item.main.temp_max),
                        low: Math.round(item.main.temp_min),
                        condition: item.weather[0].description
                    };
                } else {
                    dailyForecasts[date].high = Math.max(dailyForecasts[date].high, Math.round(item.main.temp_max));
                    dailyForecasts[date].low = Math.min(dailyForecasts[date].low, Math.round(item.main.temp_min));
                }
            });
            
            return {
                location: data.city.name,
                days: Object.values(dailyForecasts).slice(0, 5)
            };
        } catch (error) {
            console.error('Weather forecast API error:', error);
            return this.getMockWeatherForecast(location);
        }
    }

    // ==========================================
    // RESTAURANTS API - Yelp Fusion (FREE TIER)
    // ==========================================
    async getRealRestaurants(location, cuisine = null) {
        try {
            const apiKey = this.apiKeys.restaurants;
            const term = cuisine ? `${cuisine} food` : 'restaurants';
            
            const response = await fetch(
                `https://api.yelp.com/v3/businesses/search?location=${location}&term=${term}&limit=5&sort_by=rating`,
                {
                    headers: {
                        'Authorization': `Bearer ${apiKey}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            if (!response.ok) {
                throw new Error(`Yelp API error: ${response.status}`);
            }
            
            const data = await response.json();
            
            return {
                location: location,
                cuisine: cuisine,
                results: data.businesses.map(business => ({
                    id: business.id,
                    name: business.name,
                    rating: business.rating,
                    price_level: business.price || '$',
                    address: business.location.display_address.join(', '),
                    phone: business.display_phone || 'N/A',
                    review_count: business.review_count,
                    url: business.url
                }))
            };
        } catch (error) {
            console.error('Yelp API error:', error);
            return this.getMockRestaurants(location, cuisine);
        }
    }

    // ==========================================
    // MAPS API - Google Maps (FREE TIER)
    // ==========================================
    async getRealLocationSearch(query) {
        try {
            const apiKey = this.apiKeys.maps;
            const response = await fetch(
                `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${query}&key=${apiKey}`
            );
            
            if (!response.ok) {
                throw new Error(`Google Maps API error: ${response.status}`);
            }
            
            const data = await response.json();
            
            return {
                query: query,
                results: data.results.map(place => ({
                    name: place.name,
                    address: place.formatted_address,
                    coordinates: {
                        lat: place.geometry.location.lat,
                        lng: place.geometry.location.lng
                    },
                    type: place.types ? place.types[0] : 'unknown'
                }))
            };
        } catch (error) {
            console.error('Google Maps API error:', error);
            return this.getMockLocationSearch(query);
        }
    }

    // ==========================================
    // FLIGHTS API - Amadeus (DEVELOPER TIER)
    // ==========================================
    async getRealFlights(origin, destination, date) {
        try {
            const apiKey = this.apiKeys.flights;
            // First get access token (Amadeus requires OAuth)
            const tokenResponse = await fetch('https://test.api.amadeus.com/v1/security/oauth2/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: `grant_type=client_credentials&client_id=${apiKey}&client_secret=YOUR_SECRET`
            });
            
            const tokenData = await tokenResponse.json();
            
            // Then search for flights
            const response = await fetch(
                `https://test.api.amadeus.com/v2/shopping/flight-offers?originLocationCode=${origin}&destinationLocationCode=${destination}&departureDate=${date}&adults=1&max=5`,
                {
                    headers: {
                        'Authorization': `Bearer ${tokenData.access_token}`
                    }
                }
            );
            
            if (!response.ok) {
                throw new Error(`Amadeus API error: ${response.status}`);
            }
            
            const data = await response.json();
            
            return {
                from: origin,
                to: destination,
                date: date,
                results: data.data.map((offer, index) => ({
                    flight_number: offer.itineraries[0].segments[0].carrierCode + offer.itineraries[0].segments[0].number,
                    airline: offer.itineraries[0].segments[0].carrierCode,
                    departure_time: offer.itineraries[0].segments[0].departure.at,
                    arrival_time: offer.itineraries[0].segments[0].arrival.at,
                    duration: offer.itineraries[0].duration,
                    price: parseInt(offer.price.total),
                    stops: offer.itineraries[0].segments.length - 1
                }))
            };
        } catch (error) {
            console.error('Amadeus API error:', error);
            return this.getMockFlights(origin, destination, date);
        }
    }

    // ==========================================
    // FALLBACK MOCK DATA (when APIs fail)
    // ==========================================
    getMockWeather(location) {
        return {
            location: location,
            temperature: Math.floor(Math.random() * 30) + 10,
            condition: ['Sunny', 'Cloudy', 'Rainy', 'Partly Cloudy'][Math.floor(Math.random() * 4)],
            humidity: Math.floor(Math.random() * 40) + 40,
            wind_speed: Math.floor(Math.random() * 20) + 5,
            timestamp: new Date().toISOString()
        };
    }

    getMockWeatherForecast(location) {
        return {
            location: location,
            days: Array.from({ length: 5 }, (_, i) => ({
                date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                high: Math.floor(Math.random() * 30) + 15,
                low: Math.floor(Math.random() * 20) + 5,
                condition: ['Sunny', 'Cloudy', 'Rainy', 'Partly Cloudy'][Math.floor(Math.random() * 4)]
            }))
        };
    }

    getMockRestaurants(location, cuisine) {
        return {
            location: location,
            cuisine: cuisine || 'Any',
            results: Array.from({ length: 5 }, (_, i) => ({
                id: i + 1,
                name: [`The ${cuisine || 'Local'} Kitchen`, 'Bella Vista', 'Ocean Breeze', 'Mountain View', 'City Lights'][i],
                rating: (Math.random() * 2 + 3).toFixed(1),
                price_level: ['$', '$$', '$$$'][Math.floor(Math.random() * 3)],
                address: `${i + 1}00 Main St, ${location || 'Unknown'}`,
                phone: `+1 (555) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
                review_count: Math.floor(Math.random() * 500) + 50,
                url: 'https://example.com/restaurant'
            }))
        };
    }

    getMockLocationSearch(query) {
        return {
            query: query,
            results: [
                {
                    name: `${query} City Center`,
                    address: `123 Main St, ${query}`,
                    coordinates: { lat: 40.7128 + Math.random() * 0.1, lng: -74.0060 + Math.random() * 0.1 },
                    type: 'city'
                },
                {
                    name: `${query} Airport`,
                    address: `Airport Rd, ${query}`,
                    coordinates: { lat: 40.7128 + Math.random() * 0.2, lng: -74.0060 + Math.random() * 0.2 },
                    type: 'airport'
                }
            ]
        };
    }

    getMockFlights(origin, destination, date) {
        return {
            from: origin,
            to: destination,
            date: date,
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
    }

    // ==========================================
    // INTEGRATION WITH MAIN APPLICATION
    // ==========================================
    
    // Replace the MCP client's simulateToolCall method with real API calls
    async integrateWithMCPClient(mcpClient) {
        console.log('Integrating real APIs with MCP Client...');
        
        // Override the simulateToolCall method
        const originalSimulateToolCall = mcpClient.simulateToolCall.bind(mcpClient);
        
        mcpClient.simulateToolCall = async (serverId, toolName, parameters) => {
            console.log(`Calling REAL API: ${serverId}.${toolName}`, parameters);
            
            try {
                switch (serverId) {
                    case 'weather':
                        if (toolName === 'get_weather') {
                            return await this.getRealWeather(parameters.location);
                        } else if (toolName === 'get_forecast') {
                            return await this.getRealWeatherForecast(parameters.location);
                        }
                        break;
                        
                    case 'rest
