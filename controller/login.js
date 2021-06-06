const gauth = require("../models/oauth");
const datastore = require("../models/datastore");
const formatRenter = require("../models/renter");
const RENTER = "RENTER";


const homePage = (req, res) => {
    res.status(200).render("home", {title: "Surf Warehouse"});
};

const oauth = (req, res) => {
    let token = req.body.token;
    gauth.verifyToken(token)
    .then( () => {
        res.cookie("session-token", token);
        res.send("verified");
    })
    .catch(console.error);
};

const addUser = async (userID) => {
    const userData = formatRenter.toDS(userID, null, null, null);
    renter = await datastore.post_entity(RENTER, userData);
    return renter;
};

const returnUser = (renterInfo) => {
    let renter = datastore.fromDatastoreItem(renterInfo[0][0]);
    let formattedRenter = formatRenter.fromDS(renter);
    return formattedRenter;
};

const user = async (req, res) => {
    const matchingUser = await datastore.get_matching_entities(RENTER, "renter_id", req.userID);
    let renter;
    // new user, add to DB
    if (matchingUser == 0) {
        renter = await addUser(req.userID);
    }
    else {
        renter = returnUser(matchingUser);
    }
    res.status(200).render("dashboard", {userID: renter.id, token: req.cookies["session-token"], title: "Surf Warehouse"});
};

const signout = (req, res) => {
    res.clearCookie("session-token");
    res.redirect("/");
};

module.exports = {
    homePage,
    oauth,
    user,
    signout
}