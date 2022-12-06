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

require('dotenv').config();
module.exports = {
    // url:'mongodb://localhost:27017/asn4'
   // url : "mongodb+srv://admin:admin@cluster0.ej4gm.mongodb.net/sample_restaurants?retryWrites=true&w=majority"
    url : process.env.DB_CONN_STRING,
};