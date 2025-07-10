const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TaskSchema = Schema({
    title: {
        type: String
    },
    description: {
        type: String
    },
    priority: {
        type: String,
        enum: ["Low", "Medium", "High"]
    },
    completion: {
        type: String,
        enum: ["Completed", "Pending"]
    }
},
{
    timestamps: true
});

module.exports = mongoose.model('Task', TaskSchema);