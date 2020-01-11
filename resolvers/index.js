const {GraphQLScalarType} = require('graphql');

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
        "githubUser": "dave1",
        "created": "3-28-1977"
    },
    {
        "id": "2",
        "name": "pic 2",
        "description": "hoopla!",
        "category": "ACTION",
        "githubUser": "dave2",
        "created": "1-2-1985"
    },
    {
        "id": "3",
        "name": "pic 3",
        "description": "Whoop woop...",
        "category": "ACTION",
        "githubUser": "dave3",
        "created": "2018-04-15"
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
                ...args.input,
                created: new Date()
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
    },

    DateTime: new GraphQLScalarType({
        name: 'DateTime',
        description: 'A JS date',
        parseValue: v => new Date(v),
        serialize: v => new Date(v).toISOString(),
        parseLiteral: ast => ast.value
    })
};

module.exports = resolvers;
