const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

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
    await client.connect()










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

