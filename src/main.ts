import { ApolloServer } from 'apollo-server';
import { resolvers } from './graphql/resolvers';
import { typeDefs } from './graphql/types';


const server = new ApolloServer({ typeDefs, resolvers});
server.listen(3000).then(({ url }) => {
	console.log(`Running GraphQL API Server on ${url}`);
});
