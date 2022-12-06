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

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

RestaurantSchema = new Schema({
    address : {
        building: String,
        coord: [Number],
        street: String,
        zipcode: String,
    },

    borough : String,
	cuisine : String,
    grades: [{
        date:Date,
        grade:String,
        score:Number
    }],
    name:String,
    restaurant_id:String
});
module.exports = mongoose.model('Restaurant', RestaurantSchema);