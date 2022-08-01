const express = require("express");
const socketio = require("socket.io");
const http = require("http");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");
const app = express();
const server = http.createServer(app);
const io = socketio(server);
const PORT = process.env.PORT || 5000;
const port = process.env.port || 5001;

const router = require("./router");

io.on("connection", (socket) => {
  console.log("we have a new connection");
  socket.on("disconnect", () => {
    console.log("User had left");
  });
});
app.use(router);

server.listen(PORT, () => console.log(`Server has started on ${PORT} `));

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.akik6.mongodb.net/?retryWrites=true&w=majority`;
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

app.listen(port, () => {
  console.log(`Sakib Bhai  listening on port ${port}`);
});
