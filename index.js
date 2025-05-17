require("dotenv").config();
const express = require("express");
const sequelize = require("./sequelize");
const authRoutes = require("./routes/authRoutes.js");
const userRoutes = require("./routes/userRoutes.js");
const taskRoutes = require("./routes/taskRoutes.js");
const commentRoutes = require("./routes/commentRoutes.js")

const app = express();
const port = process.env.PORT;

app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/task", taskRoutes);
app.use("/api/comment", commentRoutes);

app.listen(port, async () => {
  try {
    await sequelize.authenticate();
    console.log(`server is running on http://localhost:${port}`);
    console.log("Connection Established Successfully");
  } catch (error) {
    console.log(error.message);
  }
});