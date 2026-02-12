const City = require("../models/City");
const fs = require("fs");
const path = require("path");


// Create City
exports.createCity = async (req, res) => {
  try {

    const { cityName } = req?.body;

    const mainImage = req.files["mainImage"]?.[0].path;

    const images = req.files["images"]
      ? req?.files["images"].map(file => file.path)
      : [];

    const city = await City.create({
      cityName,
      mainImage,
      images
    });

    res.status(201).json(city);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get All Cities
exports.getCities = async (req, res) => {
  const cities = await City.find();
  res.json(cities);
};

// Get Single City
exports.getCity = async (req, res) => {
  const city = await City.findById(req.params.id);
  res.json(city);
};


exports.updateCity = async (req, res) => {
  try {
    const city = await City.findById(req.params.id);
    if (!city) {
      return res.status(404).json({ message: "City not found" });
    }

    // ===============================
    // ✅ UPDATE CITY NAME
    // ===============================
    const { cityName } = req?.body;
    if (cityName) {
      city.cityName = cityName;
    }

    // ===============================
    // ✅ UPDATE MAIN IMAGE
    // ===============================
    if (req.files?.mainImage?.length) {

      // delete old main image
      if (city.mainImage) {
        const oldPath = path.join(__dirname, "..", city.mainImage);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }

      city.mainImage = req.files.mainImage[0].path;
    }

    // ===============================
    // ✅ ADD NEW IMAGES
    // ===============================
    if (req.files?.images?.length) {
      const newImages = req.files.images.map(file => file.path);
      city.images = [...city.images, ...newImages];
    }

    // ===============================
    // ✅ DELETE SELECTED IMAGES
    // ===============================
    if (req.body.deletedImages) {

      let deletedImages = [];

      // handle both string & array
      if (typeof req.body.deletedImages === "string") {
        deletedImages = JSON.parse(req.body.deletedImages);
      } else {
        deletedImages = req.body.deletedImages;
      }

      deletedImages.forEach(img => {
        const filePath = path.join(__dirname, "..", img);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });

      city.images = city.images.filter(
        img => !deletedImages.includes(img)
      );
    }

    await city.save();

    res.json({ success: true, city });

  } catch (error) {
    console.log("UPDATE ERROR:", error);
    res.status(500).json({ message: "Update failed" });
  }
};




// Delete City
exports.deleteCity = async (req, res) => {
  await City.findByIdAndDelete(req.params.id);
  res.json({ message: "City Deleted" });
};
