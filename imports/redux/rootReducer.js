import {combineReducers} from 'redux';
import {reducer as formReducer} from 'redux-form';
//import adminReducer from './reducers/admin-reducer';
//import userReducer from './reducers/user-reducer';
import ApolloClient ,{createNetworkInterface} from 'apollo-client';


const networkInterface=createNetworkInterface({
	uri:'/graphql',
	credentials:'same-origin'//pour dire kils sont sur le meme domaine
});
const client= new ApolloClient({
	//quand on deploira l'application on devra decommenter la ligne ci dessous '
	networkInterface,
});

const reducers={
	apollo:client.reducer(),
	form:formReducer,
	administrateurAction:adminReducer,
	userActions:userReducer
};
const rootReducer=combineReducers(reducers);
export {client,rootReducer};