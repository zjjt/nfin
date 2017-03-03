import express from 'express';
import bodyParser from 'body-parser';
import {Meteor} from 'meteor/meteor';
import {apolloExpress,graphiqlExpress} from 'apollo-server';
import {makeExecutableSchema,addMockFunctionsToSchema} from 'graphql-tools';
import proxyMiddleware from 'http-proxy-middleware';
import schema from './schema.js';
import resolvers from './resolvers.js';


const GRAPHQL_PORT=4000;

let graphQLServer=express();

const executableSchema=makeExecutableSchema({
  typeDefs:schema,
  resolvers:resolvers,
  allowUndefinedInResolve:false,
  printErrors:true
});

graphQLServer.use('/graphql',bodyParser.json(),apolloExpress({
    schema:executableSchema,
    context:{}
}));
graphQLServer.use('/graphiql',graphiqlExpress({
  endpointURL:'/graphql'
}));
graphQLServer.use('/', (req, res) => res.redirect('/graphiql'));
graphQLServer.listen(GRAPHQL_PORT);
WebApp.rawConnectHandlers.use(proxyMiddleware(`http://localhost:${GRAPHQL_PORT}/graphql`));