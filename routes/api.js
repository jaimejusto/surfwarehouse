const express = require("express");
const router = express.Router();

//controllers
const apiController = require("../controller/api");
const boardsController = require("../controller/boards");

router.route("/")
    .get(apiController.methodNotAllowed)
    .post(apiController.methodNotAllowed)
    .patch(apiController.methodNotAllowed)
    .put(apiController.methodNotAllowed)
;
router.route("/boards")
;

module.exports = router;