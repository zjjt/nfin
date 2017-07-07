
import {Meteor} from 'meteor/meteor';
import {HistoriqueR} from '../../imports/api/collections.js';

export default HistoriqueRPub=()=>{
    Meteor.publish('histoR',function(){
        return HistoriqueR.find();
       
    });
}