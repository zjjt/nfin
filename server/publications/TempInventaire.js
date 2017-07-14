
import {Meteor} from 'meteor/meteor';
import {TempInventaire} from '../../imports/api/collections.js';

export default TempInventairePub=()=>{
    Meteor.publish('tempinventaireTitre',function(){
        return TempInventaire.find();
       
    });
}