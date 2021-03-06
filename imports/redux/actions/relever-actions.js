import {Meteor} from 'meteor/meteor';
import {FlowRouter} from 'meteor/kadira:flow-router';
import {Inventaire} from '../../api/collections.js';
const R= require('ramda');
import '../../utils/utils.js';

export const DECOUPAGEDONE='DECOUPAGEDONE';
export const START_COMPTA_PROCESS='START_COMPTA_PROCESS';
export const COMPTABILISATION_DONE='COMPTABILISATION_DONE';
export const SIMPLIFY='SIMPLIFY';
export const EXPLODE='EXPLODE';


export function decoupagedone(relever){
	return{
		type:DECOUPAGEDONE,
		releve:relever
	}
}
export function releverOk(){
	return(dispatch,getState)=>{
		//dispatch({type:COMPTABILISATION});
		let rel=getState().releveDuJour.releverDuJour;
		Meteor.apply('comptabilisation',[rel],
		{
			wait:true,
			onResultReceived:(result)=>{
				console.log("resultat de l'appel "+result);
			},
			throwStubExceptions:true
		},(err,res)=>{
			console.log(res)
			if(res){
				//alert(res);	
				if(dispatch({type:START_COMPTA_PROCESS,resComptaFull:res})){
					//alert(JSON.stringify(res));
					if(res!=undefined){
						FlowRouter.go("report");
						//setTimeout(FlowRouter.go("report"),5000);
					}
					
				}
					
			}else{
				alert(err);
			}
			
		});
	};
}

export function simplifyOp(){
	
	return{
		type:SIMPLIFY,

	}
}