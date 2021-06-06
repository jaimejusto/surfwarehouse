/**
 * Format renter data for the datastore
 */
 const toDS = (renter_id, boards, checkout_date, return_date) => {
    const nullDate = new Date(0);
    const formattedData = {
        "renter_id": renter_id || "",
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
    newObj.renter_id = obj.renter_id;
    newObj.boards = obj.boards;
    newObj.checkout_date = obj.checkout_date;
    newObj.return_date = obj.return_date;
    return newObj;
};

module.exports = {
    toDS,
    fromDS
};