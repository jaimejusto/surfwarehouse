function buildSelfURL (req) {
    const selfURL = req.protocol + "://" + req.hostname + req.baseUrl;
    return selfURL;
};

module.exports = {
    buildSelfURL
};