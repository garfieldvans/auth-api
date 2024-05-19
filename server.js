//importing modules
const express = require("express");
const sequelize = require("sequelize");
const dotenv = require("dotenv").config();
const cors = require("cors");
const cookieParser = require("cookie-parser");
const db = require("./app/Models");
const userRoutes = require("./app/Routes/userRoute");

var corsOptions = {
  origin: "http://localhost:3080",
};

const PORT = process.env.PORT || 8080;
const app = express();
app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

db.sequelize.sync({ alter: true }).then(() => {
  console.log("db has been re sync");
});

app.use("/api/users", userRoutes);

app.listen(PORT, () => console.log(`Server is connected on ${PORT}`));
