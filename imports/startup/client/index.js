import './routes';
import {Inventaire} from '../../api/collections.js';
import {Meteor} from 'meteor/meteor'

Meteor.startup(()=>{
    //on vide les collections temporaires
    Meteor.call("clearTemps",(err,res)=>{
        if(!res){
            alert("Veuillez patienter un traitement est en cours...")
        }
    });
    //-------------------
    WebFontConfig={
        google:{families:['Roboto:400,300,500:latin']}
    };
 
    (()=>{
        const wf=document.createElement('script');
        wf.src=('https:'==document.location.protocol?'https':'http')+'://ajax.googleapis.com/ajax/libs/webfont/1/webfont.js';
        wf.type='text/javascript';
        wf.async='true';
        const s=document.getElementsByTagName('script')[0];
        s.parentNode.insertBefore(wf,s);
        console.log("async font loaded",WebFontConfig);
    })();
  
});

