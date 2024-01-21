const mongoose = require("mongoose"); // Erase if already required

// Declare the Schema of the Mongo model
var brandSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    brand_id: {
      type: Number,
      required: true,
    },
    category_id: {
      type: Number,
      required: true,
    },
    logo: {
      type: String,
      required: true,
    },
  },
);

//Export the model
module.exports = mongoose.model("Brand", brandSchema);


// {
//   "_id": {
//     "$oid": "65a57191eefeb27762b8732e"
//   },
//   "id": 122,
//   "name": "iDENTical",
//   "brand_id": 1203,
//   "category_id": 1301,
//   "logo": "https://dentalkart-application-media.s3.ap-south-1.amazonaws.com/brandpage/images/iDENTical.jpg",
//   "featured": "0",
//   "url_path": "brands/identical"
// }