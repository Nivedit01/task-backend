const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TaskSchema = Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    title: {
        type: String
    },
    description: {
        type: String
    },
    priority: {
        type: String,
        enum: ["low", "medium", "high"],
        default: "medium"
    },
    completion: {
        type: String,
        enum: ["completed", "pending"],
        default: "pending"
    },
    dueDate: {
        type: Date                
    },
},
    {
        timestamps: true
    });

module.exports = mongoose.model('Task', TaskSchema);