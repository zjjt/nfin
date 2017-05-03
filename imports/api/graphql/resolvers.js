import {Meteor} from 'meteor/meteor';
import {DBSQLITE,DBSQLSERVER} from './connectors.js';
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