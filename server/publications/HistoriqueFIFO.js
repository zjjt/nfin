
import {Meteor} from 'meteor/meteor';
import {HistoriqueFIFO} from '../../imports/api/collections.js';

export default HistoriqueFIFOPub=()=>{
    Meteor.publish('histoFIFO',function(){
        return HistoriqueFIFO.find();
       
    });
}