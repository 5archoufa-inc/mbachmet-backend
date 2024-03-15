const express = require('express');
const router = express.Router();
const userController=require("../controllers/UserController")
// POST /users
router.post('/signup', userController.createUser);

//get /users
router.get('/id',userController.getUser);

router.get("/",userController.getAllUsers);

module.exports = router;
