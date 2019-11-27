let counter = 0

const roundRobin = (clients) => {
    if (clients == []) {
        return [];
    }
    let client = clients[counter];
    if (client == undefined) {
        return [];
    }
    counter = (client + 1) % clients.length;
    return client;
}


module.exports = { roundRobin };