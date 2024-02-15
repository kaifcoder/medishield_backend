const express = require("express");
const {
  createCategory,
  updateCategory,
  deleteCategory,
  getCategory,
  getallCategory,
  getFeaturedCategory,
  updateChildrenCategory,
} = require("../controller/prodcategoryCtrl");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");
const router = express.Router();

router.post("/", authMiddleware, isAdmin, createCategory);
router.put("/:id", authMiddleware, isAdmin, updateCategory);
router.delete("/:id", authMiddleware, isAdmin, deleteCategory);
router.put("/child/:id", authMiddleware, isAdmin, updateChildrenCategory);
router.get("/", getallCategory);
router.get("/featured", getFeaturedCategory);

module.exports = router;
