
import {Meteor} from 'meteor/meteor';
import {HistoriqueRBackup} from '../../imports/api/collections.js';

export default HistoriqueRBackPub=()=>{
    Meteor.publish('histoRBack',function(){
        return HistoriqueRBackup.find();
       
    });
}