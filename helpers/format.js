const RENTER = "RENTER";
const SURFSHOP = "SURFSHOP";
const BOARD = "BOARD";

/**
 * Format renter data for the datastore.
 */
 function renterToDS(obj) {
    const formattedData = {
        "name": obj.name || "",
        "board": obj.board || "",
        "phone_number": obj.phone_number || ""
    };
    return formattedData;
};

/**
 * Format renter data from datastore
 */
function renterFromDS(obj) {
    let renter = {};
    renter.id = obj.id;
    renter.name = obj.name;
    renter.board = obj.board;
    renter.phone_number = obj.phone_number;
    renter.self = `${obj.url}/renters/${obj.id}`
    return renter;
};

/**
 * Format surfshop data for the datastore. 
 */
function surfshopToDS(manager, jwt_sub, location, boards) {
    const formattedData = {
        "manager": manager || "",
        "jwt_sub": jwt_sub || "",
        "location": location || "",
        "boards": boards || []
    };
    return formattedData;
};

/**
 * Format surfshop data from datastore
 */
function surfshopFromDS(obj) {
    let surfshop = {};
    let boards = false;
    if ("boards" in obj && obj.boards != "") {
        boards = [];
        for (let board of boards) {
            boards.push({"id": board, "self": `${obj.url}/boards/${board}`});
        }
    }
    surfshop.id = obj.id;
    surfshop.manager = obj.manager;
    surfshop.jwt_sub = obj.jwt_sub;
    surfshop.boards = boards || {};
    surfshop.location = obj.location;
    surfshop.self = `${obj.url}/surfshops/${obj.id}`;
    return surfshop;
};

/**
 * Format board data from datastore
 */
function boardFromDS(obj) {
    let board = {};
    let renter = false;
    let surfshop = false;
    if ("renter" in obj && obj.renter != "") {
        renter = {
            "id": obj.renter,
            "self": `${obj.url}/renters/${obj.renter}`
        };
    }
    if ("surfshop" in obj && obj.surfshop != "") {
        surfshop = {
            "id": obj.surfshop,
            "self": `${obj.url}/surfshops/${obj.surfshop}`
        };
    }

    board.id = obj.id;
    board.type = obj.type;
    board.condition = obj.condition;
    board.volume = obj.volume;
    board.tail = obj.tail;
    board.fins = obj.fins;
    board.renter = renter || {};
    board.surfshop = surfshop || {};
    board.self = `${obj.url}/boards/${obj.id}`;
    return board;
};
/** 
 * Format board data to datastore 
 */
function boardToDS(obj) {
    let board = {
        "type": obj.type || "",
        "condition": obj.condition || "",
        "volume": obj.volume || 0,
        "tail": obj.tail || "",
        "fins": obj.fins || "",
        "renter": obj.renter || "",
        "surfshop": obj.surfshopID || "",
    };
    return board;
};

function fromDS(obj, kind) {
    if (kind == RENTER) {
        return renterFromDS(obj);
    }
    else if (kind == SURFSHOP) {
        return surfshopFromDS(obj);
    }
    else if (kind == BOARD) {
        return boardFromDS(obj);
    }
};

function toDS(obj, kind) {
    if (kind == RENTER) {
        return renterToDS(obj);
    }
    else if (kind == BOARD) {
        return boardToDS(obj);
    }
};
module.exports = {
    renterToDS,
    renterFromDS,
    surfshopToDS,
    surfshopFromDS,
    boardToDS,
    boardFromDS,
    fromDS,
    toDS
};