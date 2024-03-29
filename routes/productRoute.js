const express = require("express");
const {
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
  contextualSearch,
} = require("../controller/productCtrl");
const { isAdmin, authMiddleware } = require("../middlewares/authMiddleware");
const router = express.Router();

router.get("/banner/getBannerProduct", getAllBannerProducts);

router.get("/:id", getaProduct);
router.put("/wishlist", authMiddleware, addToWishlist);
router.put("/rating", authMiddleware, rating);
router.delete("/deleteall", deleteAllProduct);

router.post("/", authMiddleware, isAdmin, createProduct);
router.put("/update/:id", authMiddleware, isAdmin, updateProduct);
router.delete("/delete/:id", authMiddleware, isAdmin, deleteProduct);

router.get("/", getAllProduct);
router.get("/get/getallproducts", authMiddleware, isAdmin, getAllProductsAdmin);
router.get("/getproduct/:sku", authMiddleware, isAdmin, getaProductwithSku);
router.get("/context/contextualSearch", authMiddleware, contextualSearch);

module.exports = router;
