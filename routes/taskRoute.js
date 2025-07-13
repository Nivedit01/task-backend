const express = require("express");

const { verifyToken } = require("../middleware/verifyToken");
const { otpRequestLimiter } = require("../middleware/rateLimiter");
const { createTask, getTaskById, getTasks, updateTask, deleteTask } = require("../controllers/taskController");

const router = express.Router();

router.post('/create', verifyToken, createTask);
router.get('/get/:id', verifyToken, getTaskById);
router.get('/get', verifyToken, getTasks);
router.patch('/update/:id', verifyToken, updateTask);
router.delete('/delete/:id', verifyToken, deleteTask);


module.exports = router;