// db/redisClient.js
const redis = require('redis');

// Create a Redis client
const client = redis.createClient({
    host: '127.0.0.1',  // Redis server hostname or IP
    port: 6379,         // Redis server port (default is 6379)
});

// Handle connection events
client.on('connect', () => {
    console.log('Connected to Redis!');
});

client.on('error', (err) => {
    console.error('Redis connection error:', err);
});

// Connect Redis (this is async)
async function connectRedis() {
    try {
        await client.connect();  // Make sure the connection is properly established
    } catch (err) {
        console.error('Failed to connect to Redis:', err);
        process.exit(1);  // If Redis fails, shut down the app
    }
}

// Disconnect Redis gracefully
async function disconnectRedis() {
    try {
        await client.quit();
    } catch (err) {
        console.error('Failed to disconnect from Redis:', err);
    }
}

module.exports = {
    client,
    connectRedis,
    disconnectRedis
};
