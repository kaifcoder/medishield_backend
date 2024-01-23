const express = require("express");
const {
  createUser,
  loginUserCtrl,
  getallUser,
  getaUser,
  deleteaUser,
  updatedUser,
  handleRefreshToken,
  logout,
  updatePassword,
  forgotPasswordToken,
  resetPassword,
  loginAdmin,
  getWishlist,
  saveAddress,
  userCart,
  getUserCart,
  emptyCart,
  isEmailVerified,
  createOrder,
  getOrders,
  updateOrderStatus,
  getAllOrders,
  sendVerificationEmail,
  verifyEmail,
  loginWithGoogle,
  isUserExists,
} = require("../controller/userCtrl");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");
const router = express.Router();

router.post("/login", loginUserCtrl);
router.post("/register", createUser);
router.post("/forgot-password-token", forgotPasswordToken);
router.post("/admin-login", loginAdmin);
router.post("/cart", authMiddleware, userCart);
router.post("/cart/cash-order", authMiddleware, createOrder);
router.post("/getorderbyuser/:id", authMiddleware, isAdmin, getAllOrders);

router.put("/reset-password/:token", resetPassword);
router.put("/password", authMiddleware, updatePassword);
router.put(
  "/order/update-order/:id",
  authMiddleware,
  isAdmin,
  updateOrderStatus
);

router.get("/all-users", getallUser);
router.get("/get-orders", authMiddleware, getOrders);
router.get("/getallorders", authMiddleware, isAdmin, getAllOrders);
router.get("/refresh", handleRefreshToken);
router.get("/logout", logout);
router.get("/wishlist", authMiddleware, getWishlist);
router.get("/cart", authMiddleware, getUserCart);
router.get("/:id", authMiddleware, isAdmin, getaUser);



router.put("/edit-user", authMiddleware, updatedUser);
router.put("/save-address", authMiddleware, saveAddress);


router.delete("/empty-cart", authMiddleware, emptyCart);
router.delete("/:id", deleteaUser);

router.get("/verify-email/:token", isEmailVerified);
router.get("/sendVerificationEmail/:id", sendVerificationEmail);
router.get("/verifyEmail/:token", verifyEmail);
router.get("/loginWithGoogle/:uid", loginWithGoogle);
router.get("/isUserExist/:uid", isUserExists);

module.exports = router;
