const express = require("express");
const api = require("../api/threeCalculations");

const router = express.Router();

router.post("/offset", api.calculateOffset);

module.exports = router;
