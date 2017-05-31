import {Meteor} from 'meteor/meteor';
import {DBSQLITE,DBSQLSERVER} from './connectors.js';
import {Inventaire} from '../collections.js'; 
import Sequelize from 'sequelize';

DBSQLSERVER.sync();
DBSQLSERVER.authenticate().then(()=>{
    console.log('Connection MsSql etablie');
}).catch(()=>{
    console.log('Impossible de se connecter a MsSql,veuillez reverifier');
});
/*
DBSQLITE.sync();
DBSQLITE.authenticate().then(()=>{
    console.log('Connection SQLITE etablie');
}).catch(()=>{
    console.log('Impossible de se connecter a SQLITE,veuillez reverifier');
});*/

const resolvers={
    Query:{
         user(_,args){
            if(args.username){
                return Meteor.users.find({username:args.username}).fetch();
            }else{
                return Meteor.users.find({}).fetch();
            }
        },
        inventaire(_,args){
            if(args.type==="A" && (!args.search||args.search==="")){
                Inventaire.remove({DateAcquisition:""});
                return Inventaire.find({type:"ACTIONS"}).fetch();
            }else if(args.type==="A" && (args.search||args.search!=="")) {
                Inventaire.remove({DateAcquisition:""});
                return Inventaire.find({type:"ACTIONS",Valeur:{$regex:args.search}}).fetch();
            }else if(args.type==="O" && (!args.search||args.search==="")) {
                Inventaire.remove({DateAcquisition:""});
                return Inventaire.find({type:"OBLIGATIONS"}).fetch();
            }else if(args.type==="O" && (args.search||args.search!=="")) {
                Inventaire.remove({DateAcquisition:""});
                return Inventaire.find({type:"OBLIGATIONS",Valeur:{$regex:args.search}}).fetch();
            }else if(args.type==="ALL" && (!args.search||args.search==="")) {
                Inventaire.remove({DateAcquisition:""});
                return Inventaire.find({}).fetch();
            }else if(args.type==="ALL" && (args.search||args.search!=="")) {
                Inventaire.remove({DateAcquisition:""});
                return Inventaire.find({Valeur:{$regex:args.search}}).fetch();
            }
            
            /*if(args.type==="A" && (!args.search||args.search==="")){
                //if on veut les actions
                return Meteor.call('getInventory','A','',()=>{});
            }else if(args.type==="O"&& (!args.search||args.search==="")){
                //if on veut les obligations
                return Inventaire.find({type:"OBLIGATIONS"}).fetch();
            }else if((args.type==="A"||args.type==="O"||args.type==="ALL") && (args.search || args.search!=="")){
                return Inventaire.find({Valeur:/args.search/});
            }else if(args.type==="ALL" && (!args.search||args.search==="")){
                console.log(typeof Inventaire);
                return Inventaire.find({}).fetch();
            }*/
        }
    },
    /*Mutation:{
        deleteUsers(_,args){
             const codeArr=args.usercodes;
            Meteor.users.remove({codeRedac:{
                $in:codeArr
            }});
            userSQL.destroy({where:{
                    Redac:codeArr
                }});
                return Meteor.users.find({}).fetch();
            // return userSQL.findAll({attributes:{exclude:['id']},order:[['Nom','DESC']]});
        }
    }
   */
};



export default resolvers;