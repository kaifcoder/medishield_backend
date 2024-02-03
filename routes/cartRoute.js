const express = require("express");
const { authMiddleware } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/addToCart", authMiddleware, (req, res) => {
    res.send("Add to cart");
});

router.post("/removeFromCart", authMiddleware, (req, res) => {
    res.send("Remove from cart");
});

router.get("/getCart", authMiddleware, (req, res) => {
    res.send("Get cart");
});

module.exports = router;