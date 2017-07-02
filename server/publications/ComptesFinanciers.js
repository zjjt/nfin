import {Meteor} from 'meteor/meteor';
import {ComptesFinanciers} from '../../imports/api/collections.js';

export default ComptesFinanciersPub=()=>{
    Meteor.publish('ComptesFinanciers',function(){
        return ComptesFinanciers.find();
       
    });
}