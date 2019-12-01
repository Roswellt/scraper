class ClientsArray {

  constructor() {
    this.clients = []
  }

  addClient(client_id, socket_id) {
      var client = { client_id, socket_id };
      this.clients.push(client);
      return client;
  }

  removeClient(id) {
      var removedClient = this.clients.filter((client) => client.socket_id === id)[0];
      if (removedClient) {
          this.clients = this.clients.filter((client) => client.socket_id !== id);
      }
      return removedClient;
  }

  getClient(id) {
      return this.clients.filter((client) => client.client_id === id)[0];
  }

  getClients() {
    return this.clients;
  }
  
}

module.exports = { ClientsArray };