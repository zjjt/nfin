
import {Meteor} from 'meteor/meteor';
import {HistoriqueFIFOBackup} from '../../imports/api/collections.js';

export default HistoriqueFIFOBackPub=()=>{
    Meteor.publish('histoFIFOBack',function(){
        return HistoriqueFIFOBackup.find();
       
    });
}