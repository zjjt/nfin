
import {Meteor} from 'meteor/meteor';
import {Fichiers} from '../../imports/api/collections.js';

export default()=>{
    Meteor.publish('fichierCollection',function(){
        return Fichiers.find().cursor;
       
    });
}