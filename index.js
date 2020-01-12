const express = require('express');
const {ApolloServer} = require('apollo-server-express');
const { MongoClient } = require('mongodb');
const { readFileSync } = require('fs');
const expressPlayground = require('graphql-playground-middleware-express').default;
const {resolvers} = require('./resolvers');

require('dotenv').config();
const typeDefs = readFileSync('./typeDefs.graphql', 'UTF-8'); // require('./typeDefs.graphql');

async function start() {
    const app = express();
    const MONGO_DB = process.env.DB_HOST;
    let db;

    try {
        const client = await MongoClient.connect(MONGO_DB, { useNewUrlParser: true })
        db = client.db()
    } catch (err) {
        console.log(`
        
          Mongo DB Host not found!
          please add DB_HOST environment variable to .env file
          exiting...
           
        `);

        process.exit(1)
    }

    const server = new ApolloServer({
        typeDefs,
        resolvers,
        context: async ({ req }) => { // context can be object or function. When a function it is invoked for every GraphQL request.
            const githubToken = req.headers.authorization;
            const currentUser = await db.collection('users').findOne({ githubToken });

            return { // The object returned is the context sent to the resolver.
                db,
                currentUser
            }
        }
    });

    server.applyMiddleware({ app });

    app.get('/playground', expressPlayground({ endpoint: '/graphql' }));

    app.get('/', (req, res) => {
        let url = `https://github.com/login/oauth/authorize?client_id=${process.env.CLIENT_ID}&scope=user`
        res.end(`<a href="${url}">Sign In with Github</a>`)
    });

    app.listen({ port: 4000 }, () =>
        console.log(`GraphQL Server running @ http://localhost:4000${server.graphqlPath}`)
    );
}

start();
