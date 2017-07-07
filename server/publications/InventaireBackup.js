import {Meteor} from 'meteor/meteor';
import {InventaireBackup} from '../../imports/api/collections.js';

export default InventaireBackPub=()=>{
    Meteor.publish('inventaireTitreBack',function(){
        return InventaireBackup.find();
       
    });
}