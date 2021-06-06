//Google Datastore
const {Datastore} = require("@google-cloud/datastore");

//Instantiate a datastore client
const projectID = "surf-warehouse-315920";
const datastore = new Datastore({projectId: projectID});


/**
 * Returns id from entity
 */
 const fromDatastoreItem = (item) => {
    item.id = item[datastore.KEY].id;
    return item;

};

/**
 * Saves a new entity.
 */
 const post_entity = async (kind, new_entity_data) => {
    // gets a key for the entity
    const key = datastore.key(kind);

    const new_entity = {
        "key": key,
        "data": new_entity_data
    };
    
    // saves the entity
    const response = await datastore.save(new_entity);
    return key;
 
};

/**
 * Delete an entity.
 */
 const delete_entity = async(kind, id) => {
    //get the entity's key
    let key = datastore.key([kind, parseInt(id, 10)]);

    // delete the entity
    const results = await datastore.delete(key);

    return results;
};



/**
 * Gets an entity.
 */
 const get_entity = async (kind, id) => {
    //get the entity's key
    let key = datastore.key([kind, parseInt(id, 10)]);

    //make the query to get the entity
    const query = datastore 
                    .createQuery(kind)
                    .filter('__key__', key);

    //run the query to get the entity
    const results = await datastore.runQuery(query);
    // entity doesn't exist
    if (results[0].length == 0) {
        return 0;
    }
    // entity exists
    else {
        // format entity key and data
        return results;
    }
};

/**
 * Gets entitites by matching property
 */
const get_matching_entities = async (kind, property, value) => {
    const query = datastore.createQuery(kind)
                    .filter(property, value);
    const results = await datastore.runQuery(query);
    if (results[0].length == 0) {
        return 0;
    }
    else {
        return results;
    }
};

/**
 * Get entities by filtering two properties
 */
const two_property_filter = async (kind, property1, value1, property2, value2) => {
    const query = datastore.createQuery(kind)
                    .filter(property1, value1)
                    .filter(property2, value2);
    const results = await datastore.runQuery(query);
    if (results[0].length == 0) {
        return 0;
    }
    else {
        return results;
    }
};

module.exports = {
    fromDatastoreItem,
    post_entity,
    delete_entity,
    get_entity,
    get_matching_entities,
    two_property_filter
};