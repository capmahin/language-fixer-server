const express = require("express");
const http = require("http");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");
const app = express();

const port = process.env.port || 5000;

app.use(express.json());
const { Server } = require("socket.io");
app.use(cors());

<<<<<<< HEAD
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "https://language-fixer.vercel.app/",
    methods: ["GET", "POST"],
  },
});
=======

io.on("connect", (socket) => {
  socket.on("join", ({ name, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, name, room });

    const users = [];
    const rooms = [];

    if (error) return callback(error);
>>>>>>> 30421da278a7b3f04f9e9ec45f35ba6004666d60

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  socket.on("join_room", (data) => {
    socket.join(data);
    console.log(`User with ID: ${socket.id} joined room: ${data}`);
  });

  socket.on("send_message", (data) => {
    socket.to(data.room).emit("receive_message", data);
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected", socket.id);
  });
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.akik6.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    await client.connect();

    const reviewsCollection = client.db("LanguageFixer").collection("userReview");

    app.post("/reviews", async (req, res) => {
      const review = req.body;
      const result = await reviewsCollection.insertOne(review);
      res.send(result);
    });

    app.get("/reviews", async (req, res) => {
      const reviews = await reviewsCollection.find().toArray();
      res.send(reviews);
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