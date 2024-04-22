const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PermissionSchema = new Schema({
    role: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    permissions: {
        type: Array,
        required: true
    }
});

const Permission = mongoose.model('Permission', PermissionSchema);

module.exports = Permission;