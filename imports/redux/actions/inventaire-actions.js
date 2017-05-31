import {Meteor} from 'meteor/meteor';
import {FlowRouter} from 'meteor/kadira:flow-router';
import {Inventaire} from '../../api/collections.js';
const R= require('ramda');
import '../../utils/utils.js';

export const SNAPINVENTAIRE='SNAPINVENTAIRE';

export function snapInvent(){
	let inv=Inventaire.find({}).fetch();
	return{
		type:SNAPINVENTAIRE,
		inventaireSnap:inv
	};
}