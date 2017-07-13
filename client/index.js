import '../imports/startup/client/index';
import {Meteor} from 'meteor/meteor';

window.onbeforeunload=()=>{
            let retour=false;
            retour=confirm("Une opération est en cours de traitement...Pour l'intégrité des données, nous vous recommendons de ne pas quitter cette page par ce moyen.\nNéanmoins si vous voulez quitter, appuyez sur OK");
            if(retour){
                 Meteor.call('dropInventory',(err,res)=>{
                    Meteor.call('chargeInvWithSnap',fifoSnap,()=>{
                    });
                });
                FlowRouter.go('dashboard');
            }
        };
if(Meteor.isClient){
  
}