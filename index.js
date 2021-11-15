const express = require('express')
const app = express()
const cors = require('cors');
require('dotenv').config();
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;

const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vwgx4.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();

        const cycleDatabase = client.db("cycles");
        const cycleCollection = cycleDatabase.collection("allcycles");

        const cycleOrderDatabase = client.db("cycleOrders");
        const cycleOrdersCollection = cycleOrderDatabase.collection("allCycleOrders");

        const riviewDatabase = client.db("riviews");
        const riviewsCollection = riviewDatabase.collection("allriviews");

        //get api
        app.get('/allcycles', async (req, res) => {
            // console.log(req.query);
            const cursor = cycleCollection.find({});
            const cycles = await cursor.toArray();
            res.send(cycles);
        })

        app.get('/allcycles/:id', async (req, res) => {
            const id = req.params.id;

            const query = { _id: ObjectId(id) };

            const cycle = await cycleCollection.findOne(query);
            // console.log(cycle);
            res.send(cycle);
        })

        app.get('/reviews', async (req, res) => {
            const cursor = riviewsCollection.find({});
            const reviews = await cursor.toArray();
            res.send(reviews);

        })

        // app.get('/update/:id', async (req, res) => {
        //     const id = req.params.id;
        //     const query = { _id: ObjectId(id) };
        //     const order = await ordersCollection.findOne(query);
        //     res.send(order);
        // })


        // order post api

        app.post('/orders', async (req, res) => {
            const order = req.body;
            // console.log(order);
            const result = await cycleOrdersCollection.insertOne(order);
            res.json(result);
        })


        // review post api

        app.post('/reviews', async (req, res) => {
            const review = req.body;
            // console.log(review);
            const result = await riviewsCollection.insertOne(review);
            res.json(result);
        })

        // app.post('/allrides', async (req, res) => {
        //     const ride = req.body;
        //     const result = await ridesCollection.insertOne(ride);
        //     // console.log('hitting the post', service);
        //     res.send(result);
        // })

        app.get('/orders', async (req, res) => {
            // console.log(req.query);
            const search = req.query.email;
            const cursor = cycleOrdersCollection.find({});
            const orders = await cursor.toArray();
            if (search) {
                const searchResult = orders.filter(order => order.email.includes(search));
                res.send(searchResult);
            } else {
                res.send(orders);
            }
        })

        // //delete api

        app.delete('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await cycleOrdersCollection.deleteOne(query);
            res.send(result);
        })

        // // update api
        // app.put('/update/:id', async (req, res) => {
        //     const id = req.params.id;
        //     const updatedOrder = req.body;
        //     const filter = { _id: ObjectId(id) };
        //     const options = { upsert: true };
        //     const updateDoc = {
        //         $set: {
        //             name: updatedOrder.name,
        //             email: updatedOrder.email,
        //             cost: updatedOrder.cost,
        //             rideName: updatedOrder.rideName,
        //             status: updatedOrder.status
        //         },
        //     };
        //     const result = await ordersCollection.updateOne(filter, updateDoc, options);
        //     res.send(result);
        // })
    }
    finally {
        // await client.close();
    }

}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`listening at${port}`)
})