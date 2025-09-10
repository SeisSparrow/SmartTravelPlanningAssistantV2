# 🚀 Real API Integration Setup Guide

This guide shows you how to connect your Smart Travel Planning Assistant to real travel APIs instead of mock data.

## 📋 Quick Overview

The assistant currently uses **simulated data** for demonstration. To get **real data**, you need to:
1. Get free API keys from travel service providers
2. Replace the mock data calls with real API calls
3. Test the integration

## 🔑 Step 1: Get Your Free API Keys

### 1. Weather API - OpenWeatherMap (FREE)
- **Website**: https://openweathermap.org/api
- **Cost**: Free tier - 1,000 calls/day
- **Sign up**: Create account → Go to API keys → Generate key
- **Key format**: 32-character alphanumeric string

### 2. Restaurants API - Yelp Fusion (FREE)
- **Website**: https://www.yelp.com/developers
- **Cost**: Free tier - 5,000 calls/day
- **Sign up**: Create developer account → Create app → Get API key
- **Key format**: Starts with "Bearer " followed by alphanumeric

### 3. Maps API - Google Maps (FREE with limits)
- **Website**: https://console.cloud.google.com/
- **Cost**: Free tier - $200 credit/month
- **Sign up**: Create project → Enable Places API → Create credentials
- **Key format**: 39-character alphanumeric string

### 4. Flights API - Amadeus (FREE for testing)
- **Website**: https://developers.amadeus.com/
- **Cost**: Free tier - 5,000 calls/month
- **Sign up**: Create account → Get API key & secret
- **Note**: Requires both key and secret for OAuth

### 5. Hotels API - Booking.com (Developer program)
- **Website**: https://developers.booking.com/
- **Cost**: Free for development
- **Sign up**: Apply for developer access → Get API key

## 🛠️ Step 2: Update Your API Keys

Open `real-api-integration.js` and replace the placeholder keys:

```javascript
this.apiKeys = {
    weather: 'YOUR_ACTUAL_OPENWEATHERMAP_KEY',     // Replace with your key
    restaurants: 'YOUR_ACTUAL_YELP_API_KEY',       // Replace with your key
    maps: 'YOUR_ACTUAL_GOOGLE_MAPS_KEY',           // Replace with your key
    flights: 'YOUR_ACTUAL_AMADEUS_KEY',            // Replace with your key
    hotels: 'YOUR_ACTUAL_BOOKING_API_KEY'          // Replace with your key
};
```

## 🔗 Step 3: Integrate with Main Application

Add this to your `index.html` after the other script tags:

```html
<!-- Add real API integration -->
<script src="real-api-integration.js"></script>
<script>
    // Initialize real APIs when page loads
    document.addEventListener('DOMContentLoaded', async () => {
        const realAPI = new RealAPIIntegration();
        
        // Wait for MCP client to be ready
        setTimeout(() => {
            realAPI.integrateWithMCPClient(window.mcpClient);
            console.log('✅ Real APIs integrated!');
        }, 2000);
    });
</script>
```

## 🧪 Step 4: Test Your Integration

Try these queries to test real data:
- **Weather**: "What's the weather in Tokyo right now?"
- **Restaurants**: "Find pizza restaurants in New York"
- **Locations**: "Where is the Eiffel Tower?"
- **Flights**: "Find flights from LAX to JFK tomorrow"

## 📊 Expected Improvements with Real Data

### Before (Mock Data):
- Same restaurant names appear for every city
- Weather is randomly generated
- Locations have fake addresses
- All responses feel artificial

### After (Real APIs):
- **Weather**: Actual current conditions and real forecasts
- **Restaurants**: Real businesses with actual ratings, reviews, and locations
- **Maps**: Real addresses, coordinates, and place information
- **Flights**: Actual flight schedules and real-time prices
- **Hotels**: Real properties with current availability and pricing

## 🚨 Important Notes

### API Limits:
- **Monitor usage**: Keep track of your API call counts
- **Handle rate limits**: The code includes fallback to mock data
- **Cache responses**: Consider caching to reduce API calls

### Privacy & Security:
- **Never commit API keys** to public repositories
- **Use environment variables** for production deployments
- **Implement proper error handling** for API failures

### Cost Management:
- **Start with free tiers** to test functionality
- **Set up billing alerts** to avoid unexpected charges
- **Consider caching strategies
