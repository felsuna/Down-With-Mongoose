const express = require("express");
const logger = require("morgan");
const mongoose = require("mongoose");
const axios = require("axios");
const cheerio = require("cheerio");
const db = require("./models");

const PORT = process.env.PORT || 3000;

const app = express();

app.use(logger("dev"));
app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(express.static("public"));

// Connect to the Mongo DB.
// If deployed, use the deployed database (mlab for Heroku). Otherwise use the local mongoHeadlines database.
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";
mongoose.connect(MONGODB_URI);

// Start the server.
app.listen(PORT, function() {
    console.log(`Server is listening on: http://localhost:${PORT}`);
});
