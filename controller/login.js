const gauth = require("../models/oauth");
const datastore = require("../models/datastore");
const format = require("../helpers/format");
const SURFSHOP = "SURFSHOP";

// Helper Methods
async function addUser(userID, name) {
    const shopData = format.surfshopToDS(name, userID, null, null);
    const shop = await datastore.post_entity(SURFSHOP, shopData);
    return shop;
};

function returnUser(shopInfo) {
    let shop = datastore.fromDatastoreItem(shopInfo[0][0]);
    let formattedShop = format.surfshopFromDS(shop);
    return formattedShop;
};

function signout(req, res) {
    res.clearCookie("session-token");
    res.redirect("/");
};


// Controller Methods
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

const user = async (req, res) => {
    const matchingUser = await datastore.get_matching_entities(SURFSHOP, "jwt_sub", req.userID);
    let surfshop;
    // new user
    if (matchingUser.length == 0) {
        surfshop = await addUser(req.userID, req.userName);
        surfshop.manager = req.userName;
    }
    else {
        surfshop = returnUser(matchingUser);
    }
    // displays renter's datastore id number and JWT
    res.status(200).render("dashboard", {name: surfshop.manager, userID: surfshop.id, token: req.cookies["session-token"], title: "Surf Warehouse"});
};


module.exports = {
    homePage,
    oauth,
    user,
    signout
}