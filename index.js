const express = require("express");
const { Server } = require("socket.io");
var http = require("http");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const { ExpressPeerServer } = require("peer");
//json web token generator
//require('crypto').randomBytes(64).toString('hex')
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();

const port = process.env.PORT || 5000;

app.use(express.json());

app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "https://language-fixer.vercel.app",

        methods: ["GET", "POST"],
    },
});
// const io = require("socket.io")(server);

const peerServer = ExpressPeerServer(server, {
    debug: true,
});

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use("/peerjs", peerServer);

app.get("/", (req, rsp) => {
    rsp.redirect(`/${uuidv4()}`);
});

app.get("/:room", (req, res) => {
    res.render("room", { roomId: req.params.room });
});

// io.on("connection", (socket) => {});

//LiveSession

io.on("connection", (socket) => {
    console.log(socket.id);

    socket.on("joinRoom", (room) => {
        socket.join(room);
    });

    socket.on("newMessage", ({ newMessage, room }) => {
        io.in(room).emit("getLatestMessage", newMessage);
    });
    socket.emit("me", socket.id);

    socket.on("disconnect", () => {
        socket.broadcast.emit("callEnded");
    });

    socket.on("join-room", (roomId, userId) => {
        socket.join(roomId);
        socket.to(roomId).emit("user-connected", userId);

        socket.on("message", (message) => {
            io.to(roomId).emit("createMessage", message);
        });
        socket.on("disconnect", function () {
            socket.to(roomId).emit("user-disconnected", userId);
        });
    });
});

// server.listen(5001, () => {
//   console.log("SERVER RUNNING");
// });

//     console.log("SERVER RUNNING");
// });

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.x3cu1xp.mongodb.net`;

const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: ServerApiVersion.v1,
});

function verifyJWT(req, res, next) {
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
        return res.status(401).send({ message: "Unauthorized access" });
    }
    const token = authHeader.split(" ")[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
        if (err) {
            return res.status(401).send({ message: "Forbidden access" });
        }
        req.decoded = decoded;
        next();
    });
}

async function run() {
    try {
        await client.connect();


        const reviewsCollection = client.db("LanguageFixer").collection("userReview");
        const userCollection = client.db("LanguageFixer").collection("users");
        const blogsCollection = client.db("LanguageFixer").collection("blogs");
        const infoCollection = client.db("LanguageFixer").collection("info");


        app.get("/user", async (req, res) => {
            const users = await userCollection.find().toArray();
            res.send(users);
        });


        app.put("/user/admin/:email", async (req, res) => {
            const email = req.params.email;
            const filter = { email: email };
            const updateDoc = {
                $set: { role: "admin" },
            };
            const result = await userCollection.updateOne(filter, updateDoc);

            res.send({ result });
        });

        app.put("/user/:email", async (req, res) => {
            const email = req.params.email;
            const user = req.body;
            const filter = { email: email };
            const options = { upsert: true };
            const updateDoc = {
                $set: user,
            };


            const result = await userCollection.updateOne(filter, updateDoc, options);

            // const token = jwt.sign(
            //     { email: email },
            //     process.env.ACCESS_TOKEN_SECRET,
            //     { expiresIn: "1h" }
            // );
            res.send({ result });
        });


        app.put("/addClasses/:email", async (req, res) => {
            const email = req.params.email;
            const classes = req.body;
            const filter = { email: email };
            const options = { upsert: true };
            const updateDoc = {
                $set: classes,
            };

            const result = await userCollection.updateOne(
                filter,
                updateDoc,
                options
            );

            // const token = jwt.sign(
            //     { email: email },
            //     process.env.ACCESS_TOKEN_SECRET,
            //     { expiresIn: "1h" }
            // );
            res.send({ result });
        });


        // add user to backend after login or signup

        app.put('/userUpdateDB/:email', async (req, res) => {
            const email = req.params.email
            const userInfo = req.body
            const filter = { email: email }
            const options = { upsert: true }
            const updateDoc = {
                $set: userInfo,
            }
            const result = await userCollection.updateOne(filter, updateDoc, options)
            res.send(result)
        })



        app.post("/reviews", async (req, res) => {
            const review = req.body;
            const result = await reviewsCollection.insertOne(review);
            res.send(result);
        });



        app.post("/reviews", async (req, res) => {
            const review = req.body;
            const result = await reviewsCollection.insertOne(review);
            res.send(result);
        });

        app.get("/review", async (req, res) => {
            const reviews = await reviewsCollection.find().toArray();
            res.send(reviews);
        });

        app.get("/blogs", async (req, res) => {
            const blogs = await blogsCollection.find().toArray();
            res.send(blogs);
        });
        app.get("/blogs/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const blog = await blogsCollection.findOne(query);
            res.send(blog);
        });

        //post profile info
        app.post("/info", async (req, res) => {
            const review = req.body;
            const result = await infoCollection.insertOne(review);
            res.send(result);
        });
        // get info
        app.get("/info", async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const cursor = await infoCollection.find(query);
            const info = await cursor.toArray();
            res.send(info);
            console.log(cursor);
        });

        // update profile
        app.put("/info", async (req, res) => {
            const email = req.query.email;

            const query = { email: email };
            const options = { upsert: true };
            const newLivesIn = req.body.updatedLivesIn;
            const newStudyIn = req.body.updatedStudyIn;
            const newPhone = req.body.updatedPhone;
            const newLinkedIn = req.body.updatedLinkedIn;
            const newGithub = req.body.updatedGithub;
            const newFacebook = req.body.updatedFacebook;
            const result = await infoCollection.updateOne(
                query,
                {
                    $set: {
                        livesIn: newLivesIn,
                        studyIn: newStudyIn,
                        phone: newPhone,
                        linkedIn: newLinkedIn,
                        github: newGithub,
                        facebook: newFacebook,
                    },
                },


                options
            );
            res.json(result);
            console.log(newLivesIn);
        });



    }

    finally {
    }
}

run().catch(console.dir);

app.get("/", (req, res) => {
    res.send("dui takar pepsi sakib bhai sexy");
});

// app.listen(port, () => {
//
// });

server.listen(port, () => {
    console.log(`Sakib Bhai  listening on port ${port}`);
});
