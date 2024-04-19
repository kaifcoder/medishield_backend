const Product = require("../models/productModel");
const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const slugify = require("slugify");
const validateMongoDbId = require("../utils/validateMongodbId");
const Banner = require("../models/bannerModel");

const createProduct = asyncHandler(async (req, res) => {
  try {
    const { sku } = req.body;
    const existingProduct = await Product.findOne({ sku: sku });
    if (existingProduct) {
      throw new Error("Product with this SKU already exists");
    }
    const newProduct = await Product.create(req.body);
    res.json(newProduct);
  } catch (error) {
    throw new Error(error);
  }
});

const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  console.log(req.body);
  console.log(id);
  try {
    const updateProduct = await Product.findOneAndUpdate({ sku: id }, req.body, {
      new: true,
    });
    res.json(updateProduct);
  } catch (error) {
    throw new Error(error);
  }
});

const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const deleteProduct = await Product.findByIdAndDelete(id);
    res.json(deleteProduct);
  } catch (error) {
    throw new Error(error);
  }
});

const getaProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const findProduct = await Product.find({ id: id, published: true });
    res.json({ data: findProduct });
  } catch (error) {
    throw new Error(error);
  }
});

const getProductById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const findProduct = await Product.findById(id);
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

const contextualSearch = asyncHandler(async (req, res) => {
  try {
    const search = req.query.search;
    const pipeline = [
      {
        $search: {
          index: "products",
          text: {
            query: search,
            path: {
              wildcard: "*",

            },
          },

        },
      },

      {
        $limit: 3
      },
      {
        $project: {
          _id: 0,
          name: 1,
          sku: 1,
          product_specs: {
            description: 1,
          },
          price: {
            minimalPrice: 1,
            regularPrice: 1,
          },
        },
      }
    ]
    const products = await Product.aggregate(pipeline);
    res.json({ data: products });
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
        ...queryObj, "$or": [{ name: { $regex: req.query.search, $options: "i" } },
        { manufacturer: { $regex: req.query.search, $options: "i" } },
        { short_description: { $regex: req.query.search, $options: "i" } },
        ],
        published: true
      });
    }

    // if category is present then filter by category
    if (req.query.category) {
      queryStr = JSON.stringify({ ...queryObj, categories: { name: req.query.category }, published: true });
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
    const skip = (page - 1) * 52;
    const productCount = await Product.countDocuments();
    if (page || page < 1) {
      if (page > productCount) throw new Error("This Page does not exists");
    }
    const product = await Product.find({

    }).skip(skip).limit(52);
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
  const name = req.user.firstname + " " + req.user.lastname;
  try {
    const product = await Product.findById(prodId);
    let alreadyRated = product.reviews.find(
      (review) => review.user.toString() === _id.toString()
    );
    if (alreadyRated) {
      const updateRating = await Product.updateOne(
        {
          reviews: { $elemMatch: alreadyRated },
        },
        {
          $set: { "reviews.$.rating": star, "reviews.$.detail": comment },
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
            reviews: {
              user: _id,
              userName: name,
              detail: comment,
              rating: star,
            },
          },
        },
        {
          new: true,
        }
      );
    }
    const getallratings = await Product.findById(prodId);

    res.json(getallratings);
  } catch (error) {
    throw new Error('error' + error.toString());
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
  getaProductwithSku,
  contextualSearch
};
