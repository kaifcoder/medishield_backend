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
  getUser,
  resetPasswordForm,
  removeCartItem,
  getAddresses,
  deleteAddress,
  updateAddress,
} = require("../controller/userCtrl");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");
const router = express.Router();

router.post("/login", loginUserCtrl);
router.post("/register", createUser);
router.post("/admin-login", loginAdmin);
router.get("/isUserExist/:uid", isUserExists);
router.get("/verify-email/:token", isEmailVerified);
router.get("/sendVerificationEmail/:id", sendVerificationEmail);
router.get("/verifyEmail/:token", verifyEmail);
router.get("/loginWithGoogle/:uid", loginWithGoogle);

router.post("/cart", authMiddleware, userCart);
router.post("/cart/remove", authMiddleware, removeCartItem);
router.post("/cart/create-order", authMiddleware, createOrder);
router.post("/getorderbyuser/:id", authMiddleware, isAdmin, getAllOrders);

router.post("/forgot-password-token", forgotPasswordToken);
router.get('/reset-password/:token', resetPasswordForm);
router.post("/reset-password/:token", resetPassword);
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
router.get("/get/:email", getUser);
router.get("/address", authMiddleware, getAddresses);
router.get("/:id", authMiddleware, isAdmin, getaUser);



router.put("/save-address", authMiddleware, saveAddress);
router.put("/edit-user", authMiddleware, updatedUser);
router.put("/update-address/:id", authMiddleware, updateAddress);


router.delete("/empty-cart", authMiddleware, emptyCart);
router.delete("/:id", deleteaUser);
router.delete("/address/:id", authMiddleware, deleteAddress);




module.exports = router;
