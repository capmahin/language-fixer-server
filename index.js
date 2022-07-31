const express = require("express");

const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;
const { nanoid } = require("nanoid");
const io = require("socket.io")(app, {
  cors: {
    origin: "+",
  },
});

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://backSlashAdmin:$33Iso4ofqMlKCLHU@cluster0.akik6.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

const users = [];
const rooms = [];

io.on("connection", (socket) => {
  socket.emit("me", socket.id);
  users.push(socket.id);
  socket.broadcast.emit("updateUsers", users);

  socket.on("disconnect", () => {
    users = users.filter((users) => user !== socket.id);
    socket.broadcast.emit("updateUsers", users);
    socket.disconnect();
  });

  socket.emit("getAllUsers", users);

  //Rooms

  socket.on("create_room", () => {
    const room = {
      id: nanoid(7),
      chat: [],
    };
    socket.join(room);
    socket.emit("get_room", room);
    rooms.push(room);
    socket.broadcast.emit("updateRooms", rooms);
  });

  socket.on("join_room", (room) => {
    socket.join(room.id);
  });
  socket.broadcast.emit("updateRooms", rooms);

  socket.on("message", (payload) => {
    rooms.map((room) => {
      if (room.id === payload.room) {
        singleChat = { message: payload.message, writer: payload.socketId };
        room.chat.push(singleChat);
      }
    });

    io.to(payload.room).emit("chat", payload);
  });
});

async function run() {
  try {
    await client.connect();

    const reviewsCollection = client
      .db("LanguageFixer")
      .collection("userReview");

    app.post("/reviews", async (req, res) => {
      const review = req.body;
      const result = await reviewsCollection.insertOne(review);
      res.send(result);
    });

    app.get("/review", async (req, res) => {
      const reviews = await reviewsCollection.find().toArray();
      res.send(reviews);
    });


    app.get("/", (req, res) => {
      res.send("dui takar pepsi sakib bhai sexy");
    });

    app.listen(port, () => {
      console.log(`Sakib Bhai  listening on port ${port}`);
    });

  } finally {
  }
}

run().catch(console.dir);

