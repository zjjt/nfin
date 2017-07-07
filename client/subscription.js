import {Meteor} from 'meteor/meteor';
  Meteor.subscribe('fichierCollection');
  Meteor.subscribe('inventaireTitre');
  Meteor.subscribe('fichierCollectionInv');
  Meteor.subscribe('ComptesFinanciers');
    Meteor.subscribe('tempFIFO');
  Meteor.subscribe('histoFIFO');
  Meteor.subscribe('histoR');
   Meteor.subscribe('inventaireTitreBack');