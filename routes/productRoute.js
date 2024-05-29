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
  exportAllProducts,
  bulkOperation,
  getProductById,
  updateBannerProduct,
  createNewBanner,
  deleteBannerProduct,
} = require("../controller/productCtrl");
const { isAdmin, authMiddleware } = require("../middlewares/authMiddleware");
const router = express.Router();

router.get("/banner/getBannerProduct", getAllBannerProducts);
router.get("/export/all", authMiddleware, isAdmin, exportAllProducts);
router.post("/bulk/bulkoperation", authMiddleware, isAdmin, bulkOperation);
router.post("/banner/updateBannerProduct", authMiddleware, isAdmin, updateBannerProduct);
router.post("/banner/createBanner", authMiddleware, isAdmin, createNewBanner);
router.get("/:id", getaProduct);
router.put("/wishlist", authMiddleware, addToWishlist);
router.put("/rating", authMiddleware, rating);

router.post("/", authMiddleware, isAdmin, createProduct);
router.put("/update/:id", authMiddleware, isAdmin, updateProduct);
router.delete("/delete/:id", authMiddleware, isAdmin, deleteProduct);
router.delete("/banner/deletebanner/:id", authMiddleware, isAdmin, deleteBannerProduct);

router.get("/", getAllProduct);
router.get("/get/getallproducts", authMiddleware, isAdmin, getAllProductsAdmin);
router.get("/getproduct/:sku", authMiddleware, isAdmin, getaProductwithSku);
router.get("/getproductwithid/:id", getProductById);
router.get("/context/contextualSearch", contextualSearch);

module.exports = router;
