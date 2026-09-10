require('dotenv').config();
const mongoose = require('mongoose');

const express = require('express');

const app = express();
app.use(express.json());
const PORT = process.env.PORT;

const usersRouter = require('./routes/usersRoutes');
const newsRouter = require('./routes/newsRoutes');


app.use('/api/v1/users', usersRouter);
app.use('/api/v1/users',newsRouter);
const uri = process.env.MONGODB_URI;
mongoose.connect(uri, {}).then(() => {
    console.log("connected to DB");
    app.listen(PORT, () => {
        console.log('Server is running on Port:', PORT)
    })
}).catch((err) => {
    console.error('Failed to connect to DB', err);
    process.exit(1);
})



// // Create a MongoClient with a MongoClientOptions object to set the Stable API version
// const client = new MongoClient(uri, {
//   serverApi: {
//     version: ServerApiVersion.v1,
//     strict: true,
//     deprecationErrors: true,
//   }
// });

// async function run() {
//   try {
//     // Connect the client to the server	(optional starting in v4.7)
//     await client.connect();
//     // Send a ping to confirm a successful connection
//     await client.db("admin").command({ ping: 1 });
//     console.log("Pinged your deployment. You successfully connected to MongoDB!");
//   } finally {
//     // Ensures that the client will close when you finish/error
//     await client.close();
//   }
// }
// run().catch(console.dir);


// module.exports = app;