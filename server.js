const express = require("express");
const logger = require("morgan");
const mongoose = require("mongoose");

//Scaping tools.
const axios = require("axios");
const cheerio = require("cheerio");

// Require models.
const db = require("./models");

const PORT = process.env.PORT || 3000;

const app = express();

app.use(logger("dev"));

// Parse application body as JSON.
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve static content for the app from the "public" directory.
app.use(express.static("public"));

// Set handlebars.
const exphbs = require("express-handlebars");
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

//Routes

//Route to the index handlebar.
app.get("/", (req, res) => {
    res.render("index");
})

// Scraper to get information from ign website.
app.get("/scrape", (req, res) => {
    axios.get("https://www.ign.com/articles?tags=news").then((response) => {
        const $ = cheerio.load(response.data)
        const articles = [];
        $(".listElmnt-blogItem").each(function (element) {

            const article = {
                title: $(this).children("a").text(),
                summary: $(this).children("p").text(),
                link: $(this).children("a").attr('href')
            }
            // Add article to articles array.
            articles.push(article)
            // Add article to the mongo database.
            db.Article.create(article)
                .then((dbArticle) => {
                    console.log(dbArticle)
                })
                .catch(error => {
                    res.send(error)
                });
        })
        // const dbObject = {
        //     data: articles
        // }
        res.send(articles)
        res.send("Scrape complete");

        res.render("index", {index: articles})


    });
});

// Get all articles from database.
app.get('/articles', function (req, res) {
    db.Article.find({})
        .then(dbArticle => {
            res.json(dbArticle);
        })
        .catch(error => {
            res.json(error);
        });
});

// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", (req, res) => {
    db.Article.findOne({ _id: req.params.id })
        .populate("note")
        .then(dbArticle => {
            res.json(dbArticle);
        })
        .catch(err => {
            res.json(err);
        });
});

// Route for saving/updating an Article's associated Note
app.post("/articles/:id", (req, res) => {
    db.Note.create(req.body)
        .then(dbNote => {
            return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
        })
        .then(dbArticle => {
            res.json(dbArticle);
        })
        .catch(err => {
            res.json(err);
        });
});


// Connect to the Mongo DB.
// If deployed, use the deployed database (mlab for Heroku). Otherwise use the local mongoHeadlines database.
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/igndb";
mongoose.connect(MONGODB_URI);

// Start the server.
app.listen(PORT, function () {
    console.log(`Server is listening on: http://localhost:${PORT}`);
});
