import {Meteor} from 'meteor/mongo';
import {FilesCollection} from 'meteor/ostrio:files';
import {Mongo} from 'meteor/mongo';

let FichiersOP=new FilesCollection({
           storagePath:process.env.PWD+'/FICHIERS/relevers/',
            namingFunction(){
                return 'releveOp'
            },
            collectionName:'FichiersOP',
            allowClientCode:false,
            onBeforeunloadMessage(){
                if(Meteor.isClient){
                    alert("Le fichier est toujours en cours de téléchargement.Veuillez patienter...");
                }else
                {
                    return 'Le fichier est toujours en cours de téléchargement.Veuillez patienter...';
                }
                
            },
            onBeforeUpload(file){
                //allow file size under 10mb and only xlsx or xls
                if(file.size<=10485760 && /xls|xlsx/i.test(file.extension)){
                    return true;
                }else{ 
                    if(Meteor.isClient){
                    alert("Veuillez fournir un fichier excel xls ou xlsx. ");
                    }else
                    {
                        return 'Veuillez fournir un fichier excel xls ou xlsx. ';
                    }
                    
                }
            },
        });

let FichiersInv=new FilesCollection({
           storagePath:process.env.PWD+'/FICHIERS/Inventaire/',
            namingFunction(){
                return 'inventory'
            },
            collectionName:'FichiersInv',
            allowClientCode:false,
            onBeforeunloadMessage(){
                if(Meteor.isClient){
                    alert("Le fichier est toujours en cours de téléchargement.Veuillez patienter...");
                }else
                {
                    return 'Le fichier est toujours en cours de téléchargement.Veuillez patienter...';
                }
                
            },
            onBeforeUpload(file){
                //allow file size under 10mb and only xlsx or xls
                if(file.size<=10485760 && /csv/i.test(file.extension)){
                    return true;
                }else{ 
                    if(Meteor.isClient){
                    alert("Veuillez fournir un fichier inventaire csv. ");
                    }else
                    {
                        return 'Veuillez fournir un fichier inventaire csv. ';
                    }
                    
                }
            },
        });

let TempReleve=new Mongo.Collection('TempReleve');
let Inventaire=new Mongo.Collection('Inventaire');
let TempInventaire=new Mongo.Collection('TempInventaire');
let InventaireBackup=new Mongo.Collection('InventaireBackup');
let IsTraiting=new Mongo.Collection('IsTraiting');
let ComptesFinanciers=new Mongo.Collection('ComptesFinanciers');
let SGI=new Mongo.Collection('SGI');
let HistoriqueR=new Mongo.Collection('HistoriqueR');
let HistoriqueFIFO=new Mongo.Collection('HistoriqueFIFO');
let TempHistoFIFO=new Mongo.Collection('TempHistoFIFO');

export {IsTraiting,TempInventaire,FichiersOP,FichiersInv,TempReleve,Inventaire,InventaireBackup,SGI,HistoriqueR,HistoriqueFIFO,TempHistoFIFO,ComptesFinanciers};