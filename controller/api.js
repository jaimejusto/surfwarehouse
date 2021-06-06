const methodNotAllowed = (req, res) => {
    res.status(405).set("Allow", "POST, GET")
};

module.exports = {
    methodNotAllowed
}