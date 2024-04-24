const Brand = require("../models/brandModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId");

const createBrand = asyncHandler(async (req, res) => {
  console.log(req.body);
  try {
    const newBrand = await Brand.create({
      name: req.body.name,
      logo: req.body?.logourl,
    });

    res.json(newBrand);
  } catch (error) {

    throw new Error(error);
  }
});


const updateBrand = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const updatedBrand = await Brand.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.json(updatedBrand);
  } catch (error) {
    throw new Error(error);
  }
});


const deleteBrand = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const deletedBrand = await Brand.findByIdAndDelete(id);
    res.json(deletedBrand);
  } catch (error) {
    throw new Error(error);
  }
});


const getBrand = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const getaBrand = await Brand.findById(id);
    res.json(getaBrand);
  } catch (error) {
    throw new Error(error);
  }
});

// user side 
const getallBrand = asyncHandler(async (req, res) => {
  try {
    let getallBrand = await Brand.find().sort({
      name: 1
    });
    // sort by name in ascending order

    res.json({
      "data": getallBrand
    });
  } catch (error) {
    throw new Error(error);
  }
});


module.exports = {
  createBrand,
  updateBrand,
  deleteBrand,
  getBrand,
  getallBrand,
};
