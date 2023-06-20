require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const port = process.env.PORT || 5000;
const stripe = require('stripe')(process.env.PAYMENT_SECRET_KEY);

// middleware
app.use(cors());
app.use(express.json());


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xv6u1hf.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
     try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();

        const userCollection = client.db("Summer_School").collection("user");


        app.get('/users', async (req, res) => {
            const result = await userCollection.find().toArray();
            res.send(result);
        })

        app.get('/users/admin/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await userCollection.findOne(query);
            const result = { admin: user?.role === 'admin' }
            res.send(result);
        })

        app.get('/users/instructor/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await userCollection.findOne(query);
            const result = { instructor: user?.role === 'instructor' };
            res.send(result);

        })

        app.get('/users/:role', async (req, res) => {
            const role = req.params.role;
            const query = { role: role };
            const result = await userCollection.find(query).toArray();
            res.send(result);
        })

        app.post('/users', async (req, res) => {
            const user = req.body;
            const query = { email: user.email };
            const existingUser = await userCollection.findOne(query);
            console.log((`Existing user ${existingUser}`));
            if (existingUser) {
                return res.send({ message: "User already exist" });

            }
            const result = await userCollection.insertOne(user);
            res.send(result);
        })

        app.patch('/users/admin/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const updateDoc = {
                $set: {
                    role: `admin`
                },
            };
            const result = await userCollection.updateOne(query, updateDoc);
            res.send(result);
        })

        app.patch('/users/instructor/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const updateDoc = {
                $set: {
                    role: `instructor`
                },
            };
            const result = await userCollection.updateOne(query, updateDoc);
            res.send(result);
        })

        const classCollection = client.db("Summer_School").collection("classes");

        app.get('/classes', async (req, res) => {
            const result = await classCollection.find().toArray();
            res.send(result);
        })

        

        app.get('/insClass/:clsId', async (req, res) => {
            const id = req.params.clsId;
            const query = { _id: new ObjectId(id) };
            const result = await classCollection.findOne(query);
            res.send(result);
        })

        app.patch('/class/feedback/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const updateFeedback = {
                $set: {
                    feedback: req.body.feedback,
                },
            };
            const result = await classCollection.updateOne(query, updateFeedback);
            res.send(result);

        })



        app.get('/classes/:status', async (req, res) => {
            const status = req.params.status;
            const query = { status: status };
            const result = await classCollection.find(query).toArray();
            res.send(result);
        })

        app.get('/homeClasses/:status', async (req, res) => {
            const status = req.params.status;
            const query = { status: status };
            const result = await classCollection.find(query).sort({ enrollStudent: -1 }).toArray();
            res.send(result);
        });

        app.get('/class/:email', async (req, res) => {
            const email = req.params.email;
            console.log(email);
            const query = { email: email };
            const result = await classCollection.find(query).toArray();
            res.send(result);
        })

        app.post('/classes', async (req, res) => {
            const newClass = req.body;
            const result = await classCollection.insertOne(newClass);
            res.send(result);
        })

        app.patch('/classes/approved/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const updateStatus = {
                $set: {
                    status: `approved`
                },
            };
            const result = await classCollection.updateOne(query, updateStatus);
            res.send(result);
        })

        app.patch('/classes/deny/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const updateStatus = {
                $set: {
                    status: `deny`
                },
            };
            const result = await classCollection.updateOne(query, updateStatus);
            res.send(result);
        })

        const stdClassCollection = client.db("Summer_School").collection("stdClass");

        app.post('/stdClass', async (req, res) => {
            const studentClass = req.body;
            const result = await stdClassCollection.insertOne(studentClass);
            res.send(result);
        })

        app.get('/stdClass/:stdEmail', async (req, res) => {
            const email = req.params.stdEmail;
            const query = { userEmail: email };
            const result = await stdClassCollection.find(query).toArray();
            res.send(result);
        })

        app.get('/stdClas/:classId', async (req, res) => {
            const classId = req.params.classId;
            const query = { classId: classId };
            const result = await stdClassCollection.findOne(query);
            res.send(result);
        })


        // app.get('/stdClass/:clsId', async (req, res) => {
        //     const classId = req.params.clsId;
        //     const query = {classId: classId};
        //     const result = await stdClassCollection.findOne(query);
        //     res.send(result);
        // })

        app.get('/stdClass/:userEmail/:classId', async (req, res) => {
            const email = req.params.userEmail;
            const classId = req.params.classId;
            const query = { userEmail: email, classId: classId };
            const result = await stdClassCollection.find(query).toArray();
            res.send(result);
        });

        app.delete('/stdClass/:classId', async (req, res) => {
            const classId = req.params.classId;
            const query = { classId: classId };
            const result = await stdClassCollection.deleteOne(query);
            res.send(result);
        })

        // create payment intent
        app.post('/create-payment-intent', async (req, res) => {
            const { price } = req.body;
            const amount = price * 100;
            const paymentIntent = await stripe.paymentIntents.create({
                amount: amount,
                currency: 'usd',
                payment_method_types: ['card']
            })
            res.send({
                clientSecret: paymentIntent.client_secret
            })
        })

        const paymentCollection = client.db("Summer_School").collection("payments");

        app.get('/payments/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const result = await paymentCollection.find(query).toArray();
            res.send(result);
        })

        app.get('/paymentsEnroll/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const result = await paymentCollection.find(query).sort({ _id: -1 }).toArray();
            res.send(result);
        });


        app.post('/payments', async (req, res) => {
            const payment = req.body;
            // console.log(payment);
            const result = await paymentCollection.insertOne(payment);
            const query = { classId: payment.classId };
            const deleteResult = await stdClassCollection.deleteOne(query);
            const enrollQuery = { _id: new ObjectId(payment.classId) };
            const updateResult = await classCollection.updateOne(
                enrollQuery,
                {
                    $inc: { enrollStudent: 1 },
                }
            );
            const updateSeatResult = await classCollection.updateOne(
                enrollQuery,
                {
                    $inc: { seat: -1 },
                }
            );

            res.send({ result, deleteResult, updateResult, updateSeatResult });
        })




        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
     } finally {
    //     // Ensures that the client will close when you finish/error
    //     // await client.close();
    }
}
 run().catch(console.dir);


app.get('/', (req, res) => {
    res.send("summer school running successfully");
})

app.listen(port, (req, res) => {
    console.log(`summer school is running in port ${port}`);
})

module.exports = app;
