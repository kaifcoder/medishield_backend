const express = require("express");
const {
    getPermissions,
    getPermission,
    createPermission,
    updatePermission,
    deletePermission,
} = require("../controller/permissionsCtrl");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");
const router = express.Router();

router.get("/", authMiddleware, isAdmin, getPermissions);
router.get("/:id", authMiddleware, isAdmin, getPermission);
router.post("/", authMiddleware, isAdmin, createPermission);
router.put("/:id", authMiddleware, isAdmin, updatePermission);
router.delete("/:id", authMiddleware, isAdmin, deletePermission);


module.exports = router;
