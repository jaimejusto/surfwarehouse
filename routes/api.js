const express = require("express");
const router = express.Router();

//controllers
const apiController = require("../controller/api");
const boardsController = require("../controller/boards");
const rentersController = require("../controller/renters");

router.route("/")
    .get(apiController.methodNotAllowed)
    .post(apiController.methodNotAllowed)
    .patch(apiController.methodNotAllowed)
    .put(apiController.methodNotAllowed)
;
router.route("/boards")
;

router.route("/surfshops")
;

router.route("/renters")
    .get(rentersController.getRenters)
;

module.exports = router;