var express = require("express");
var mongoose = require("mongoose");
var app = express();
var database = require("./database");
var bodyParser = require("body-parser");
var port = process.env.PORT || 8000;
var path = require("path");
require('dotenv').config();

app.use(bodyParser.urlencoded({ extended: "true" }));
app.use(bodyParser.json());
app.use(bodyParser.json({ type: "application/vnd.api+json" }));

mongoose.connect(database.url);

var Restaurant = require("./restaurant");

const exphbs = require("express-handlebars");

app.use(express.static(path.join(__dirname, "public")));

app.engine(".hbs", exphbs.engine({ extname: ".hbs" }));

app.set("view engine", "hbs");

app.get("/api/restaurants", function (req, res) {
  //console.log(req.query.page + req.query.perPage + req.query.borough);

  Restaurant.find( req.query.borough ? {borough:req.query.borough} : '')
    .skip(req.query.perPage * req.query.page)
    .limit(req.query.perPage)
    .exec(function (err, restaurants) {
      if (err) res.send(err);

      res.send(restaurants);
    });
});

app.get('/api/restaurants/filter' ,(req,res) => {
  res.render('pagination');
})

app.get('/api/restaurants/:id',(req,res) =>{

    Restaurant.findById( req.params.id, (err,restaurant) =>{
        if(err)
            res.send(err);

        res.json(restaurant);
    } ) 
})


app.put('/api/restaurants/:id',(req,res) => {

    let gradesArray = req.body.grades.map((item) =>
    {
        date: item.date;
        grade: item.grade;
        score: item.score;
      }
    )
    console.log(req.body.grades);
    let data = {
        address: {
          building: req.body.building,
          coord: req.body.coord,
          street: req.body.street,
          zipcode: req.body.zipcode,
        },
  
        borough: req.body.borough,
        cuisine: req.body.cuisine,
        grades: req.body.grades.map((item) => {
          date: item.date;
          grade: item.grade;
          score: item.score;
        }),
        name: req.body.name,
        restaurant_id: req.body.restaurant_id,
      };

    Restaurant.findByIdAndUpdate(req.params.id,data, (err,restaurant) => {
        if(err)
            res.send(err);

        res.send('Updated the record successfully');
    } )
})

app.post("/api/restaurants", function (req, res) {
  console.log(req.body);

  // Restaurant.create(
  //   {
  //     address: {
  //       building: req.body.building,
  //       coord: req.body.coord,
  //       street: req.body.street,
  //       zipcode: req.body.zipcode,
  //     },

  //     borough: req.body.borough,
  //     cuisine: req.body.cuisine,
  //     grades: req.body.grades.map((item) => {
  //       date: item.date;
  //       grade: item.grade;
  //       score: item.score;
  //     }),
  //     name: req.body.name,
  //     restaurant_id: req.body.restaurant_id,
  //   },
  //   function (err, restuarants) {
  //     if (err) res.send(err);

  //     Restaurant.findOne(
  //       { restaurant_id: req.body.restaurant_id },
  //       function (err, restaurant) {
  //         if (err) res.send(err);

  //         res.json(restaurant);
  //       }
  //     );
  //   }
  // );

  
});


app.delete('/api/restaurants/:id', (req,res) => {
    Restaurant.findByIdAndRemove(req.params.id, (err, restaurant) => {
        if(err)
            res.send(err);

        res.send('Deleted Successfully');
    })
})

app.listen(port);
console.log("App listening on port : " + port);
