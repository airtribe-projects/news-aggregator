const { MongoClient } = require('mongodb');

const client = new MongoClient(process.env.MONGODB_URI);

async function connectToMongoDB() {
    try {
        await client.connect();
        console.log('You successfully connected to MongoDB!');
    } catch (err) {
        console.dir(err);
    }
}

// The "users" collection inside the "newsAggregator" database.
// Each user looks like: { name, email, password (hashed), preferences: [] }
const usersCollection = client.db('newsAggregator').collection('users');

module.exports = { connectToMongoDB, usersCollection };
