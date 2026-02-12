const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const auth = require("../middleware/authMiddleware");
const cityController = require("../controllers/cityController");

router.post(
  "/",
  auth,
  upload.fields([
    { name: "mainImage", maxCount: 1 },
    { name: "images" }
  ]),
  cityController.createCity
);

router.get("/", cityController.getCities);
router.get("/:id", cityController.getCity);
router.put(
  "/:id",
  auth,
  upload.fields([
    { name: "mainImage", maxCount: 1 },
    { name: "images" }
  ]),
  cityController.updateCity
);

router.delete("/:id", auth, cityController.deleteCity);

module.exports = router;
