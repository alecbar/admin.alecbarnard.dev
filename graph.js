const graph = require('@microsoft/microsoft-graph-client')
require ('isomorphic-fetch')

module.exports = {
    getUserDetails: async (accessToken) => {
        const client = getAuthenticatedClient(accessToken)
        const user = await client.api('/me').get()
        return user
    }
}

const getAuthenticatedClient = (accessToken) => {
    const client = graph.Client.init({
        authProvider: (done) => {
            done(null, accessToken)
        }
    })

    return client
}