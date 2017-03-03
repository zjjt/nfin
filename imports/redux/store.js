import {createStore,applyMiddleware,compose} from 'redux';
import createLogger from 'redux-logger';
import thunk from 'redux-thunk';
import {client,rootReducer} from './rootReducer';
import {persistStore,autoRehydrate} from 'redux-persist';
//import {moment} from 'meteor/momentjs:moment';
//import frenchLocale from '../api/momentjsConfig';


const middleware=[thunk,client.middleware()];
let devtools;

if(process.env.NODE_ENV==='development'){
	if(window.devToolsExtension){
		devtools=window.devToolsExtension();
	}else{
		const logger=createLogger();
		middleware.push(logger);
		devtools=f=>f;
	}
}else{
	devtools=f=>f;
}

const store=createStore(rootReducer,compose(applyMiddleware(...middleware),devtools)/*,autoRehydrate()*/);
/*persistStore(store,{
	whitelist:['adminReducer'],
})*/


//i18n chargement des middleware 

//moment.locale('en',frenchLocale);//dispatch une action pour changer les langues et regler la locale

export default store;