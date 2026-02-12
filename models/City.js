const mongoose = require("mongoose");

const citySchema = new mongoose.Schema({
  cityName: {
    type: String,
    required: true
  },
  mainImage: {
    type: String,
    required: true
  },
  images: [
    {
      type: String
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model("City", citySchema);
