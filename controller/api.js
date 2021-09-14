const gauth = require("../models/oauth");
const datastore = require("../models/datastore");
const formatItem = require("../helpers/format");
const helper = require("../helpers/methods");

const RENTER = "RENTER";
const BOARD = "BOARD";
const SURFSHOP = "SURFSHOP";

function formatAll(kind, itemsList, req) {
    let items = [];
    let selfURL = helper.buildSelfURL(req);
    if (itemsList && itemsList.length > 0) {
        for (let item of itemsList) {
            let unformattedItem = datastore.fromDatastoreItem(item);
            unformattedItem.url = selfURL;
            const formattedItem = formatItem.fromDS(unformattedItem, kind);
            items.push(formattedItem);
        }
    }
    return items;
};

function formatPaginatedAll(kind, itemsList, itemsLength, req) {
    let data = {};
    data["total results"] = itemsLength;
    data.results = formatAll(kind, itemsList[0], req);
    
    if (itemsList[1].moreResults != "NO_MORE_RESULTS") {
        data.next = req.protocol + "://" + req.hostname + req.baseUrl + req.path + "?cursor=" + encodeURIComponent(itemsList[1].endCursor);
    }
    return data;
};

function retrieveToken(req, res) {
    if (req.headers.authorization && req.headers.authorization.split(" ")[0] == "Bearer") {
        const token = req.headers.authorization.split(" ")[1];
        return token;
    }
    else {
        respondUnauthorized(res);
    }
};
function verifyJWTandReturnSub(token) {
    return gauth.verifyToken(token)
    .then( async (payload) => {
        return payload.sub;
    })
    .catch( () => {
        return false;
    });
};
function checkPostAttributes(obj, kind) {
    let errorMsgs = [];
    if (kind == RENTER) {
        if (obj.name == undefined || obj.phone_number == undefined) {
            errorMsgs.push("Name and phone number attributes are required.");
        }
        if ("boards" in obj && obj.boards.length > 0) {
            errorMsgs.push("Please use PUT or PATCH to add boards.");
        }
    }
    else if (kind == BOARD) {
        if (obj.type == undefined || obj.volume == undefined || obj.condition == undefined) {
            errorMsgs.push("Type, volume, and condition attributes are required.");
        }
        if (obj.renter || obj.surfshop) {
            errorMsgs.push("Please use PUT or PATCH to add renter and surfshop attributes.");
        }
    }
    return errorMsgs;
};
const noMethodsAllowed = (res) => {
    res.status(405).set("Allow", "").end();
};
const checkIfAcceptable = (req, res, next) => {
    console.log("checking if acceptable");
    if (!req.accepts("json")) {
        
        return res.status(406).send("Requested media type is unsupported.");
    }
    else {
        next();
    }
};
const respondOK = (res, data) => {
    res.status(200).type("json").json(data);
};
const respondCreated = (res) => {
    res.status(201).send();
};
const respondNoContent = (res) => {
    res.status(204).end();
}
const respondBadRequest = (res, errorMsg) => {
    res.status(400).json({"Error": errorMsg});
};
const respondUnauthorized = (res) => {
    res.status(401).json({"Error": "Unauthorized to access this resource."});
};
const respondForbidden = (res) => {
    res.status(403).json({"Error": "Forbidden from accessing this resource."});
};
const respondNotFound = (res) => {
    res.status(404).json({"Error": "Resource not found."});
};
const checkIfSupported = (req, res, next) => {
    if (!req.is("json")) {
        return res.status(415).send("Media type unsupported, server only accepts JSON.");
    }
    else {
        next();
    }
};

const unprotectedGetAll = async (req, res, kind) => {
    const allItems = await datastore.get_entities(kind);
    const items = await datastore.get_paginated_entities(kind, req);
    const formattedItems = formatPaginatedAll(kind, items, allItems.length, req);
    respondOK(res, formattedItems);
};

const protectedGetAllBoards = async(req, res) => {
    const token = retrieveToken(req, res);
    const verified_sub = await verifyJWTandReturnSub(token, res);
    if (verified_sub) {
        let matchingShop = await datastore.get_matching_entities(SURFSHOP, "jwt_sub", verified_sub);
        if (matchingShop && matchingShop.length > 0) {
            let formattedShop = datastore.fromDatastoreItem(matchingShop[0][0]);
            // return authorized surfshop's boards
            let boards = await datastore.get_matching_entities(BOARD, "surfshop", formattedShop.id);
            const formattedBoards = formatAll(BOARD, boards[0], req, "surfObj", formattedShop);
            return respondOK(res, formattedBoards);
        }
        else {
            respondForbidden(res);
        }
    }
    else {
        respondUnauthorized(res);
    }
};

