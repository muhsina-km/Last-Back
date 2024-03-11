const mongoose = require("mongoose");
let sc = mongoose.Schema;
const PetSchema = new sc({
  Petcode: String,
  PetName: String,
  cid: { type: mongoose.Schema.Types.ObjectId, ref: 'categories' },
  Breed: String, // Replaced 'Species' with 'Breed'
  Age: Number,
  Gender: String,
  Price: String,// Replaced 'Breed' with 'Price'
  Color: String,
  Description: String,
  Status: String,
  Image: {
    data: Buffer,
    contentType: String,
  },
});

var petmodel = mongoose.model("Pet", PetSchema);
module.exports = petmodel;
