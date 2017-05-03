import {Meteor} from 'meteor/meteor';
import {FlowRouter} from 'meteor/kadira:flow-router';
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
		Meteor.call('comptabilisation',rel,(err,res)=>{
			if(res){
				//on tri le tableau par reference et sur chaque element du nouveau tableau on verifie ke le type d4operation
				//es FRAAC et on en additionne leur montant
				//alert(JSON.stringify(res));
				let simpleArray=[];
				
			
				const groupAndSum=R.compose(
					R.map(R.reduce((acc,v)=>{
						//alert(R);j
							return R.assoc('montant',(acc.montant||0)+v.montant,v);		
					},{})),
					R.values,
					R.groupBy(R.compose(
						R.join(''),
						R.reject(R.isNil),
						R.props(['ref','ou','symbole','typeOp'])
					))
				);
				simpleArray=groupAndSum(res);
				
				if(dispatch({type:START_COMPTA_PROCESS,resComptaFull:res,resComptaSimple:simpleArray}))
					FlowRouter.go("report");
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