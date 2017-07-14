import { Meteor } from 'meteor/meteor';
import '../imports/startup/server/index';
import FichiersOPPub from './publications/Fichiers.js';
import FichiersInvPub from './publications/FichiersInv.js';
import InventairePub from './publications/Inventaire.js';
import IsTraitingPub from './publications/IsTraiting.js';
import {DBSQLITE,DBSQLSERVER} from '../imports/api/graphql/connectors.js';
import methods from './methods';

Meteor.startup(()=>{
   // Meteor.users._ensureIndex({codeRedac:1},{unique:true});
    FichiersInvPub();
    FichiersOPPub();
    InventairePub();
    TempInventairePub();
    ComptesFinanciersPub();
    IsTraitingPub();
    InventaireBackPub();
    HistoriqueRPub();
    HistoriqueFIFOPub();
    TempHistoFIFOPub();
    methods();
   //lancer une tache propre a l'application ms qui s'execute sur le serveur
   Meteor.call('defaultSGI',()=>{
       Meteor.call('defaultComptesFin',()=>{
        console.log("all default comptes inserted");
       });
       
   });
});
