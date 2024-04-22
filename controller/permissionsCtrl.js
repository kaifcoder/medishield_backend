const Permissions = require("../models/permissionModal");
const validateMongoDbId = require("../utils/validateMongodbId");
const asyncHandler = require("express-async-handler");


// @desc    Get all permissions
// @route   GET /api/permissions
// @access  Private
const getPermissions = asyncHandler(async (req, res) => {
    const permissions = await Permissions.find({});
    res.json(permissions);
});

// @desc    Get a permission
// @route   GET /api/permissions/:id
// @access  Private
const getPermission = asyncHandler(async (req, res) => {
    const id = req.params.id;
    if (!validateMongoDbId(id)) {
        res.status(400);
        throw new Error("Invalid ID");
    }
    const permission = await Permissions.findById(id);
    if (!permission) {
        res.status(404);
        throw new Error("Permission not found");
    }
    res.json(permission);
});

// @desc    Create a permission
// @route   POST /api/permissions
// @access  Private
const createPermission = asyncHandler(async (req, res) => {
    const { user } = req;
    if (!user) {
        res.status(401);
        throw new Error("Unauthorized");
    }
    if (user.role !== "admin") {
        res.status(403);
        throw new Error("Forbidden");
    }
    // if (user.permissions.permissions !== "manage_roles") {
    //     res.status(403);
    //     throw new Error("Forbidden");
    // }
    const { role, description, permissions } = req.body;
    const permission = await Permissions.create({
        role,
        description,
        permissions,
    });
    res.status(201).json(permission);
});

// @desc    Update a permission
// @route   PUT /api/permissions/:id
// @access  Private
const updatePermission = asyncHandler(async (req, res) => {
    const id = req.params.id;
    if (!validateMongoDbId(id)) {
        res.status(400);
        throw new Error("Invalid ID");
    }
    const permission = await Permissions.findById(id);
    if (!permission) {
        res.status(404);
        throw new Error("Permission not found");
    }
    const { role, description, permissions } = req.body;
    permission.role = role;
    permission.description = description;
    permission.permissions = permissions;
    await permission.save();
    res.json(permission);
});

// @desc    Delete a permission
// @route   DELETE /api/permissions/:id
// @access  Private
const deletePermission = asyncHandler(async (req, res) => {
    const id = req.params.id;
    if (!validateMongoDbId(id)) {
        res.status(400);
        throw new Error("Invalid ID");
    }
    const permission = await Permissions.findById(id);
    if (!permission) {
        res.status(404);
        throw new Error("Permission not found");
    }
    await permission.remove();
    res.json({ message: "Permission removed" });
});

module.exports = {
    getPermissions,
    getPermission,
    createPermission,
    updatePermission,
    deletePermission,
};