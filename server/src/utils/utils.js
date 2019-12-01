let mongo = require("../mongo-setup");

const roundRobin = (clients, counter) => {
    console.log(clients, counter);
    let client = clients[counter % clients.length];
    if (client === undefined) {
        return undefined;
    }
    counter = (counter + 1) % clients.length;
    mongo.updateRRCount(counter);
    console.log(`Client chosen ${client}`);
    return client;
}


module.exports = { roundRobin };