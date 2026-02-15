const City = require("../models/City");
const fs = require("fs");
const path = require("path");

// ================= CREATE CITY =================
exports.createCity = async (req, res) => {
  try {
    const { cityName } = req.body;

    // 🔹 Validation
    if (!cityName) {
      return res.status(400).json({
        success: false,
        message: "City name is required"
      });
    }

    if (!req.files?.mainImage?.length) {
      return res.status(400).json({
        success: false,
        message: "Main image is required"
      });
    }

    const mainImage = req.files.mainImage[0].path;

    const images = req.files?.images
      ? req.files.images.map(file => file.path)
      : [];

    const city = await City.create({
      cityName,
      mainImage,
      images
    });

    return res.status(201).json({
      success: true,
      message: "City created successfully",
      city
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "City creation failed",
      error: error.message
    });
  }
};


// ================= GET ALL CITIES =================
exports.getCities = async (req, res) => {
  try {
    // 🔹 Get page & limit from query
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;

    // 🔹 Prevent negative values
    if (page < 1) page = 1;
    if (limit < 1) limit = 5;

    const skip = (page - 1) * limit;

    // 🔹 Total count
    const totalCities = await City.countDocuments();

    // 🔹 Fetch paginated data
    const cities = await City.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return res.status(200).json({
      success: true,
      page,
      limit,
      totalCities,
      totalPages: Math.ceil(totalCities / limit),
      count: cities.length,
      cities
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch cities",
      error: error.message
    });
  }
};



// ================= GET SINGLE CITY =================
exports.getCity = async (req, res) => {
  try {
    const city = await City.findById(req.params.id);

    if (!city) {
      return res.status(404).json({
        success: false,
        message: "City not found"
      });
    }

    return res.status(200).json({
      success: true,
      city
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch city"
    });
  }
};


// ================= UPDATE CITY =================
exports.updateCity = async (req, res) => {
  try {
    const city = await City.findById(req.params.id);

    if (!city) {
      return res.status(404).json({
        success: false,
        message: "City not found"
      });
    }

    const { cityName } = req.body;

    // 🔹 Update City Name
    if (cityName) {
      city.cityName = cityName;
    }

    // 🔹 Update Main Image
    if (req.files?.mainImage?.length) {

      if (city.mainImage) {
        const oldPath = path.join(__dirname, "..", city.mainImage);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }

      city.mainImage = req.files.mainImage[0].path;
    }

    // 🔹 Add New Images
    if (req.files?.images?.length) {
      const newImages = req.files.images.map(file => file.path);
      city.images = [...city.images, ...newImages];
    }

    // 🔹 Delete Selected Images
    if (req.body.deletedImages) {

      let deletedImages = [];

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

    return res.status(200).json({
      success: true,
      message: "City updated successfully",
      city
    });

  } catch (error) {
    console.log("UPDATE ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "City update failed",
      error: error.message
    });
  }
};


// ================= DELETE CITY =================
exports.deleteCity = async (req, res) => {
  try {
    const city = await City.findById(req.params.id);

    if (!city) {
      return res.status(404).json({
        success: false,
        message: "City not found"
      });
    }

    // 🔹 Delete Main Image
    if (city.mainImage) {
      const mainPath = path.join(__dirname, "..", city.mainImage);
      if (fs.existsSync(mainPath)) {
        fs.unlinkSync(mainPath);
      }
    }

    // 🔹 Delete Other Images
    city.images.forEach(img => {
      const imgPath = path.join(__dirname, "..", img);
      if (fs.existsSync(imgPath)) {
        fs.unlinkSync(imgPath);
      }
    });

    await City.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: "City deleted successfully"
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "City deletion failed"
    });
  }
};
