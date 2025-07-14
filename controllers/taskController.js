const Task = require("../models/taskModel");

// create task
const createTask = async (req, res) => {
    try {
        const { title, description, priority, completion, dueDate } = req.body;
        const userId = req.user.userId;  // assume auth middleware sets req.user

        const existingData = await Task.findOne({ title });
        if (existingData)
            return res.status(400).json({
                success: false,
                status: 400,
                message: "Task exists already!"
            });

        const task = await Task.create({
            userId: userId,
            title,
            description,
            priority,
            completion,
            dueDate
        });

        res.status(201).json({
            success: true,
            status: 201,
            message: "Task created successfully!",
            data: task
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            status: 500,
            message: error.message
        });
    }
};

// get task by id
const getTaskById = async (req, res) => {
    try {
        const task = await Task.findOne({ _id: req.params.id, userId: req.user.userId });
        if (!task) return res.status(404).json({ success: false, message: "Task not found" });

        res.status(200).json({
            success: true,
            status: 200,
            messsage: "Task fetched successully!",
            data: task
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            status: 500,
            message: error.message
        });
    }
};

// update a task
const updateTask = async (req, res) => {
    try {
        const updatedTask = await Task.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.userId },
            req.body,
            { new: true }
        );

        if (!updatedTask)
            return res.status(404).json({ success: false, message: "Task not found" });

        res.status(200).json({
            success: true,
            status: 200,
            messsage: "Task updated successfully!"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            status: 500,
            message: error.message
        });
    }
};

// delete a task
const deleteTask = async (req, res) => {
    try {
        const deleted = await Task.findOneAndDelete({
            _id: req.params.id,
            userId: req.user.userId
        });

        if (!deleted)
            return res.status(404).json({ success: false, message: "Task not found" });

        res.status(200).json({
            success: true,
            status: 200,
            messsage: "Task deleted successfully!"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            status: 500,
            message: error.message
        });
    }
};

// get task and filters
const getTasks = async (req, res) => {
    try {
        const userId = req.user.userId;

        const {
            priority,
            completion,
            tag,
            dueBefore,
            dueAfter,
            search
        } = req.query;

        let filter = { userId };

        if (priority) filter.priority = priority;
        if (completion) filter.completion = completion;
        if (tag) filter.tags = tag;
        if (dueBefore || dueAfter) {
            filter.dueDate = {};
            if (dueBefore) filter.dueDate.$lte = new Date(dueBefore);
            if (dueAfter) filter.dueDate.$gte = new Date(dueAfter);
        }
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } }
            ];
        }

        const tasks = await Task.find(filter).sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            status: 200,
            messsage: "Tasks fetched successfully!",
            data: tasks
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            status: 500,
            message: error.message
        });
    }
};

module.exports = {
    createTask,
    getTasks,
    getTaskById,
    updateTask,
    deleteTask,
}