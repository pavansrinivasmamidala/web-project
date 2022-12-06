var express = require("express");
var mongoose = require("mongoose");
var app = express();
var database = require("./database");
var bodyParser = require("body-parser");
var port = process.env.PORT || 8000;
var path = require("path");
require("dotenv").config();

app.use(bodyParser.urlencoded({ extended: "true" }));
app.use(bodyParser.json());
app.use(bodyParser.json({ type: "application/vnd.api+json" }));

mongoose.connect(database.url);

var Restaurant = require("./restaurant");

const exphbs = require("express-handlebars");

app.use(express.static(path.join(__dirname, "public")));

app.engine(".hbs", exphbs.engine({ extname: ".hbs" }));

app.set("view engine", "hbs");

// update a restaurant
app.put("/restaurants/:id", (req, res) => {
  // update the restaurant with the specified ID in the database
  Restaurant.findByIdAndUpdate(
    req.params.id,
    {
      // set the updated values for the restaurant
      borough: req.body.borough,
      cuisine: req.body.cuisine,
      name: req.body.name,
    },
    {new:true},
    (err, restaurant) => {
      if (err) {
        // handle the error
      } else {
        // redirect to the restaurant detail view
        res.redirect(`/restaurants/${restaurant._id}`);
        console.log(restaurant)
      }
    }
  );
});

// display the list of restaurants
app.get("/restaurants", (req, res) => {
  // retrieve the list of restaurants from the database
  Restaurant.find()
    .lean()
    .limit(20)
    .exec((err, restaurants) => {
      if (err) {
        // handle the error
      } else {
        // render the restaurant-list view and pass the list of restaurants
        res.render("restaurant-list", { restaurants });
      }
    });
});

// create a new restaurant
app.post("/restaurants", (req, res) => {
  // create a new restaurant in the database
  Restaurant.create(
    {
      // set the values for the new restaurant
      address: req.body.address,
      borough: req.body.borough,
      cuisine: req.body.cuisine,
      grades: req.body.grades,
      name: req.body.name,
      restaurant_id: req.body.restaurant_id,
    },
    (err, restaurant) => {
      if (err) {
        // handle the error
      } else {
        // redirect to the restaurant detail view
        res.redirect(`/restaurants/${restaurant._id}`);
      }
    }
  );
});

app.delete("/restaurants/:id", (req, res) => {
  // Log the ID of the restaurant to delete
  console.log(`Deleting restaurant with ID: ${req.params.id}`);

  // Get the ID of the restaurant to delete from the request parameters
  const id = req.params.id;

  // Find the restaurant in the database and delete it
  Restaurant.findByIdAndDelete(id, (err, restaurant) => {
    if (err) {
      // If an error occurs, send a 500 status code to the client
      res.status(500).send(err);
    } else {
      // If the restaurant was successfully deleted, send a 200 status code to the client
      res.redirect("/restaurants");
    }
  });
});

// display the edit form for a restaurant
app.get("/restaurants/:id/edit", (req, res) => {
  // retrieve the restaurant with the specified ID from the database
  Restaurant.findById(req.params.id)
    .lean()
    .exec((err, restaurant) => {
      if (err) {
        // handle the error
      } else {
        // render the restaurant-edit view and pass the restaurant data
        res.render("restaurant-edit", { restaurant });
        console.log(restaurant);
      }
    });
});

// display the details of a specific restaurant
app.get("/restaurants/:id", (req, res) => {
  // retrieve the restaurant with the specified ID from the database
  Restaurant.findById(req.params.id)
    .lean()
    .exec((err, restaurant) => {
      if (err) {
        // handle the error
      } else {
        // render the restaurant-detail view and pass the restaurant data
        res.render("restaurant-detail", { restaurant });
        console.log(restaurant);
      }
    });
});

app.listen(3000, () => {
  console.log("app is listening on 3000");
});
