const express = require('express');
const app = express();
const cors = require('cors');
const { MongoClient } = require('mongodb');
require('dotenv').config()
const ObjectId = require('mongodb').ObjectId;
const port = process.env.PORT || 5000;

app.use(cors())
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.3zfz5.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


async function run() {
    try {
        await client.connect();

        const database = client.db("mansion");
        const reviewsCollection = database.collection("reviews");
        const apartmentsCollection = database.collection("apartments");
        const bookingsCollection = database.collection("bookings");


        //get All Arartments
        app.get('/apartments', async (req, res) => {
            const cursor = apartmentsCollection.find({});
            const result = await cursor.toArray()
            res.json(result)
        })

        //get a specific apartment for booking
        app.get('/apartments/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const result = await apartmentsCollection.findOne(query);
            res.json(result)
        })

        //booking apartment
        app.post('/bookings', async (req, res) => {
            const booking = req.body
            const result = await bookingsCollection.insertOne(booking);
            res.json(result)

        })

        //get all bookings
        app.get('/bookings', async (req, res) => {
            const cursor = bookingsCollection.find({})
            const result = await cursor.toArray()
            res.json(result)
        })

        //delete a booking
        app.delete('/bookings/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await bookingsCollection.deleteOne(query);
            res.send(result)
        })

        //update the status of booking
        app.put('/bookings/:id', async (req, res) => {
            const id = req.params.id
            const filter = { _id: ObjectId(id) }
            const options = { upsert: true }
            const updateDoc = {
                $set: {
                    status: 'Shipped'
                },

            };
            const result = await bookingsCollection.updateOne(filter, updateDoc, options)
            res.send(result)

        })

        //get an user all bookings
        app.get("/mybookings/:email", async (req, res) => {
            const email = req.params.email
            const query = { email: email }
            const result = await bookingsCollection.find(query).toArray();
            res.send(result);
        });

        //delete booking by a user
        app.delete("/mybookings/:id", async (req, res) => {
            const id = (req.params.id);
            const query = { _id: ObjectId(id) }
            const result = await bookingsCollection.deleteOne(query);
            res.send(result);
        });


        //get all reviews
        app.get('/reviews', async (req, res) => {
            const cursor = reviewsCollection.find({});
            const result = await cursor.toArray()
            res.json(result)
        })

        //post a review
        app.post('/reviews', async (req, res) => {
            const review = req.body
            const result = await reviewsCollection.insertOne(review);
            res.json(result);


        })

    }
    finally {
        // await client.close()
    }

}
run().catch(console.dir)



app.get('/', (req, res) => {
    res.send('Running MANSION SERVER')
})

app.listen(port, () => {
    console.log('Running Server', port);
})