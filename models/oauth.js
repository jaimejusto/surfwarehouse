const {OAuth2Client} = require("google-auth-library");

// OAuth Constants
const CLIENT_ID = "647020123522-djc4t45v4l63bp9rd9i0df9oj7ea3cg9.apps.googleusercontent.com";

//OAuth client
const oauth2Client = new OAuth2Client(CLIENT_ID);


const verifyToken = async (token) => {
    const ticket = await oauth2Client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID,
    });
    const payload = ticket.getPayload();
    return payload;
};

const checkAuthentication = (req, res, next) => {
    let token = req.cookies["session-token"];
    
    verifyToken(token)
    .then( (payload) => {
        req.userID = payload.sub;
        next();
    })
    .catch( e => {
        res.redirect("/");
    })
};

module.exports = {
    verifyToken,
    checkAuthentication
};