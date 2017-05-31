
import {Meteor} from 'meteor/meteor';
import {FichiersInv} from '../../imports/api/collections.js';

export default FichiersInvPub=()=>{
    Meteor.publish('fichierCollectionInv',function(){
        return FichiersInv.find().cursor;
       
    });
}