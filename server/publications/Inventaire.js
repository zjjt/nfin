
import {Meteor} from 'meteor/meteor';
import {Inventaire} from '../../imports/api/collections.js';

export default InventairePub=()=>{
    Meteor.publish('inventaireTitre',function(){
        return Inventaire.find();
       
    });
}