const Permissions = require("../models/permissionModal");
const User = require("../models/userModel");
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

    const permission = await Permissions.findById(id);
    if (!permission) {
        res.status(404);
        throw new Error("Permission not found");
    }
    if (permission.role === "Super Admin") {
        res.status(403);
        throw new Error("Forbidden");
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
    try {
        const id = req.params.id;
        console.log(id);
        const permission = await Permissions.findById(id);
        // console.log(permission);

        // check if any admin has this permission
        const admins = await User.find({ role: "admin" }).populate("permission");
        // console.log(admins);
        let adminHasPermission = false;
        admins.forEach((admin) => {
            if (admin.permission._id.toString() === permission._id.toString()) {
                adminHasPermission = true;
            }
        });
        if (adminHasPermission) {
            console.log("Admin has this permission");
            return res.status(403).json({ message: "Admin has this permission" });

        }

        if (!permission) {
            console.log("Permission not found");
            res.status(404).json({ message: "Permission not found" });

        }
        if (permission.role === "Super Admin") {
            console.log("Forbidden");
            res.status(403).json({ message: "Forbidden" });

        }
        await permission.remove();
        res.json({ message: "Permission removed" });
    } catch (error) {
        console.log(error);
        res.status(400);
        throw new Error("Something went wrong");
    }
});

module.exports = {
    getPermissions,
    getPermission,
    createPermission,
    updatePermission,
    deletePermission,
};