const unprotectedPost = async(req, res, kind) => {
    const attributeErrors = checkPostAttributes(req.body, kind);
    if (attributeErrors.length > 0) {
        return respondBadRequest(res, attributeErrors);
    }
    const newItemData = formatItem.toDS(req.body, kind);
    const newItem = await datastore.post_entity(kind, newItemData);
    respondCreated(res);

};

const updateSurfshopBoards = async(shop, board) => {
    let currentBoards = shop.boards;
    currentBoards.push(board.id);
    shop.boards = currentBoards;
    let formattedShop = formatItem.surfshopToDS(shop.manager, shop.jwt_sub, shop.location, currentBoards);
    const updatedShop = await datastore.patch_entity(SURFSHOP, shop.id, formattedShop);
    return;

};
const protectedPost = async(req, res) => {
    const attributeErrors = checkPostAttributes(req.body, BOARD);
    if (attributeErrors.length > 0) {
        return respondBadRequest(res, attributeErrors);
    }

    const token = retrieveToken(req, res);
    const verified_sub = await verifyJWTandReturnSub(token, res);
    if (verified_sub) {

        let matchingShop = await datastore.get_matching_entities(SURFSHOP, "jwt_sub", verified_sub);
        if (matchingShop && matchingShop.length > 0) {
            const formattedShop = datastore.fromDatastoreItem(matchingShop[0][0]);
            let newBoard = req.body;
            newBoard.surfshopID = formattedShop.id;
            let formattedBoard = formatItem.toDS(newBoard, BOARD);
            let newBoardKey = await datastore.post_entity(BOARD, formattedBoard);
            formattedBoard.id = newBoardKey.id;
            updateSurfshopBoards(formattedShop, formattedBoard);
            respondCreated(res);
        }
        else {
            respondForbidden(res);
        }
    }
    else {
        respondUnauthorized(res);
    }
};

const assignBoardToRenter = async (req, res) => {
    const renter_id = req.params.renter_id;
    const board_id = req.params.board_id;
    // check if renter exists
    const renter = await getRenter(res, renter_id);
    if (renter && renter.board == "") {
        // check if board exists and if authorized to update it
        let board = await getBoard(req, res, board_id);
        let updatedRenter = datastore.fromDatastoreItem(renter);
        board.renter = updatedRenter.id;
        updatedRenter.board = board.id;
        let formattedRenter = formatItem.renterToDS(updatedRenter);
        let formattedBoard = formatItem.boardToDS(board);

        datastore.patch_entity(BOARD, formattedRenter.board, formattedBoard);
        datastore.patch_entity(RENTER, formattedBoard.renter, formattedRenter);
        respondOK(res, `Board ${board_id} was successfully rented out to renter ${renter_id}`);
    }
    // renter already has a board rented
    else {
        respondForbidden(res);
    }
};

const getRenter = async (res, renterID) => {
    let renterResults = await datastore.get_entity(RENTER, renterID);
    if (renterResults == 0) {
        return respondNotFound(res);
    }
    else {
        let renterData = renterResults[0][0];
        return renterData;
    }
};

const getBoard = async (req, res, boardID) => {
    const token = retrieveToken(req, res);
    const verified_sub = await verifyJWTandReturnSub(token, res);
    if (verified_sub) {
        let matchingShop = await datastore.get_matching_entities(SURFSHOP, "jwt_sub", verified_sub);
        if (matchingShop && matchingShop.length > 0) {
            // authorized shop owner
            let formattedShop = datastore.fromDatastoreItem(matchingShop[0][0]);
            // check if authorized to access the board
            let boards = await datastore.key_and_property_filter(BOARD, boardID, "surfshop", formattedShop.id);
            if (boards == 0) {
                return respondForbidden(res);
            }
            else {
                const formattedBoard = formatAll(BOARD, boards[0], req, "surfObj", formattedShop);
                return formattedBoard[0];
            }
        }
        else {
            respondForbidden(res);
        }
    }
    else {
        respondUnauthorized(res);
    }
};

const removeBoardFromRenter = async (req, res) => {
    const renter_id = req.params.renter_id;
    const board_id = req.params.board_id;
    // check if renter exists
    const renterResults = await getRenter(res, renter_id);
    if (renterResults && renterResults.board != "") {
        //check if board exists and if authorized to update it
        let board = await getBoard(req, res, board_id);
        let renter = datastore.fromDatastoreItem(renterResults);
        board.renter = "";
        renter.board = "";
        let formattedRenter = formatItem.renterToDS(renter);
        let formattedBoard = formatItem.boardToDS(board);

        datastore.patch_entity(BOARD, board_id, formattedBoard);
        datastore.patch_entity(RENTER, renter_id, formattedRenter);
        respondNoContent(res);
    }
    else {
        respondForbidden(res);
    }
};
module.exports = {
    noMethodsAllowed,
    checkIfAcceptable,
    checkIfSupported,
    unprotectedGetAll,
    unprotectedPost,
    protectedPost,
    protectedGetAllBoards,
    assignBoardToRenter,
    removeBoardFromRenter
};