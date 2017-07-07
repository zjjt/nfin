import {Meteor} from 'meteor/meteor';
import {FlowRouter} from 'meteor/kadira:flow-router';
import {Inventaire} from '../../api/collections.js';
const R= require('ramda');
import '../../utils/utils.js';

export const SNAPINVENTAIRE='SNAPINVENTAIRE';
export const FILTRERINVENTAIRE='FILTRERINVENTAIRE';

export function snapInvent(){
	let inv=Inventaire.find({},{sort:{DateAcquisition:1}}).fetch();
	return{
		type:SNAPINVENTAIRE,
		inventaireSnap:inv
	};
}

export function filterBy(filtre){
	return{
		type:FILTRERINVENTAIRE,
		filter:filtre
	}
}