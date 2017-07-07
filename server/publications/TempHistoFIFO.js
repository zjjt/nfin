import {Meteor} from 'meteor/meteor';
import {TempHistoFIFO} from '../../imports/api/collections.js';

export default TempHistoFIFOPub=()=>{
    Meteor.publish('tempFIFO',function(){
        return TempHistoFIFO.find();
       
    });
}