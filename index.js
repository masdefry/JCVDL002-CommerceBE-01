const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

const PORT = 2001;

// cek nyambung atau nggak
app.get("/", (req, res) => {
  res.status(200).send("<h1>OK connect jadi admin</h1>");
});

// import routers
const adminRouter = require("./Routers/adminRouter");
app.use("/admin", adminRouter);

app.listen(PORT, () => console.log("API RUNNING ON PORT " + PORT));
