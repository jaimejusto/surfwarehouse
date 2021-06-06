const express = require("express");
const router = express.Router();
const gauth = require("../models/oauth");

//controller
const loginController = require("../controller/login");


router.route("/")
    .get(loginController.homePage)
;
router.route("/oauth")
    .post(loginController.oauth)
;
router.route("/user")
    .get( gauth.checkAuthentication, loginController.user)
;
router.route("/signout")
    .get(loginController.signout)
;
module.exports = router;