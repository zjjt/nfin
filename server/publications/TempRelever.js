
import {Meteor} from 'meteor/meteor';
import {TempReleve} from '../../imports/api/collections.js';

export default()=>{
    Meteor.publish('tempReleve',function(){
        return TempReleve.find().cursor;
       
    });
}