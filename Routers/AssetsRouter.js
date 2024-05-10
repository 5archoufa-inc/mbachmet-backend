const express = require("express");
const assetsRouter = express.Router();
const { log } = require("../utillities/logger.js");
const colors = require("../assets/colors.js");

// Route definitions
assetsRouter.get("/color/list", (req, res)=>{
    res.status(200).json({colors});
});

module.exports = assetsRouter;