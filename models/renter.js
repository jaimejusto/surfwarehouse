/**
 * Format renter data for the datastore
 */
 const toDS = (jwt_sub, boards, checkout_date, return_date) => {
    const nullDate = new Date(0);
    const formattedData = {
        "jwt_sub": jwt_sub || "",
        "boards": boards || [],
        "checkout_date": checkout_date || nullDate,
        "return_date": return_date || nullDate
    };
    return formattedData;
};

/**
 * Format renter data from datastore
 */

const fromDS = (obj) => {
    let newObj = {};
    newObj.id = obj.id;
    newObj.jwt_sub = obj.jwt_sub;
    newObj.boards = obj.boards;
    newObj.checkout_date = obj.checkout_date.toLocaleDateString();
    newObj.return_date = obj.return_date.toLocaleDateString();
    newObj.self = `${obj.url}/${obj.id}`
    return newObj;
};

module.exports = {
    toDS,
    fromDS
};