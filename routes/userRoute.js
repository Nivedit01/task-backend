const express = require("express");

const { verifyToken } = require("../middleware/verifyToken");
const { getUserById, updateUser, deleteUser } = require("../controllers/userController");

const router = express.Router();

router.get('/get', verifyToken, getUserById);
router.patch('/update', verifyToken, updateUser);
router.delete('/delete/:password', verifyToken, deleteUser);


module.exports = router;