import '../imports/startup/client/index';
import {Meteor} from 'meteor/meteor';

if(Meteor.isClient){
    Meteor.subscribe('fichierCollection');
}