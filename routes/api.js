const express = require("express");
const router = express.Router();

//controllers
const apiController = require("../controller/api");

const RENTER = "RENTER";
const SURFSHOP = "SURFSHOP";
const BOARD = "BOARD";


router.route("/")
    .all(apiController.noMethodsAllowed)
;
router.route("/boards")
    .all(apiController.checkIfAcceptable)
    .get( (req, res) => {apiController.protectedGetAllBoards(req, res)} )
    .post( apiController.checkIfSupported, (req, res) => {apiController.protectedPost(req, res)})
;

router.route("/surfshops")
    .all(apiController.checkIfAcceptable)
    .get( (req, res) => {apiController.unprotectedGetAll(req, res, SURFSHOP)} )
;

router.route("/renters")
    .all(apiController.checkIfAcceptable)
    .get( (req, res) => {apiController.unprotectedGetAll(req, res, RENTER)} )
    .post( apiController.checkIfSupported, (req, res) => {apiController.unprotectedPost(req, res, RENTER)} )

;

router.route("/boards/:board_id/renters/:renter_id")
    .all(apiController.checkIfAcceptable)
    .patch( (req, res) => {apiController.assignBoardToRenter(req, res)} )
    .delete((req, res) => {apiController.removeBoardFromRenter(req, res)} )
;
module.exports = router;