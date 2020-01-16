const express = require('express');
const {ApolloServer} = require('apollo-server-express');
const { readFileSync } = require('fs');
const expressPlayground = require('graphql-playground-middleware-express').default;
const {resolvers} = require('./resolvers');

require('dotenv').config();
const typeDefs = readFileSync('./typeDefs.graphql', 'UTF-8');

async function start() {
    const app = express();

    const server = new ApolloServer({
        typeDefs,
        resolvers,
        context: {
            currentUser: {
                githubLogin: '8D6AB3A8-A69E-4043-A01D-42BE76465D32',
                name: 'Dave',
                avatar: '',
                postedPhotos: [],
                inPhotos: []
            }
        }
    });

    server.applyMiddleware({ app });

    app.get('/playground', expressPlayground({ endpoint: '/graphql' }));

    app.listen({ port: 4000 }, () =>
        console.log(`GraphQL Server running @ http://localhost:4000${server.graphqlPath}`)
    );
}

start();
