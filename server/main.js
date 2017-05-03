import { Meteor } from 'meteor/meteor';
import '../imports/startup/server/index';
import publications from './publications/Fichiers.js';
import {DBSQLITE,DBSQLSERVER} from '../imports/api/graphql/connectors.js';
import methods from './methods';

Meteor.startup(()=>{
   // Meteor.users._ensureIndex({codeRedac:1},{unique:true});
    publications();
    methods();
   //lancer une tache propre a l'application ms qui s'execute sur le serveur
   Meteor.call('defaultSGI',()=>{
       Meteor.call('defaultComptesFin',()=>{
        console.log("all default inserted");
       });
   });
});
