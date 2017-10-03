import {Meteor} from 'meteor/meteor';
import '../../api/graphql/server.js';
import '../../api/collections.js';

Meteor.startup(()=>{
      //variables d'environnement node
      process.env.MAIL_URL=Meteor.settings.MAIL_SETTINGS;
    process.env.NODE_TLS_REJECT_UNAUTHORIZED=0;//a ne pas utiliser pour les appli externes
});

