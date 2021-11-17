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

        const usersDatabase = client.db("users");
        const usersCollection = usersDatabase.collection("allusers");

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

        // get admin
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            // console.log(cycle);
            let isAdmin = false;
            console.log(user);
            if (user) {
                if (user.role) {
                    if (user.role === 'admin') {
                        isAdmin = true;
                    }
                }
            }
            res.send({ admin: isAdmin });
        })


        app.get('/update/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const order = await cycleOrdersCollection.findOne(query);
            res.send(order);
        })


        app.get('/reviews', async (req, res) => {
            const cursor = riviewsCollection.find({});
            const reviews = await cursor.toArray();
            res.send(reviews);

        })




        // order post api

        app.post('/orders', async (req, res) => {
            const order = req.body;
            // console.log(order);
            const result = await cycleOrdersCollection.insertOne(order);
            res.json(result);
        })

        // user post api
        app.post('/users', async (req, res) => {
            const user = req.body;
            // console.log(order);
            const result = await usersCollection.insertOne(user);
            res.json(result);
        })

        // user put api

        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user }
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        })

        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'admin' } };
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.json(result);
        })



        // review post api

        app.post('/reviews', async (req, res) => {
            const review = req.body;
            // console.log(review);
            const result = await riviewsCollection.insertOne(review);
            res.json(result);
        })

        app.post('/products', async (req, res) => {
            const product = req.body;
            const result = await cycleCollection.insertOne(product);
            // console.log('hitting the post', service);
            res.send(result);
        })



        app.get('/orders/user', async (req, res) => {
            // console.log(req.query);
            const search = req.query.email;
            console.log(req.query.email);
            const cursor = cycleOrdersCollection.find({});
            const orders = await cursor.toArray();
            if (search) {
                const searchResult = orders.filter(order => order.email.includes(search));
                res.send(searchResult);
            } else {
                res.send(orders);
            }
        })

        app.get('/orders', async (req, res) => {
            // console.log(req.query);
            const cursor = cycleOrdersCollection.find({});
            const orders = await cursor.toArray();
            res.send(orders);
        })


        // //delete api

        app.delete('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await cycleOrdersCollection.deleteOne(query);
            res.send(result);
        })

        app.delete('/allcycles/:id', async (req, res) => {

            const id = req.params.id;
            console.log(id);
            const query = { _id: ObjectId(id) };
            const result = await cycleCollection.deleteOne(query);
            res.send(result);
        })

        // update api
        app.put('/update/:id', async (req, res) => {
            const id = req.params.id;
            const updatedOrder = req.body;
            console.log(updatedOrder.cycleName);
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    cycleName: updatedOrder.cycleName,
                    productId: updatedOrder.productId,
                    cost: updatedOrder.cost,
                    info: updatedOrder.info,
                    img: updatedOrder.img,
                    name: updatedOrder.name,
                    email: updatedOrder.email,
                    address: updatedOrder.address,
                    paymentMethod: updatedOrder.paymentMethod,
                    status: updatedOrder.status
                },
            };


            const result = await cycleOrdersCollection.updateOne(filter, updateDoc, options);
            res.send(result);
        })
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