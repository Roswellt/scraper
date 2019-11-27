let counter = 0

const roundRobin = (clients) => {
    if (clients == []) {
        return undefined;
    }
    let client = clients[counter];
    counter = (client + 1) % clients.length;
    console.log(`Client chosen ${client}`);
    return client;
}


module.exports = { roundRobin };