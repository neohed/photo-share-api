const {ApolloServer} = require('apollo-server');

const typeDefs = `
    enum PhotoCategory {
        SELFIE
        PORTRAIT
        ACTION
        LANDSCAPE
        GRAPHIC
    }
    
    type User {
        githubLogin: ID!
        name: String
        avatar: String
        postedPhotos: [Photo!]!
        inPhotos: [Photo!]!
    }
    
    # 1. Add Photo type definition
    type Photo {
        id: ID!
        url: String!
        name: String!
        description: String
        category: PhotoCategory!
        postedBy: User!
        taggedUsers: [User!]!
    }
    
    input PostPhotoInput {
        name: String!
        category: PhotoCategory=PORTRAIT
        description: String
    }

    # 2. Return Photo from allPhotos
    type Query {
        totalPhotos: Int!
        allPhotos: [Photo!]!
    }
    
    # 3. Return the newly posted photo from mutation
    type Mutation {
        postPhoto(input: PostPhotoInput!): Photo!
    }
`;

let _id = 0;
const users = [
    { "githubLogin": "dave1", "name": "Dave 1" },
    { "githubLogin": "dave2", "name": "Dave 2" },
    { "githubLogin": "dave3", "name": "Dave 3" },
];
const photos = [
    {
        "id": "1",
        "name": "pic 1",
        "description": "blarney",
        "category": "ACTION",
        "githubUser": "dave1"
    },
    {
        "id": "2",
        "name": "pic 2",
        "description": "hoopla!",
        "category": "ACTION",
        "githubUser": "dave2"
    },
    {
        "id": "3",
        "name": "pic 3",
        "description": "Whoop woop...",
        "category": "ACTION",
        "githubUser": "dave3"
    },
];
const tags = [
    { "photoID": "1", "userID": "dave1"},
    { "photoID": "2", "userID": "dave2"},
    { "photoID": "2", "userID": "dave3"},
    { "photoID": "3", "userID": "dave1"},
];

const resolvers = {
    Query: {
        totalPhotos: () => photos.length,
        allPhotos: () => photos
    },

    Mutation: {
        postPhoto(parent, args) {
            const newPhoto = {
                id: _id++ + '',
                ...args.input
            };

            photos.push(newPhoto);

            return newPhoto
        }
    },

    Photo: {
        url: parent => `http://yoursite.com/img/${parent.id}.jpg`,
        postedBy: parent => users.find(u => u.githubLogin === parent.githubUser),
        taggedUsers: parent => tags
            .filter(t => t.photoID === parent.id)
            .map(t => t.userID)
            .map(userID => users.find(u => u.githubLogin === userID))
    },

    User: {
        postedPhotos: parent => photos.filter(p => p.githubUser === parent.githubLogin),
        inPhotos: parent => tags
            .filter(t => t.userID === parent.id)
            .map(t => t.photoID)
            .map(photoID => photos.find(p => p.id === photoID))
    }
};

const server = new ApolloServer({
    typeDefs,
    resolvers
});

server
    .listen()
    .then(({url}) => console.log(`GraphQL Service running on ${url}`));
