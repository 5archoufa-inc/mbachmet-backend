const express = require("express");
const roomRouter = express.Router();
const {create, join} = require("../controllers/RoomController.js");
const { log } = require("../utillities/logger.js");

// Route definitions
roomRouter.post("/room/create", create);
roomRouter.post("/room/join", join);

module.exports = roomRouter;