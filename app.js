/******************************************************************************
 ***
 * ITE5315 – Project
 * I declare that this assignment is my own work in accordance with Humber Academic Policy.
 * No part of this assignment has been copied manually or electronically from any other source
 * (including web sites) or distributed to other students.
 *
 * Group member Name: Pavan Srinivas Mamidala and Merin Joe Chandy Student IDs: N01476199, N01482121 Date: Dec 5th 2022
 ******************************************************************************
 ***/

const express = require("express");
const jwt = require("jsonwebtoken");
const { MongoClient } = require("mongodb");
const bodyParser = require("body-parser");
const Schema = require("mongoose").Schema;
const path = require("path");

const hbs = require("hbs");

var database = require("./database");

// Connect to the server
MongoClient.connect(
  database.url,
  { useUnifiedTopology: true },
  function (err, client) {
    if (err) throw err;
    console.log("Connected to MongoDB server");

    // Use the `db` object to access the restaurant data in the database

    const db = client.db("sample_restaurants");
    const restaurants = db.collection("restaurants");

    // Set up the Express app
    const app = express();

    app.set("view engine", "hbs");
    app.set("views", path.join(__dirname, "views"));

    app.use(express.static(path.join(__dirname, "public")));

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    // Serve the login form
    app.get("/login", function (req, res) {
      res.sendFile(__dirname + "/login.html");
    });

    app.get("/api/restaurants/filter", (req, res) => {
      res.render("pagination");
    });

    app.get("/restaurants", (req, res) => {
      const perPage = req.query.perPage || 10;
      const page = req.query.page || 1;
      const offset = (page - 1) * perPage;

      restaurants
        .find(req.query.borough ? { borough: req.query.borough } : {})
        .skip(offset)
        .limit(perPage)
        .toArray((err, restaurants) => {
          if (err) res.send(err);

          const totalRecords = restaurants.length;
          const totalPages = Math.ceil(totalRecords / perPage);
          const prevPage =
            page > 1
              ? `/restaurants?page=${page - 1}&perPage=${perPage}`
              : null;
          const nextPage =
            page < totalPages
              ? `/restaurants?page=${page + 1}&perPage=${perPage}`
              : null;

          res.render("restaurants", {
            restaurants: restaurants.map((restaurant) => {
              return {
                name: restaurant.name,
                cuisine: restaurant.cuisine,
                borough: restaurant.borough,
                editUrl: `/restaurants/${restaurant._id}/edit`,
                deleteUrl: `/restaurants/${restaurant._id}/delete`,
              };
            }),
            page,
            totalPages,
            prevPage,
            nextPage,
          });
        });
    });

    // define the /restaurants/:id route
    app.put("/restaurants/:id", (req, res) => {
      // get the restaurant data from the request body
      const restaurant = req.body;

      // update the restaurant in the database
      updateRestaurantInDb(restaurant);

      // render the edit view and pass the updated restaurant data to the view
      res.render("edit-restaurant", { restaurant });
    });

    app.delete("/restaurants/:id", (req, res) => {
      // get the restaurant id from the request parameters
      const restaurantId = req.params.id;

      // delete the restaurant from the database
      deleteRestaurantInDb(restaurantId);

      // redirect the user to the restaurant list view
      res.redirect("/restaurants");
    });

    // Set up the `/api/login` route
    app.post("/api/login", function (req, res) {
      // Check the provided username and password
      if (req.body.username === "admin" && req.body.password === "password") {
        // Create a JSON Web Token with the user's username as the subject
        const token = jwt.sign({ sub: req.body.username }, "SECRET_KEY");
        console.log(`Generated JWT: ${token}`);

        // Return the JWT to the client
        res.send({ token });
      } else {
        // Return an error if the login failed
        res.status(401).send({ error: "Invalid username or password" });
      }
    });

    // Set up the `/api/restaurants` route
    app
      .route("/api/restaurants")
      // Create a new restaurant document
      .post(function (req, res) {
        // Verify the JWT
        const token = req.headers["x-access-token"];
        if (!token) {
          // Return an error if the JWT is missing
          res.status(401).send({ error: "No token provided" });
        } else {
          // Use the `verify` method to verify the JWT
          jwt.verify(token, "SECRET_KEY", function (err, decoded) {
            if (err) {
              // Return an error if the JWT is invalid
              res.status(401).send({ error: "Invalid token" });
            } else {
              // Use the `insertOne` method to insert a new restaurant document
              restaurants
                .insertOne(req.body, { writeConcern: { w: "majority" } })
                .then((result) => {
                  console.log("Inserted a new restaurant document");
                  res.send("Successfully inserted a new restaurant document");
                })
                .catch((err) => {
                  throw err;
                });
            }
          });
        }
      })
      // Read all restaurant documents
      .get(function (req, res) {
        // Verify the JWT
        const token = req.headers["x-access-token"];
        if (!token) {
          // Return an error if the JWT is missing
          res.status(401).send({ error: "No token provided" });
        } else {
          // Use the `verify` method to verify the JWT
          jwt.verify(token, "SECRET_KEY", function (err, decoded) {
            if (err) {
              // Return an error if the JWT is invalid
              res.status(401).send({ error: "Invalid token" });
            } else {
              // Use the `find` method to query the restaurant collection
              restaurants
                .find(req.query.borough ? { borough: req.query.borough } : {})
                .skip(
                  req.query.perPage ? req.query.perPage * req.query.page : 0
                )
                .limit(req.query.perPage ? parseInt(req.query.perPage) : 10)
                .toArray((err, restaurants) => {
                  if (err) res.send(err);

                  res.json(restaurants);
                });
            }
          });
        }
      })
      // Update a restaurant document
      .put(function (req, res) {
        // Verify the JWT
        const token = req.headers["x-access-token"];
        if (!token) {
          // Return an error if the JWT is missing
          res.status(401).send({ error: "No token provided" });
        } else {
          // Use the `verify` method to verify the JWT
          jwt.verify(token, "SECRET_KEY", function (err, decoded) {
            if (err) {
              // Return an error if the JWT is invalid
              res.status(401).send({ error: "Invalid token" });
            } else {
              // Use the `updateOne` method to update a restaurant document
              restaurants
                .updateOne(
                  { _id: req.params.id },
                  { $set: req.body },
                  { writeConcern: { w: "majority" } }
                )
                .then((result) => {
                  console.log("Updated a restaurant document");
                  res.send("Successfully updated a restaurant document");
                })
                .catch((err) => {
                  throw err;
                });
            }
          });
        }
      })
      // Delete a restaurant document
      .delete(function (req, res) {
        // Verify the JWT
        const token = req.headers["x-access-token"];
        if (!token) {
          // Return an error if the JWT is missing
          res.status(401).send({ error: "No token provided" });
        } else {
          // Use the `verify` method to verify the JWT
          jwt.verify(token, "SECRET_KEY", function (err, decoded) {
            if (err) {
              // Return an error if the JWT is invalid
              res.status(401).send({ error: "Invalid token" });
            } else {
              // Use the `deleteOne` method to delete a restaurant document
              restaurants
                .deleteOne(
                  { _id: req.params.id },
                  { writeConcern: { w: "majority" } }
                )
                .then((result) => {
                  console.log("Deleted a restaurant document");
                  res.send("Successfully deleted a restaurant document");
                })
                .catch((err) => {
                  throw err;
                });
            }
          });
        }
      });

    // Start the server
    app.listen(3000, function () {
      console.log("Server listening on port 3000");
    });
  }
);
