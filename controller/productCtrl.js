const Product = require("../models/productModel");
const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const slugify = require("slugify");
const validateMongoDbId = require("../utils/validateMongodbId");
const Banner = require("../models/bannerModel");

const createProduct = asyncHandler(async (req, res) => {
  try {
    if (req.body.title) {
      req.body.slug = slugify(req.body.title);
    }
    const newProduct = await Product.create(req.body);
    res.json(newProduct);
  } catch (error) {
    throw new Error(error);
  }
});

const updateProduct = asyncHandler(async (req, res) => {
  const id = req.params;
  validateMongoDbId(id);
  try {
    if (req.body.title) {
      req.body.slug = slugify(req.body.title);
    }
    const updateProduct = await Product.findOneAndUpdate({ id }, req.body, {
      new: true,
    });
    res.json(updateProduct);
  } catch (error) {
    throw new Error(error);
  }
});

const deleteProduct = asyncHandler(async (req, res) => {
  const id = req.params;
  validateMongoDbId(id);
  try {
    const deleteProduct = await Product.findOneAndDelete(id);
    res.json(deleteProduct);
  } catch (error) {
    throw new Error(error);
  }
});

const getaProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const findProduct = await Product.find({ id: id });
    res.json({ data: findProduct });
  } catch (error) {
    throw new Error(error);
  }
});

const getaProductwithSku = asyncHandler(async (req, res) => {
  const { sku } = req.params;
  try {
    const findProduct = await Product.findOne({ sku: sku });
    res.json({ findProduct });
  } catch (error) {
    throw new Error(error);
  }
});

const deleteAllProduct = asyncHandler(async (req, res) => {
  try {
    const category = req.body.category;
    const deleteProduct = await Product.deleteMany({
      'categories.name': category
    });
    res.json(deleteProduct);
  } catch (error) {
    throw new Error(error);
  }
});

const getAllBannerProducts = asyncHandler(async (req, res) => {
  try {
    const banners = await Banner.find();
    const productIds = banners.map((banner) => banner.id);
    const products = await Product.find({ id: { $in: productIds } });
    const bannerproducts = products.map((product) => {
      const banner = banners.find((banner) => banner.id === product.id);
      return { ...product._doc, banner };
    });
    res.json({ data: banners });
  } catch (error) {
    throw new Error(error);
  }
});

const getAllProduct = asyncHandler(async (req, res) => {
  try {
    // Filtering
    const queryObj = { ...req.query };
    const excludeFields = ["page", "sort", "limit", "fields", "category", "featured", "search"];
    excludeFields.forEach((el) => delete queryObj[el]);
    let queryStr = JSON.stringify(queryObj);

    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    // if search is present then filter by search
    if (req.query.search) {
      queryStr = JSON.stringify({
        ...queryObj, "$or": [{ name: { $regex: req.query.search, $options: "i" } }, { short_description: { $regex: req.query.search, $options: "i" } },
        { "product_specs.description": { $regex: req.query.search, $options: "i" } },
        ]
      });
    }

    // if category is present then filter by category
    if (req.query.category) {
      queryStr = JSON.stringify({ ...queryObj, categories: { name: req.query.category } });
    }


    let query = Product.find(JSON.parse(queryStr));

    // Sorting
    if (req.query.sort) {
      const sortBy = req.query.sort.split(",").join(" ");
      query = query.sort(sortBy);
    } else {
      query = query.sort("-createdAt");
    }

    // limiting the fields
    if (req.query.fields) {
      const fields = req.query.fields.split(",").join(" ");
      query = query.select(fields);
    } else {
      query = query.select("-__v");
    }

    // pagination
    const page = req.query.page;
    const limit = req.query.limit;
    const skip = (page - 1) * limit;
    query = query.skip(skip).limit(limit);
    if (req.query.page) {
      const productCount = await Product.countDocuments();
      if (skip >= productCount) throw new Error("This Page does not exists");
    }
    const product = await query;
    res.json({ data: product });
  } catch (error) {
    throw new Error(error);
  }
});

const getAllProductsAdmin = asyncHandler(async (req, res) => {
  try {
    const {
      page
    } = req.query;
    const skip = (page - 1) * 50;
    const productCount = await Product.countDocuments();
    if (page || page < 1) {
      if (page > productCount) throw new Error("This Page does not exists");
    }
    const product = await Product.find().skip(skip).limit(50);
    res.json({ data: product, count: productCount });
  } catch (error) {
    throw new Error(error);
  }
});

const addToWishlist = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { prodId } = req.body;
  try {
    const user = await User.findById(_id);
    const alreadyadded = user.wishlist.find((id) => id.toString() === prodId);
    if (alreadyadded) {
      let user = await User.findByIdAndUpdate(
        _id,
        {
          $pull: { wishlist: prodId },
        },
        {
          new: true,
        }
      );
      res.json(user);
    } else {
      let user = await User.findByIdAndUpdate(
        _id,
        {
          $push: { wishlist: prodId },
        },
        {
          new: true,
        }
      );
      res.json(user);
    }
  } catch (error) {
    throw new Error(error);
  }
});


const rating = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { star, prodId, comment } = req.body;
  try {
    const product = await Product.findById(prodId);
    let alreadyRated = product.ratings.find(
      (userId) => userId.postedby.toString() === _id.toString()
    );
    if (alreadyRated) {
      const updateRating = await Product.updateOne(
        {
          ratings: { $elemMatch: alreadyRated },
        },
        {
          $set: { "ratings.$.star": star, "ratings.$.comment": comment },
        },
        {
          new: true,
        }
      );
    } else {
      const rateProduct = await Product.findByIdAndUpdate(
        prodId,
        {
          $push: {
            ratings: {
              star: star,
              comment: comment,
              postedby: _id,
            },
          },
        },
        {
          new: true,
        }
      );
    }
    const getallratings = await Product.findById(prodId);
    let totalRating = getallratings.ratings.length;
    let ratingsum = getallratings.ratings
      .map((item) => item.star)
      .reduce((prev, curr) => prev + curr, 0);
    let actualRating = Math.round(ratingsum / totalRating);
    let finalproduct = await Product.findByIdAndUpdate(
      prodId,
      {
        totalrating: actualRating,
      },
      { new: true }
    );
    res.json(finalproduct);
  } catch (error) {
    throw new Error(error);
  }
});

module.exports = {
  createProduct,
  getaProduct,
  getAllProduct,
  updateProduct,
  deleteProduct,
  addToWishlist,
  rating,
  deleteAllProduct,
  getAllBannerProducts,
  getAllProductsAdmin,
  getaProductwithSku
};
