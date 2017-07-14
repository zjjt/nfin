import {Meteor} from 'meteor/meteor';
import {IsTraiting} from '../../imports/api/collections.js';

export default IsTraitingPub=()=>{
    Meteor.publish('istraiting',function(){
        return IsTraiting.find();
       
    });
}