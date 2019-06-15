const express = require("express");

const app = express();

app.use(express.static("public"));

app.use("/survey", (req, res) => {
  res.json({
    message: "Thank you"
  });
});

module.exports = app;
