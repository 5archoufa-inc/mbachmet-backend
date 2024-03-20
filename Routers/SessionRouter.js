const express = require("express");
const sessionRouter = express.Router();
const {login} = require("../controllers/SessionController.js");
const { log } = require("../utillities/logger.js");

// Route definitions
sessionRouter.post("/session/login", login);
    
module.exports = sessionRouter;