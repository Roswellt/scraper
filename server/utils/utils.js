let counter = 0

const roundRobin = (clients) => {
    let client = clients[counter % clients.length];
    if (client === undefined) {
        return undefined;
    }
    counter = (client + 1) % clients.length;
    console.log(`Client chosen ${client}`);
    return client;
}


module.exports = { roundRobin };