const gauth = require("../models/oauth");
const datastore = require("../models/datastore");
const formatRenter = require("../models/renter");
const helper = require("../helpers/methods");
const RENTER = "RENTER";

function formatAll(rentersList, req) {
    let renters = [];
    let selfURL = helper.buildSelfURL(req);
    for (let renter of rentersList) {
        let unformattedRenter = datastore.fromDatastoreItem(renter);
        unformattedRenter.url = selfURL;
        const formattedRenter = formatRenter.fromDS(unformattedRenter);
        renters.push(formattedRenter);
    }
    return renters;
};

const getRenters = async (req, res) => {
    const renters = await datastore.get_entities(RENTER);
    const formattedRenters = formatAll(renters, req);
    res.status(200).json(formattedRenters);
};

module.exports = {
    getRenters
};