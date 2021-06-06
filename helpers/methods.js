function buildSelfURL (req) {
    const selfURL = req.protocol + "://" + req.hostname + req.baseUrl + req.path;
    return selfURL;
};

module.exports = {
    buildSelfURL
};