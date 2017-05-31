
import {Meteor} from 'meteor/meteor';
import {FichiersOP} from '../../imports/api/collections.js';

export default FichiersOPPub=()=>{
    Meteor.publish('fichierCollection',function(){
        return FichiersOP.find().cursor;
       
    });
}