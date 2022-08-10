const express = require("express");
const http = require("http");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");
const app = express();

const port = process.env.PORT || 5000;

app.use(express.json());
const { Server } = require("socket.io");
app.use(
  cors({
    origin: true,
    optionsSuccessStatus: 200,
    credentials: true,
  })
);

const server = http.createServer(app);

const io = new Server(server, {

  cors: {
    origin: "https://language-fixer.vercel.app/",
    methods: ["GET", "POST"],
  },

});

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
  socket.emit("me", socket.id);

  socket.on("disconnect", () => {
    socket.broadcast.emit("callEnded");
  });

  socket.on("callUser", (data) => {
    io.to(data.userToCall).emit("callUser", {
      signal: data.signalData,
      from: data.from,
      name: data.name,
    });
  });

  socket.on("answerCall", (data) => {
    io.to(data.to).emit("callAccepted", data.signal);
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

async function run() {
  try {
    await client.connect();

    const reviewsCollection = client
      .db("LanguageFixer")
      .collection("userReview");
    const userCollection = client.db("LanguageFixer").collection("users");

    app.put("/user/:email", async (req, res) => {
      const email = req.params.email;
      const user = req.body;
      const filter = { email: email };
      const options = { upsert: true };
      const updateDoc = {
        $set: user,
      };
      const result = await userCollection.updateOne(
        filter,
        updateDoc,
        options
      );
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
  } finally {
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


