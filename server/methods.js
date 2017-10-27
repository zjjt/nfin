import {Meteor} from 'meteor/meteor';
import {Accounts} from 'meteor/accounts-base';
import Sequelize from 'sequelize';
import {DBSQLITE,DBSQLSERVER} from '../imports/api/graphql/connectors.js';
import {moment} from 'meteor/momentjs:moment';
//import Excel from 'exceljs';
import LineByLineReader from 'line-by-line';
import {IsTraiting,TempInventaire,TempReleve,SGI,ComptesFinanciers,TempHistoFIFO,FichiersInv,Inventaire,HistoriqueFIFO,HistoriqueFIFOBackup,HistoriqueR,HistoriqueRBackup,InventaireBackup} from '../imports/api/collections.js';
import Future from 'fibers/future';
import {arrAreSame,transformInFrenchDate,groupByLibel,groupSumBySymbole,convertInDateObjFromFrenchDate} from '../imports/utils/utils.js';
//import {Baby} from 'meteor/modweb:baby-parse';
import Baby from 'babyparse';
import {check} from 'meteor/check';
import{Promise} from 'meteor/promise';
import {Email} from 'meteor/email';
import _ from 'lodash';
const R= require('ramda');
const streamBuffers=require("stream-buffers");
const fs=require('fs');

//const json2xls=require('json2xls');
let Excel=require('exceljs');
let xlfile=process.env.PWD+'/FICHIERS/relevers/releveOp.xls';



Array.prototype.groupBy=function(prop){
    return this.reduce(function(groups,item){
        var val=item[prop];
        groups[val]=groups[val] || [];
        groups[val].push(item);
        return groups;
    },{});
}


function remplirFeuilleControl(sheets){
    sheets[0].addRow(['*',"Control Worksheet (NB any row with a '*' as the first character in column A is ignored)",""]);
    sheets[0].addRow();
    sheets[0].addRow();
    sheets[0].addRow(["*","Global Parameters (setdefault will be used unless parameter of same name is passed in from Agresso)"]);
    sheets[0].addRow(['*',"Parameter","Value"]);
    sheets[0].addRow(['setdefault',"client","F3"]);
    sheets[0].addRow(['setdefault',"period","201607"]);
    sheets[0].addRow(['set',"user_id","upgr55"]);
    sheets[0].addRow(['set',"batch_id","PB05"]);
    sheets[0].addRow(['set',"interface","BI"]);
    sheets[0].addRow(['set',"trans_type","GL"]);
    sheets[0].addRow(['set',"voucher_type","C2"]);
    sheets[0].addRow(['set',"voucher_date",moment(new Date()).format("DD/MM/YYYY")]);
    sheets[0].addRow(['set',"variant_number"]);
    sheets[0].addRow(['set',"currency","XOF"]);
    sheets[0].addRow();
    sheets[0].addRow();
    sheets[0].addRow();
    sheets[0].addRow();
    sheets[0].addRow(["*","setnum allows use of arithmetic expressions on parameters"]);
    sheets[0].addRow(["*setnum","year","<period> \ 100"]);
    sheets[0].addRow(["*setnum","pyear","<year> - 1"]);
    sheets[0].addRow(["*setnum","period0","<year> * 100"]);
    sheets[0].addRow();
    sheets[0].addRow(["*","setperiod allows use of arithmetic expressions on period parameters"]);
    sheets[0].addRow(["*","e.g. set previous 12 periods for a rolling 12 month crosstab by period"]);
    sheets[0].addRow(["*setperiod","period1","<period> - 11"]);
    sheets[0].addRow(["*setperiod","period2","<period> - 10"]);
    sheets[0].addRow(["*setperiod","period3","<period> - 9"]);
    sheets[0].addRow(["*setperiod","period4","<period> - 8"]);
    sheets[0].addRow(["*setperiod","period5","<period> - 7"]);
    sheets[0].addRow(["*setperiod","period6","<period> - 6"]);
    sheets[0].addRow(["*setperiod","period7","<period> - 5"]);
    sheets[0].addRow(["*setperiod","period8","<period> - 4"]);
    sheets[0].addRow(["*setperiod","period9","<period> - 3"]);
    sheets[0].addRow(["*setperiod","period10","<period> - 2"]);
    sheets[0].addRow(["*setperiod","period11","<period> - 1"]);
    sheets[0].addRow(["*set","period12","<period>"]);
    sheets[0].addRow();
    sheets[0].addRow();
    sheets[0].addRow();
    sheets[0].addRow(["*","Worksheet Directory"]);
    sheets[0].addRow(["*","Sheet Name","Template Name","Local Parameters","Insert Strings"]);
}


function comptaMVPV(e,index,quantiteRestante,pvmvTemp,tableauRes){ //on renvoi un array d'objet avec la plus ou moins value
     //FIFO on verifie que cette ligne n'existe pas deja dans l'inventaire si elle existe on skip
                           // console.log("=====tableauRes au debut de la fonction comptaMVPV========")
                            //console.log(tableauRes.length);
                            //console.log(tableauRes);
                            //console.log("=====tableauRes au debut de la fonction comptaMVPV========")
                            let temp={};
                            let mvpv={};
                            let COMPTES=ComptesFinanciers.find().fetch();
                           let dateAchatFormatted=convertInDateObjFromFrenchDate(transformInFrenchDate(e.DATE_ACHAT_DES_TITRES));
                           //console.log("===== Date Achat en francais vente d'action "+dateAchatFormatted);
                           let existInFIFO=TempInventaire.findOne({Symbole:e.SYMBOLE},{sort:{DateAcquisition:1}});
                           if(existInFIFO){
                              //si l'action existe dans l'inventaire on verifie la premiere occurence de l'action dans l'inventaire
                               console.log("Le voila premier objet trouver pour la vente d'action symbole= " +e.SYMBOLE+" est: "+existInFIFO.DateAcquisition);
                               //console.log(existInFIFO);
                                console.log("la quantite restante en stock est "+quantiteRestante);
                               /**Procedure vente d'actions
                                * 1-determiner si il ya moins value 
                                */
                                if(e.PRIX_UNITAIRE<existInFIFO.PrixUnitaire){
                                    //on a une moins value=====================================>
                                    let newQteEnStockDuPremierTrouver;
                                    if(quantiteRestante===0){
                                        newQteEnStockDuPremierTrouver=existInFIFO.Quantite-e.QUANTITE;
                                        console.log("1newQteEnStockDuPremierTrouverMV: "+existInFIFO.Quantite+"-"+e.QUANTITE+"="+newQteEnStockDuPremierTrouver);
                                    }else if(quantiteRestante>0){
                                       
                                        newQteEnStockDuPremierTrouver=existInFIFO.Quantite-quantiteRestante;
                                        console.log("2newQteEnStockDuPremierTrouver: "+existInFIFO.Quantite+"-"+quantiteRestante+"="+newQteEnStockDuPremierTrouver);
                                    }
                                    
                                    if(newQteEnStockDuPremierTrouver>0){
                                        console.log("moins value et newQte superieur a >0");
                                        let montantMV=quantiteRestante>0?(existInFIFO.PrixUnitaire-e.PRIX_UNITAIRE)*quantiteRestante : (existInFIFO.PrixUnitaire-e.PRIX_UNITAIRE)*e.QUANTITE;
                                        TempInventaire.update(existInFIFO,{
                                            $set:{
                                                ValBilan:newQteEnStockDuPremierTrouver*existInFIFO.PrixUnitaire,
                                                Quantite:newQteEnStockDuPremierTrouver,
                                                lastTypeOp:"VACMV"
                                            }
                                        });
                                        //comptabilisation moins value
                                        let compte=COMPTES.filter((obj)=>{
                                            return obj.type==="AC"
                                        });
                                        compte=compte[0];
                                        let libelleQteAfficher;
                                        if(quantiteRestante>0){
                                            libelleQteAfficher=quantiteRestante;
                                        }else{
                                            libelleQteAfficher=e.QUANTITE;
                                        }
                                        temp.compte=compte;
                                        temp.libelle="Cession de "+libelleQteAfficher+" actions "+e.VALEUR+" au prix d'achat de "+existInFIFO.PrixUnitaire;
                                        temp.libelleS="Cession de "+libelleQteAfficher+" actions "+e.VALEUR+" au prix d'achat de "+existInFIFO.PrixUnitaire;
                                        temp.montant=quantiteRestante>0 ? existInFIFO.PrixUnitaire*quantiteRestante : existInFIFO.PrixUnitaire*e.QUANTITE;
                                        temp.symbole=e.SYMBOLE;
                                        temp.ref=parseInt(e.REFERENCE);
                                        temp.ou="C";
                                        temp.qte=libelleQteAfficher;
                                        temp.date=dateAchatFormatted;
                                        temp.typeOp="VAC";
                                        temp.indexOP=index;

                                        compte=COMPTES.filter((obj)=>{
                                            return obj.type==="MV"
                                        });
                                        compte=compte[0];
                                        mvpv.compte=compte;
                                        mvpv.libelle="Moins value sur cession de "+libelleQteAfficher+" actions "+e.VALEUR;
                                        mvpv.libelleS="Moins value sur cession de "+libelleQteAfficher+" actions "+e.VALEUR;
                                        mvpv.montant=montantMV;
                                        mvpv.symbole=e.SYMBOLE;
                                        mvpv.ref=parseInt(e.REFERENCE);
                                        mvpv.ou="D";
                                        mvpv.qte=libelleQteAfficher;
                                        mvpv.date=dateAchatFormatted;
                                        mvpv.typeOp="VAC";
                                        mvpv.indexOP=index+1;
                                        //Archivage de la vente dans HistoriqueFIFO
                                        TempHistoFIFO.insert({
                                            Valeur:e.VALEUR,
                                            Date:dateAchatFormatted,
                                            typeop:'VENTE-',
                                            Quantite:libelleQteAfficher,
                                            prixVente:e.PRIX_UNITAIRE,
                                            prixAchat:existInFIFO.PrixUnitaire,
                                            ValBilan:0,
                                            PMvalue:montantMV,
                                            Symbole:e.SYMBOLE,
                                            ref:parseInt(e.REFERENCE),
                                            type:'ACTIONS'
                                        });
                                        tableauRes.push({temp,mvpv});
                                        console.log("content of tableauRes avant return======");
                                        //console.log(tableauRes);
                                        tableauRes.forEach((e)=>pvmvTemp.push(e));
                                        //return tableauRes;
                                        

                                    }else if(newQteEnStockDuPremierTrouver<0){
                                        //enlever la ligne dont la quantite est epuisee
                                        let montantMV=(existInFIFO.PrixUnitaire-e.PRIX_UNITAIRE)*existInFIFO.Quantite;
                                        TempInventaire.remove(existInFIFO,()=>{
                                            //on comptabilise la moins value et la sortie de stock(vente)
                                            
                                        });
                                         //comptabilisation moins value
                                            let compte=COMPTES.filter((obj)=>{
                                                return obj.type==="AC"
                                            });
                                            compte=compte[0];
                                            temp.compte=compte;
                                            temp.libelle="Cession de "+existInFIFO.Quantite+" actions "+e.VALEUR+" au prix d'achat de "+existInFIFO.PrixUnitaire;
                                            temp.libelleS="Cession de "+existInFIFO.Quantite+" actions "+e.VALEUR+" au prix d'achat de "+existInFIFO.PrixUnitaire;
                                            temp.montant=existInFIFO.PrixUnitaire*existInFIFO.Quantite;
                                            temp.symbole=e.SYMBOLE;
                                            temp.ref=parseInt(e.REFERENCE);
                                            temp.ou="C";
                                            temp.qte=existInFIFO.Quantite;
                                            temp.date=dateAchatFormatted;
                                            temp.typeOp="VAC";
                                            temp.indexOP=index;

                                            compte=COMPTES.filter((obj)=>{
                                                return obj.type==="MV"
                                            });
                                            compte=compte[0];
                                            mvpv.compte=compte;
                                            mvpv.libelle="Moins value sur cession de "+existInFIFO.Quantite+" actions "+e.VALEUR;
                                            mvpv.libelleS="Moins value sur cession de "+existInFIFO.Quantite+" actions "+e.VALEUR;
                                            mvpv.montant=montantMV;
                                            mvpv.symbole=e.SYMBOLE;
                                            mvpv.ref=parseInt(e.REFERENCE);
                                            mvpv.ou="D";
                                            mvpv.qte=existInFIFO.Quantite;
                                            mvpv.date=dateAchatFormatted;
                                            mvpv.typeOp="VAC";
                                            mvpv.indexOP=index+1;
                                                 //Archivage de la vente dans HistoriqueFIFO
                                            TempHistoFIFO.insert({
                                                Valeur:e.VALEUR,
                                                Date:dateAchatFormatted,
                                                typeop:'VENTE-',
                                                Quantite:existInFIFO.Quantite,
                                                prixVente:e.PRIX_UNITAIRE,
                                                prixAchat:existInFIFO.PrixUnitaire,
                                                ValBilan:0,
                                                PMvalue:montantMV,
                                                Symbole:e.SYMBOLE,
                                                ref:parseInt(e.REFERENCE),
                                                type:'ACTIONS'
                                            });
                                            //on yield la valeur trouver
                                             console.log("longueur du tableau avant "+tableauRes.length);
                                            tableauRes.push({temp,mvpv});
                                         
                                            //on check si on a encore ce type de valeur en stock
                                            existInFIFO=TempInventaire.findOne({Symbole:e.SYMBOLE},{sort:{DateAcquisition:1}});
                                            if(existInFIFO){
                                                comptaMVPV(e,index++,Math.abs(newQteEnStockDuPremierTrouver),pvmvTemp,tableauRes);
                                            }
                                        

                                    }else if(newQteEnStockDuPremierTrouver===0){
                                       // console.log("MV avec QTE===0");
                                        //enlever la ligne dont la quantite est epuisee
                                        let montantMV=(existInFIFO.PrixUnitaire-e.PRIX_UNITAIRE)*existInFIFO.Quantite;
                                        //console.log("MontantMV:"+montantMV);
                                        //console.dir(existInFIFO);
                                        TempInventaire.remove(existInFIFO,()=>{
                                            //on comptabilise la moins value et la sortie de stock(vente)
                                            
                                        });
                                         //comptabilisation moins value
                                            let compte=COMPTES.filter((obj)=>{
                                                return obj.type==="AC"
                                            });
                                            compte=compte[0];
                                            temp.compte=compte;
                                            temp.libelle="Cession de "+existInFIFO.Quantite+" actions "+e.VALEUR+" au prix d'achat de "+existInFIFO.PrixUnitaire;
                                            temp.libelleS="Cession de "+existInFIFO.Quantite+" actions "+e.VALEUR+" au prix d'achat de "+existInFIFO.PrixUnitaire;
                                            temp.montant=existInFIFO.PrixUnitaire*existInFIFO.Quantite;
                                            temp.symbole=e.SYMBOLE;
                                            temp.ref=parseInt(e.REFERENCE);
                                            temp.ou="C";
                                            temp.qte=existInFIFO.Quantite;
                                            temp.date=dateAchatFormatted;
                                            temp.typeOp="VAC";
                                            temp.indexOP=index;

                                            compte=COMPTES.filter((obj)=>{
                                                return obj.type==="MV"
                                            });
                                            compte=compte[0];
                                            mvpv.compte=compte;
                                            mvpv.libelle="Moins value sur cession de "+existInFIFO.Quantite+" actions "+e.VALEUR;
                                            mvpv.libelleS="Moins value sur cession de "+existInFIFO.Quantite+" actions "+e.VALEUR;
                                            mvpv.montant=montantMV;
                                            mvpv.symbole=e.SYMBOLE;
                                            mvpv.ref=parseInt(e.REFERENCE);
                                            mvpv.ou="D";
                                            mvpv.qte=existInFIFO.Quantite;
                                            mvpv.date=dateAchatFormatted;
                                            mvpv.typeOp="VAC";
                                            mvpv.indexOP=index+1;
                                                //Archivage de la vente dans HistoriqueFIFO
                                            TempHistoFIFO.insert({
                                                Valeur:e.VALEUR,
                                                Date:dateAchatFormatted,
                                                typeop:'VENTE-',
                                                Quantite:existInFIFO.Quantite,
                                                prixVente:e.PRIX_UNITAIRE,
                                                prixAchat:existInFIFO.PrixUnitaire,
                                                ValBilan:0,
                                                PMvalue:montantMV,
                                                Symbole:e.SYMBOLE,
                                                ref:parseInt(e.REFERENCE),
                                                type:'ACTIONS'
                                            });
                                            //on yield la valeur trouver
                                            // console.log("longueur du tableau avant "+tableauRes.length);
                                            // console.dir(temp);
                                             //console.dir(mvpv);
                                            tableauRes.push({temp,mvpv});
                                            //console.log("tableaures");
                                           // console.dir(tableauRes);
                                         tableauRes.forEach((e)=>pvmvTemp.push(e));
                                            //on check si on a encore ce type de valeur en stock
                                          //  existInFIFO=Inventaire.findOne({Symbole:e.SYMBOLE});
                                           // if(existInFIFO){
                                           //     comptaMVPV(e,index++,Math.abs(newQteEnStockDuPremierTrouver),pvmvTemp,tableauRes);
                                           // }
                                        

                                    }
                                    
                                }else if(e.PRIX_UNITAIRE>existInFIFO.PrixUnitaire){
                                    //on a une plus value=======================================>
                                    let newQteEnStockDuPremierTrouver;
                                    if(quantiteRestante===0){
                                        newQteEnStockDuPremierTrouver=existInFIFO.Quantite-e.QUANTITE;
                                        console.log("1newQteEnStockDuPremierTrouverPV: "+existInFIFO.Quantite+"-"+e.QUANTITE+"="+newQteEnStockDuPremierTrouver);
                                    }else if(quantiteRestante>0){
                                       
                                        newQteEnStockDuPremierTrouver=existInFIFO.Quantite-quantiteRestante;
                                        console.log("2newQteEnStockDuPremierTrouverPV: "+existInFIFO.Quantite+"-"+quantiteRestante+"="+newQteEnStockDuPremierTrouver);
                                    }
                                    
                                    if(newQteEnStockDuPremierTrouver>0){
                                        console.log("plus value et newQte superieur a 0");
                                        let montantPV=quantiteRestante>0?(e.PRIX_UNITAIRE-existInFIFO.PrixUnitaire)*quantiteRestante : (e.PRIX_UNITAIRE-existInFIFO.PrixUnitaire)*e.QUANTITE;
                                        TempInventaire.update(existInFIFO,{
                                            $set:{
                                                ValBilan:newQteEnStockDuPremierTrouver*existInFIFO.PrixUnitaire,
                                                Quantite:newQteEnStockDuPremierTrouver,
                                                lastTypeOp:"VACPV"
                                            }
                                        });
                                        //comptabilisation plus value
                                        let compte=COMPTES.filter((obj)=>{
                                            return obj.type==="AC"
                                        });
                                        compte=compte[0];
                                        let libelleQteAfficher;
                                        if(quantiteRestante>0){
                                            libelleQteAfficher=quantiteRestante;
                                        }else{
                                            libelleQteAfficher=e.QUANTITE;
                                        }
                                        temp.compte=compte;
                                        temp.libelle="Cession de "+libelleQteAfficher+" actions "+e.VALEUR+" au prix d'achat de "+existInFIFO.PrixUnitaire;
                                        temp.libelleS="Cession de "+libelleQteAfficher+" actions "+e.VALEUR+" au prix d'achat de "+existInFIFO.PrixUnitaire;
                                        temp.montant=quantiteRestante>0 ? existInFIFO.PrixUnitaire*quantiteRestante : existInFIFO.PrixUnitaire*e.QUANTITE;
                                        temp.symbole=e.SYMBOLE;
                                        temp.ref=parseInt(e.REFERENCE);
                                        temp.ou="C";
                                        temp.qte=libelleQteAfficher;
                                        temp.date=dateAchatFormatted;
                                        temp.typeOp="VAC";
                                        temp.indexOP=index;

                                        compte=COMPTES.filter((obj)=>{
                                            return obj.type==="PV"
                                        });
                                        compte=compte[0];
                                        mvpv.compte=compte;
                                        mvpv.libelle="Plus value sur cession de "+libelleQteAfficher+" actions "+e.VALEUR;
                                        mvpv.libelleS="Plus value sur cession de "+libelleQteAfficher+" actions "+e.VALEUR;
                                        mvpv.montant=montantPV;
                                        mvpv.symbole=e.SYMBOLE;
                                        mvpv.ref=parseInt(e.REFERENCE);
                                        mvpv.ou="C";
                                        mvpv.qte=libelleQteAfficher;
                                        mvpv.date=dateAchatFormatted;
                                        mvpv.typeOp="VAC";
                                        mvpv.indexOP=index+1;
                                          //Archivage de la vente dans HistoriqueFIFO
                                            TempHistoFIFO.insert({
                                                Valeur:e.VALEUR,
                                                Date:dateAchatFormatted,
                                                typeop:'VENTE+',
                                                Quantite:libelleQteAfficher,
                                                prixVente:e.PRIX_UNITAIRE,
                                                prixAchat:existInFIFO.PrixUnitaire,
                                                ValBilan:0,
                                                PMvalue:montantPV,
                                                Symbole:e.SYMBOLE,
                                                ref:parseInt(e.REFERENCE),
                                                type:'ACTIONS'
                                            });
                                        tableauRes.push({temp,mvpv});
                                        console.log("content of tableauRes avant return======");
                                        //console.log(tableauRes);
                                        tableauRes.forEach((e)=>pvmvTemp.push(e));
                                        //return tableauRes;
                                        

                                    }else if(newQteEnStockDuPremierTrouver<0){
                                        //enlever la ligne dont la quantite est epuisee
                                        let montantPV=(e.PRIX_UNITAIRE-existInFIFO.PrixUnitaire)*existInFIFO.Quantite;
                                        TempInventaire.remove(existInFIFO,()=>{
                                            //on comptabilise la moins value et la sortie de stock(vente)
                                            
                                        });
                                         //comptabilisation moins value
                                            let compte=COMPTES.filter((obj)=>{
                                                return obj.type==="AC"
                                            });
                                            compte=compte[0];
                                            temp.compte=compte;
                                            temp.libelle="Cession de "+existInFIFO.Quantite+" actions "+e.VALEUR+" au prix d'achat de "+existInFIFO.PrixUnitaire;
                                            temp.libelleS="Cession de "+existInFIFO.Quantite+" actions "+e.VALEUR+" au prix d'achat de "+existInFIFO.PrixUnitaire;
                                            temp.montant=existInFIFO.PrixUnitaire*existInFIFO.Quantite;
                                            temp.symbole=e.SYMBOLE;
                                            temp.ref=parseInt(e.REFERENCE);
                                            temp.ou="C";
                                            temp.qte=existInFIFO.Quantite;
                                            temp.date=dateAchatFormatted;
                                            temp.typeOp="VAC";
                                            temp.indexOP=index;

                                            compte=COMPTES.filter((obj)=>{
                                                return obj.type==="PV"
                                            });
                                            compte=compte[0];
                                            mvpv.compte=compte;
                                            mvpv.libelle="Plus value sur cession de "+existInFIFO.Quantite+" actions "+e.VALEUR;
                                            mvpv.libelleS="Plus value sur cession de "+existInFIFO.Quantite+" actions "+e.VALEUR;
                                            mvpv.montant=montantPV;
                                            mvpv.symbole=e.SYMBOLE;
                                            mvpv.ref=parseInt(e.REFERENCE);
                                            mvpv.ou="C";
                                            mvpv.qte=existInFIFO.Quantite;
                                            mvpv.date=dateAchatFormatted;
                                            mvpv.typeOp="VAC";
                                            mvpv.indexOP=index+1;
                                            //Archivage de la vente dans HistoriqueFIFO
                                            TempHistoFIFO.insert({
                                                Valeur:e.VALEUR,
                                                Date:dateAchatFormatted,
                                                typeop:'VENTE+',
                                                Quantite:existInFIFO.Quantite,
                                                prixVente:e.PRIX_UNITAIRE,
                                                prixAchat:existInFIFO.PrixUnitaire,
                                                ValBilan:0,
                                                PMvalue:montantPV,
                                                Symbole:e.SYMBOLE,
                                                ref:parseInt(e.REFERENCE),
                                                type:'ACTIONS'
                                            });
                                            //on yield la valeur trouver
                                             console.log("longueur du tableau avant "+tableauRes.length);
                                            tableauRes.push({temp,mvpv});
                                          
                                            //on check si on a encore ce type de valeur en stock
                                            existInFIFO=TempInventaire.findOne({Symbole:e.SYMBOLE},{sort:{DateAcquisition:1}});
                                            if(existInFIFO){
                                                comptaMVPV(e,index++,Math.abs(newQteEnStockDuPremierTrouver),pvmvTemp,tableauRes);
                                            }
                                        

                                    }else if(newQteEnStockDuPremierTrouver===0){
                                        //enlever la ligne dont la quantite est epuisee
                                        let montantPV=(e.PRIX_UNITAIRE-existInFIFO.PrixUnitaire)*existInFIFO.Quantite;
                                        TempInventaire.remove(existInFIFO,()=>{
                                            //on comptabilise la moins value et la sortie de stock(vente)
                                            
                                        });
                                         //comptabilisation plus value
                                            let compte=COMPTES.filter((obj)=>{
                                                return obj.type==="AC"
                                            });
                                            compte=compte[0];
                                            temp.compte=compte;
                                            temp.libelle="Cession de "+existInFIFO.Quantite+" actions "+e.VALEUR+" au prix d'achat de "+existInFIFO.PrixUnitaire;
                                            temp.libelleS="Cession de "+existInFIFO.Quantite+" actions "+e.VALEUR+" au prix d'achat de "+existInFIFO.PrixUnitaire;
                                            temp.montant=existInFIFO.PrixUnitaire*existInFIFO.Quantite;
                                            temp.symbole=e.SYMBOLE;
                                            temp.ref=parseInt(e.REFERENCE);
                                            temp.ou="C";
                                            temp.qte=existInFIFO.Quantite;
                                            temp.date=dateAchatFormatted;
                                            temp.typeOp="VAC";
                                            temp.indexOP=index;

                                            compte=COMPTES.filter((obj)=>{
                                                return obj.type==="PV"
                                            });
                                            compte=compte[0];
                                            mvpv.compte=compte;
                                            mvpv.libelle="Plus value sur cession de "+existInFIFO.Quantite+" actions "+e.VALEUR;
                                            mvpv.libelleS="Plus value sur cession de "+existInFIFO.Quantite+" actions "+e.VALEUR;
                                            mvpv.montant=montantPV;
                                            mvpv.symbole=e.SYMBOLE;
                                            mvpv.ref=parseInt(e.REFERENCE);
                                            mvpv.ou="C";
                                            mvpv.qte=existInFIFO.Quantite;
                                            mvpv.date=dateAchatFormatted;
                                            mvpv.typeOp="VAC";
                                            mvpv.indexOP=index+1;
                                            //Archivage de la vente dans HistoriqueFIFO
                                            TempHistoFIFO.insert({
                                                Valeur:e.VALEUR,
                                                Date:dateAchatFormatted,
                                                typeop:'VENTE+',
                                                Quantite:existInFIFO.Quantite,
                                                prixVente:e.PRIX_UNITAIRE,
                                                prixAchat:existInFIFO.PrixUnitaire,
                                                ValBilan:0,
                                                PMvalue:montantPV,
                                                Symbole:e.SYMBOLE,
                                                ref:parseInt(e.REFERENCE),
                                                type:'ACTIONS'
                                            });
                                            //on yield la valeur trouver
                                             console.log("longueur du tableau avant "+tableauRes.length);
                                            tableauRes.push({temp,mvpv});
                                          tableauRes.forEach((e)=>pvmvTemp.push(e));
                                            //on check si on a encore ce type de valeur en stock
                                           // existInFIFO=Inventaire.findOne({Symbole:e.SYMBOLE});
                                           // if(existInFIFO){
                                             //   comptaMVPV(e,index++,Math.abs(newQteEnStockDuPremierTrouver),pvmvTemp,tableauRes);
                                           // }
                                        

                                    }
                                    
                                }
                                
                           }
}
export default ()=>{
    Meteor.methods({
        sendEmail(to,from,subject,text){
            check([to],[Array]);
            check([from,subject,text],[String]);
            this.unblock();
            Email.send({to,from,subject,html:text});
        },
        clearTemps(){
            //fonction appeler a chaque refresh du client pour vider les tables tampon
            let traitementEnCours=IsTraiting.findOne({traitement:true});
            if(!traitementEnCours){
                TempHistoFIFO.remove({});
                TempInventaire.remove({});
                TempReleve.remove({});
                IsTraiting.remove({});
                return true;
            }else{
                return false;
            }
            
        },
        cancelTraitement(){
            TempInventaire.remove({});
            IsTraiting.remove({});
        },
        saveChanges(fifosnap,releve){
            //TODO sauvegarder le releve comptable
            let momentum=Date.now();
            let fut=new Future();
            let workbook=new Excel.Workbook();
            workbook.creator='NFINAPP';
                workbook.lastModifierdBy='NFINAPP';
                workbook.created=new Date();
                workbook.modified = new Date();
                workbook.properties.date1904=true;
                workbook.views=[{
                    x:0,y:0,width:10000,height:20000,firstSheet:0,activeTab:1,visibility:'visible'
                }];
               
                
            releve.forEach((e,i,arr)=>{
                HistoriqueR.insert({
                    DATE_ACHAT_DES_TITRES:e.DATE_ACHAT_DES_TITRES,
                    DATE_RECEPTION_DES_TITRES:e.DATE_RECEPTION_DES_TITRES,
                    REFERENCE:e.REFERENCE,
                    CODE_OPERATION:e.CODE_OPERATION,
                    SYMBOLE:e.SYMBOLE,
                    CODE_ISIN:e.CODE_ISIN,
                    MONTANT_TOTAL:e.MONTANT_TOTAL,
                    QUANTITE:e.QUANTITE,
                    LIBELLE_OPERATION:e.LIBELLE_OPERATION,
                    PRIX_UNITAIRE:e.PRIX_UNITAIRE,
                    DATE_RELEVER:new Date(),
                    PAR:Meteor.user().fullname,
                    moment:momentum

                });

            });
             //on fait les backup de HistoriqueR
             let histoR=HistoriqueR.find({}).fetch();
                console.log("length of histoR "+histoR.length)
                if(histoR.length){
                    histoR.map((e)=>{
                        let found=HistoriqueRBackup.findOne(e);
                        if(!found){
                            HistoriqueRBackup.insert(e);
                        }
                        
                    });
                }
            //TODO sauvegarder TempHistoFIFO dans HistoriqueFIFO et vider TempHistoFIFO
            let tempHisto=TempHistoFIFO.find({},{sort:{Date:1}}).fetch();
            if(tempHisto){
                let foundInHisto=HistoriqueFIFO.findOne(tempHisto[0]);
                if(!foundInHisto){
                    tempHisto.forEach((e)=>{
                        HistoriqueFIFO.insert(e);
                    });   
                    //on fait la sauvegarde de HistoriqueFIFO
                let allHisto=HistoriqueFIFO.find({},{sort:{Date:1}}).fetch();
                console.log("length de allHisto "+allHisto.length);
                    allHisto.map((e)=>{
                        let found=HistoriqueFIFOBackup.findOne(e);
                        if(!found){
                            if(HistoriqueFIFOBackup.insert(e)){
                                HistoriqueFIFOBackup.update(e,{$set:{moment:momentum}});
                            }
                        }
                    });  
                    TempHistoFIFO.remove({_id:{$ne:""||null}});             
                }
            }
            //TODO update l'inventaire changer les lastTypeOp en INVFILE
            TempInventaire.update({lastTypeOp:{$ne:'INVFILE'}},{$set:{lastTypeOp:'INVFILE'}});
            let tempinventory=TempInventaire.find({},{sort:{DateAcquisition:1}}).fetch();
            Inventaire.remove({});
            tempinventory.forEach((e,i,arr)=>{
                Inventaire.insert(e);
            });
            TempInventaire.remove({});
            //TODO sauvegarder dans le backup inventaire le snap fifosnap
            //On peut avoir deux copies de l4inventaire ds cette collection
            let inv=InventaireBackup.find({},{sort:{DateInventaire:1}}).fetch();
            inv=groupSumBySymbole(inv,['moment'],['Quantite']);
            console.log("longueur de invBack "+inv.length);
            if(inv.length>=2){
                //on efface le plus ancien
                
                let oldInvback=InventaireBackup.find({moment:inv[0].moment}).fetch();
                if(oldInvback.length){
                fifosnap.forEach((e)=>{
                    InventaireBackup.insert({
                            DateAcquisition:e.DateAcquisition,
                            Valeur:e.Valeur,
                            Quantite:e.Quantite,
                            PrixUnitaire:e.PrixUnitaire,
                            ValBilan:e.ValBilan,
                            SGI:e.SGI,
                            Symbole:e.Symbole,
                            reference:e.reference,
                            lastTypeOp:"INVFILE",
                            IsFractionned:e.IsFractionned,
                            type:e.type,
                            DateInventaire:new Date(),
                            moment:momentum
                        });
                });
                    InventaireBackup.remove({moment:inv[0].moment});
                //Ou l4on peut donner l'option de l'extraire en Excel 
                
                
                
                let sheet=workbook.addWorksheet("INVENTAIRE_SAUVEGARDE");
                sheet.columns=[{
                        header:'DATE',
                        key:'D',
                        width:20
                    },{
                        header:'VALEURS',
                        key:'V',
                        width:20 
                    },{
                        header:'Qtites',
                        key:'Q',
                        width:20 
                    },{
                        header:'Nominal',
                        key:'N',
                        width:20 
                    },{
                        header:'VAL.  Bilan',
                        key:'VB',
                        width:20 
                    },{
                        header:'SGI',
                        key:'SGI',
                        width:20 
                    },{
                        header:'SYMBOL',
                        key:'S',
                        width:20 
                    },{
                        header:'Reference',
                        key:'R',
                        width:20 
                    },{
                        header:'TYPE_VALEUR',
                        key:'T',
                        width:20 
                    }];
                   // console.dir(oldInvback[0]);
                    oldInvback.forEach((e)=>{
                            
                            sheet.addRow({
                            D:e.DateAcquisition,
                            V:e.Valeur,
                            Q:e.Quantite,
                            N:e.PrixUnitaire,
                            VB:e.ValBilan,
                            SGI:e.SGI,
                            S:e.Symbole,
                            R:e.reference,
                            T:e.type

                            });
                        
                    });
                    workbook.xlsx.writeBuffer()//on transforme le tout en un blob que lon renverra au client pour telecharger via filesaver
                    .then(function(e){
                        //console.dir(e);
                        console.log("xls file is written inventaire.");
                        let o={blob:e,date:oldInvback[0].DateInventaire};
                        //console.dir(o);
                        fut['return'](o);
                        
                        //return buffer.getContents();
                    });
                }
                //et on insere la nouvelle sauvegarde
                
                //console.dir(workbook);
                 
                
                    
            }else if(!inv.length||inv.length<2){
                //et on insere la nouvelle sauvegarde
                //let momentum=Date.now();
                console.log(momentum);
                fifosnap.forEach((e)=>{
                    InventaireBackup.insert({
                            DateAcquisition:e.DateAcquisition,
                            Valeur:e.Valeur,
                            Quantite:e.Quantite,
                            PrixUnitaire:e.PrixUnitaire,
                            ValBilan:e.ValBilan,
                            SGI:e.SGI,
                            Symbole:e.Symbole,
                            reference:e.reference,
                            lastTypeOp:"INVFILE",
                            IsFractionned:e.IsFractionned,
                            type:e.type,
                            DateInventaire:new Date(),
                            moment:momentum
                        });
                });
                let o={msg:"pasExcel"};
                fut['return'](o);
            }
            return fut.wait();
        },
        exportToExcelAgresso(opCompta){
            let fut=new Future();
            //creation du fichier excel avec l'aide de exceljs
            console.log("Opcompta length "+opCompta.length);
            //console.dir(opCompta);
            let totalOp=groupSumBySymbole(opCompta,['ref'],['qte']);//on s'en fout vraiment du deuxieme parametre car ce ke lon recherche c le nombre individuel de reference dans opCompta
            console.log("totalOP "+totalOp.length);
            let workbook=new Excel.Workbook();
            workbook.creator='Nsia finances application';
            workbook.lastModifierdBy='Nsia finances application';
            workbook.created=new Date();
            workbook.modified = new Date();
            workbook.properties.date1904=true;
            workbook.views=[{
                x:0,y:0,width:10000,height:20000,firstSheet:0,activeTab:1,visibility:'visible'
            }];
            let sheets=[];//creer une feuille par operation selon la reference
           // console.dir(totalOp);
           
            if(totalOp[0] != undefined){
                //TODO creer la feuille de _control pour integration dans le logiciel Agresso
                sheets.push(workbook.addWorksheet("_control"));
                remplirFeuilleControl(sheets);

                //***fin generation de la feuille _control */
                let finalArr=[];
                let trueFinalArr=[];
                totalOp.map((e,i,arr)=>{
                    let name="Feuille "+(++i);
                    sheets.push(workbook.addWorksheet(name));
                    //on trie et on cree un tableau de tableaux
                   finalArr.push(opCompta.filter((el)=>{
                        return el.ref===e.ref?el:null;
                    }));
                });
              
                sheets.forEach((worksheet,i,arr)=>{
                       if(i!=0){
                                worksheet.columns=[{
                                header:'update_columns',
                                key:'UC',
                                width:20
                            },{
                                header:'account',
                                key:'ACC',
                                width:20 
                            },{
                                header:'ext_inv_ref',
                                key:'EIR',
                                width:20 
                            },{
                                header:'voucher_date',
                                key:'VD',
                                width:20 
                            },{
                                header:'Cur_amount',
                                key:'CA',
                                width:20 
                            },{
                                header:'dc_flag',
                                key:'DCF',
                                width:20 
                            },{
                                header:'amount',
                                key:'AM',
                                width:20 
                            },{
                                header:'description',
                                key:'DES',
                                width:20 
                            },{
                                header:'dim_1',
                                key:'D1',
                                width:20 
                            },{
                                header:'dim_6',
                                key:'D2',
                                width:20 
                            }];
                    }
                });
                

                //console.log("lheader du sheet 0 column 3"+sheets[0].getColumn(3).header)
               // console.log(finalArr);
               let index=0;
                workbook.eachSheet((worksheet,sheetId)=>{
                    
                    if(worksheet.name!='_control'){
                        console.log("typeof de finalarr["+--sheetId+"] = "+typeof finalArr);
                        finalArr[index].forEach((e,i,arr)=>{
                        //insertion par feuille
                        worksheet.addRow({
                            UC:"update_data",
                            ACC:e.compte.compte,
                            EIR:e.ref,VD:moment(e.date).format("DD/MM/YY"),
                            CA:e.ou==="C"?-e.montant:e.montant,
                            DCF:e.ou==="C"?-1:1,
                            AM:e.ou==="C"?-e.montant:e.montant,
                            DES:e.libelle,
                            D1:e.ou==="D"?302:"",
                            D2:e.ou==="C"?"DVD":""

                            });
                            //console.dir(e);
                    });
                    index++;
                    }
                });
                //process.env.PWD+"/FICHIERS/AGRESSO_FILE"+Date.now()
                //console.dir(workbook);
                //let buffer=new streamBuffers.WritableStreamBuffer();
                workbook.xlsx.writeBuffer()//on transforme le tout en un blob que lon renverra au client pour telecharger via filesaver
                .then(function(e) {
                   // console.dir(e);
                    console.log("xls file is written.");
                    IsTraiting.remove({});
                    fut['return'](e)
                    
                    //return buffer.getContents();
                });
               //return finalArr; 
            }
            return fut.wait();
        },
        extractArraysToExcel(ArrOfData,sheetNamesArr,format){
            let fut=new Future();
            let workbook=new Excel.Workbook();
            workbook.creator='Nsia finances application';
            workbook.lastModifierdBy='Nsia finances application';
            workbook.created=new Date();
            workbook.modified = new Date();
            workbook.properties.date1904=true;
            workbook.views=[{
                x:0,y:0,width:10000,height:20000,firstSheet:0,activeTab:1,visibility:'visible'
            }];
            let sheets=[];
            sheetNamesArr.forEach((e,i,arr)=>{
                sheets.push(workbook.addWorksheet(e));
            });
            //-----CREATION AUTOMATIQUE DES HEADERS
            sheets.forEach((worksheet,i,arr)=>{
                let currentSheetHeaders=Object.keys(ArrOfData[i][0]);
                //console.dir(currentSheetHeaders);
                let columns=[];
                    currentSheetHeaders.forEach((e,i,arr)=>{
                        //****A ENLEVER DANS UNE AUTRE APPLICATION ****/
                        if(e==="DateAcquisition")columns.push({header:"DATE",key:e.substring(0,2)+i,width:20});
                        else if(e==="Valeur")columns.push({header:"VALEURS",key:e.substring(0,2)+i,width:20});
                        else if(e==="Quantite")columns.push({header:"Qtites",key:e.substring(0,2)+i,width:20});
                        else if(e==="PrixUnitaire")columns.push({header:"Nominal",key:e.substring(0,2)+i,width:20});
                        else if(e==="ValBilan")columns.push({header:"VAL. Bilan",key:e.substring(0,2)+i,width:20});
                        else if(e==="Symbole")columns.push({header:"SYMBOL",key:e.substring(0,2)+i,width:20});
                        else if(e==="reference")columns.push({header:"Reference",key:e.substring(0,2)+i,width:20});
                        else if(e==="type")columns.push({header:"TYPE_VALEUR",key:e.substring(0,2)+i,width:20});
                        else columns.push({header:e,key:e.substring(0,2)+i,width:20});
                    }); 
                    //****A ENLEVER DANS UNE AUTRE APPLICATION ****/

                  //  console.dir(columns);
                    worksheet.columns=columns;    
                });
            //--------------------------------------
            //-----REMPLIR LES LIGNES DU TABLEAU PAR FEUILLE
                workbook.eachSheet((worksheet,sheetId)=>{
                    //sheetId commence toujours a 1
                    //console.dir(ArrOfData[--sheetId]);
                    ArrOfData[--sheetId].map((e,i,arr)=>{
                        let array=Object.values(e);
                        let finalArr=array.map((e)=>{
                            if(typeof e =="string" && e.indexOf("Greenwich")>0)
                            {
                                let dateObj=new Date(e);
                                let momentObj=moment(dateObj);
                                let finalDate=momentObj.format("DD/MM/YYYY");
                                //console.log(finalDate);
                                return finalDate
                            }else{
                                return e;
                            }
                        });
                        
                        worksheet.addRow(finalArr); 
                    });
                      
                });
            //------------------------------------------
            function streamToBuffer(stream) {  
                    return new Promise((resolve, reject) => {
                        let buffers = [];
                        stream.on('error', reject);
                        stream.on('data', (data) => buffers.push(data))
                        stream.on('end', () => resolve(Buffer.concat(buffers)))
                    });
                } 

                if(format=="CSV"){
                   // let stream=fs.createWriteStream("my.csv");
                    workbook.csv.writeFile("inventaire.csv")//on transforme le tout en un blob que lon renverra au client pour telecharger via filesaver
                    .then(function() {
                        let stream=fs.createReadStream("inventaire.csv");
                        let streamBuff=Promise.await(streamToBuffer(stream));
                        //console.dir(streamBuff);
                        console.log("csv file is written from extractArraysToExcel.");
                        fut['return'](streamBuff);
                    });
                }else if(format=="XLS"){
                    workbook.xlsx.writeBuffer()//on transforme le tout en un blob que lon renverra au client pour telecharger via filesaver
                    .then(function(e) {
                        console.log("xlsx file is written from extractArraysToExcel.");
                        fut['return'](e)
                    });
                }
                
            return fut.wait();
        },
        addToComptesFin(values){
            ComptesFinanciers.insert({
                type:values.type,
                compte:values.compte,
                libelle:values.libelle
            });
            let newone=ComptesFinanciers.findOne(values);
            if(newone!=undefined){
                return true;
            }else{
                throw new Meteor.Error("err","")
            }
        },
        updateComptesFin(values){
            if(typeof values!=undefined){
                ComptesFinanciers.update({
                    type:values.typeCompte,
                },{
                    $set:{
                        compte:values.Compte
                    }
                });

                return true;
            }else{
                throw new Meteor.Error("noVal","Aucune value fournie pour la mise a jour des CF");
            }
        },
        cancelFrac(inv){
            if(typeof inv!==undefined){
                inv.map((e)=>{
                    Inventaire.update({
                        DateAcquisition:e.DateAcquisition,
                        Symbole:e.Symbole,
                        reference:e.reference
                    },{
                        $set:{
                            Quantite:e.Quantite,
                            PrixUnitaire:e.PrixUnitaire,
                            IsFractionned:false
                        }
                    });

                });
                return{message:"Fractionnement annulé"};
            }
        },
        updateFraction(values){
            //on recupere les champs concernes pour effectuer le fractionnement
           
            let valeursInv=Inventaire.find({
                Symbole:values.valeur,
                IsFractionned:false,
                DateAcquisition:{
                    $lte:values.date_debut_frac
                }}).fetch();

            let allActionsOld=Inventaire.find({
                        Symbole:values.valeur,
                        }).fetch(); 

                if(valeursInv.length){
                    let resultCheck=[];
                    valeursInv.forEach((e)=>{
                        console.dir(e);
                        if(!e.IsFractionned){
                            //calcul selon la formule de fractionnement

                            let qte=e.Quantite*values.taux;
                            let pu=e.PrixUnitaire/values.taux;
                            //on met a jour la base de donnee avec l'element de fractionnement
                           // console.log(pu);
                            Inventaire.update(e,{
                                $set:{
                                    Quantite:qte,
                                    PrixUnitaire:pu,
                                    IsFractionned:false//a changer si elle dit que on ne peut fractionner kune seule fois
                                }
                            });
                            
                        }else{
                            resultCheck.push(true);
                        }
                    });

                    let allActionsNew=Inventaire.find({
                        Symbole:values.valeur,
                        }).fetch();

                    let invAfterUp=Inventaire.find({
                                    Symbole:values.valeur,
                                    DateAcquisition:{
                                        $lte:values.date_debut_frac
                                    }}).fetch();

                    
                    //console.log("Invagterup=============");
                    //console.dir(invAfterUp);
                    if(resultCheck.length===valeursInv.length){
                        //Il ny a pas eu de fractionnement effectuer
                        return {
                            oldInv:allActionsOld,
                            updatedInv:allActionsNew,
                            error:true,
                            message:"Il se pourrait que cette valeur mobilière soit déjà fractionné.Veuillez verifier dans le tableau affiché à l'écran."
                        };
                    }else{
                        return {
                            oldInv:allActionsOld,
                            updatedInv:allActionsNew,
                            error:false,
                            message:"Fractionnement effectué"
                        };
                    }
                }else{
                    //on a pas pu recuperer les valeurs a la date precisee
                    throw new Meteor.Error("notfound","L'inventaire ne contient pas de valeurs mobilière de ce type acquisent à la date que vous avez précisé.Il se pourrait aussi qu'un fractionement ait déjà été calculé précédemment  ");
                }
                

        },
        checkAdminUser(username,mdp){
            if(username===Meteor.settings.ADMINLOGMDP && mdp===Meteor.settings.ADMINLOGMDP)
            return true;
            else
            return false;
        },
        createNewUser(values){
            let codeFound=Meteor.users.findOne({codeRedac:values.codeRedac.toUpperCase()});
            if(codeFound){
                 throw new Meteor.Error("Veuillez re vérifier, il se pourrait que le code rédacteur existe déja");
                 //return false;
            }
            //-----------------------------
            if( Accounts.createUser({
                        username:values.username,
                        password:values.password
                    })){
                        let nuser=Meteor.users.findOne({username:values.username});
                        if(Meteor.users.update(nuser._id,{
                            $set:{
                                uncrypted:values.passwordconf,
                                nom:values.nom,
                                prenoms:values.prenom,
                                fullname: values.nom+' '+values.prenom,
                                codeRedac:values.codeRedac.toUpperCase(),
                                role:values.role
                            }
                        })){
                            //DBSQL.sync();
                              /*return userSQL.create({
                                    ulogin:values.username,
                                    mdp:nuser.services.password.bcrypt.substring(0,8)+values.passwordconf,//values.passwordconf,
                                    nom:values.nom,
                                    prenom:values.prenom,
                                    redac:values.codeRedac.toUpperCase(),
                                    role:values.role
                                }).then((err,res)=>{
                                    if(err){
                                        
                                       // throw new Meteor.Error("Veuillez re vérifier, il se pourrait que le code rédacteur existe déja");
                                        return false;
                                    }
                                    else
                                    return true;
                                    //DBSQL.close();
                                
                             }).catch((err)=>{
                                throw new Meteor.Error("Veuillez re vérifier, il se pourrait que le code rédacteur existe déja");
                             });*/
                             let message="<em>Ceci est un message automatique, veuillez ne pas y répondre.</em><br/><br/>Bonjour Monsieur/Madame,<br/><br/>Veuillez trouver ci dessous vos accès au module NFINAPP en charge de la gestion du portefeuille des titres NSIA VIE ASSURANCES. <br/><br/>Identifiant: <b>"+values.username+"</b><br/> Mot de passe: <b>"+values.passwordconf+"</b>. <br/><br/>Votre application est accèssible via le lien suivant: http://nvmob-srv:8082. <br/>Pour un fonctionnement optimal veuillez ouvrir l'application avec les navigateurs <b>Google Chrome</b> ou <b>Mozilla Firefox.</b><br/><br/> Cordialement, <br/><br/><b>DSI NSIA VIE ASSURANCES</b>";
                            console.log("Valeur de la variable environment mail "+process.env.MAIL_URL);
                            Meteor.call("sendEmail",[values.email,Meteor.settings.ADMINMAIL],"info@nsiavieapplications.com","Vos identifiants sur le module GESDREG(Gestion des disponibilités de règlement)",message);
                            return ;
                        }
                        else{
                            Meteor.users.remove({username:values.username});
                            throw new Meteor.Error("Veuillez re vérifier vos champs");
                            
                        }
                    }else{
                       throw new Meteor.Error("Veuillez re vérifier vos champs, cet utilisateur existe deja");
                    }
             
            
        },

//-----------DECOUPAGE METHOD-------------------------->
        decoupExcel(){
            console.log('debut de la function');
            let fut=new Future();
            //ici pour l'instant cette methode lira le fichier et renverra un objet avec les numero de ligne(index) et les infos par ligne
           
            //let myFutureRes=new Future();

            let newObj=[];
            let final=[];
            let lr=new LineByLineReader(xlfile);
            lr.on('error',Meteor.bindEnvironment((err)=>{
                //throw new Meteor.Error("erreurFile","Une erreur est survenue pendant le découpage du fichier.\n Veuillez vérifier que vous avez un relevé valide");
                console.dir(err)
            }));
            lr.on('line',Meteor.bindEnvironment((line)=>{
                newObj.push(line);
               // console.dir(line)
            }));
            
            lr.on('end',Meteor.bindEnvironment(()=>{
                newObj.forEach((element,i)=>{
                    //element.trim();
                    let codop=element.substring(40,44);
                    let libel=element.substring(85);
                    let valeur="";
                    let comptable_op=(element.substring(72,85)).substring(0,1);
                    let montantMatch=element.substring(72,85).match(/([0-9]{1,})$/);
                    if(!montantMatch){
                        let err="Une erreur est survenue pendant le découpage du fichier.\n Veuillez vérifier que vous avez un relevé valide";
                        fut['return'](err);
                        throw new Meteor.Error("erreurFile","Une erreur est survenue pendant le découpage du fichier.\n Veuillez vérifier que vous avez un relevé valide");
                       
                        
                    }
                    let montant_op=montantMatch[0];
                    let qte='';
                    let pu='';
                    let category='';
                    //on recherche quel est l'operation comptable effectuee.Si D on change en C et vice-versa
                    if(comptable_op==='D'){
                        comptable_op='C';
                    }else if(comptable_op==='C'){
                        comptable_op='D';
                    }
                    //en fonction du code operation on fait le decoupage de la quantite et du prix unitaire
                    //Achat d'action
                    if(codop.indexOf('T10')!==-1 && codop.substring(0,1)=="T"){
                        if(codop.indexOf('T100')!==-1 && codop.substring(0,1)=="T"){
                            category="Achat d'actions";
                           let matchPu=libel.match(/(\d+(\.\d+)?){1,}$/);//cherche tous le premier groupe de nombre a partir de la fin .prend en compte les float et les int
                            let matchQte=libel.match(/\d+/);//cherche tous le premier groupe de nombre a partir du debut
                            pu=matchPu[0];
                            qte=matchQte[0]//libel.substring(qteindexStart,);
                            let libelerbeforeValeur;
                            if(libel.match("ACHAT")){
                                libelerbeforeValeur="ACHAT "+qte;
                            }else if(libel.match("SOUSCRIPTION OPV")){
                                libelerbeforeValeur="SOUSCRIPTION OPV "+qte;
                            }
                            
                            let libelerApresValeur=" A XOF "+pu;
                            let finalvaleur=libel.match(libelerbeforeValeur+"(.*)"+libelerApresValeur);
                            if(finalvaleur!=null){
                                valeur=finalvaleur[1].trim();
                            }else{
                                valeur=null
                            }
                            
                        }
                        else if((codop.indexOf('T102')!==-1||codop.indexOf('T103')!==-1||codop.indexOf('T104')!==-1||codop.indexOf('T105')!==-1) && codop.substring(0,1)=="T"){
                            category="Frais sur achat d'actions";
                        }
                         
                        console.log(valeur);
                        
                    }
                    //Vente d'action
                     if(codop.indexOf('T20')!==-1 && codop.substring(0,1)==="T"){
                        if(codop.indexOf('T200')!==-1 && codop.substring(0,1)==="T"){
                            category="Vente d'actions";
                            let matchPu=libel.match(/(\d+(\.\d+)?){1,}$/);// /(\d+(\.\d+)?){1,}$/ cherche tous le premier groupe de nombre a partir de la fin .prend en compte les float et les int
                            let matchQte=libel.match(/\d+/);//cherche tous le premier groupe de nombre a partir du debut
                            pu=matchPu[0];
                            qte=matchQte[0]//libel.substring(qteindexStart,);
                            let libelerbeforeValeur="VENTE "+qte;
                            let libelerApresValeur=" A XOF "+pu;
                            let finalvaleur=libel.match(libelerbeforeValeur+"(.*)"+libelerApresValeur);
                            if(finalvaleur!=null){
                                valeur=finalvaleur[1].trim();
                            }else{
                                valeur=null;
                            }
                        }
                        else if((codop.indexOf('T202')!==-1||codop.indexOf('T203')!==-1||codop.indexOf('T204')!==-1||codop.indexOf('T205')!==-1) && codop.substring(0,1)==="T"){
                            category="Frais sur vente d'actions";
                        }
                        

                    }
                    //Achat d'obligation
                    if((codop.indexOf('T300')!==-1) && codop.substring(0,1)==="T"){
                        category="Achat/Souscription d'obligation"
                    }
                    //Coupon couru sur achat d'obligation
                    if((codop.indexOf('T301')!==-1) && codop.substring(0,1)==="T"){
                        category="Intérêts courus sur achat d'obligation"
                    }
                    //Frais de gestion sur achat d'obligation
                    if((codop.indexOf('T302')!==-1||codop.indexOf('T303')!==-1||codop.indexOf('T304')!==-1||codop.indexOf('T305')!==-1)&& codop.substring(0,1)==="T"){
                        category="Frais sur achat d'obligation"
                    }
                    //Cession/Vente d'obligation
                    if(codop.indexOf('T400')!==-1 && codop.substring(0,1)==="T"){
                        category="Cession/Vente d'obligation";
                    }
                    if((codop.indexOf('T402')!==-1||codop.indexOf('T403')!==-1||codop.indexOf('T404')!==-1||codop.indexOf('T405')!==-1)&& codop.substring(0,1)==="T"){
                        category="Frais sur vente d'obligation"
                    }
                    //Coupon couru sur cession d'obligation
                    if((codop.indexOf('T401')!==-1) && codop.substring(0,1)==="T"){
                        category="Intérêts courus sur cession d'obligation"
                    }
                    //Reception de dividende / Remboursement / Coupons sur obligation
                    
                    if(codop.indexOf('O100')!==-1 && codop.substring(0,1)==="O"){
                        category="Reception de dividende";
                    }
                    if((codop.indexOf('O110')!==-1) && codop.substring(0,1)==="O"){
                        category="Coupon sur obligation";
                    }
                    if((codop.indexOf('O120')!==-1) && codop.substring(0,1)==="O"){
                        category="Remboursement d'obligation";
                    }
                    if((codop.indexOf('O130')!==-1) && codop.substring(0,1)==="O"){
                        category="Rembousement d'obligation Fonds Sicav";
                    }
                    if((codop.indexOf('O140')!==-1) && codop.substring(0,1)==="O"){
                        category="Sortie de Titre";
                    }
                    //Apports et Retraits financiers
                    if((codop.indexOf('C2')!==-1||codop.indexOf('C3')!==-1||codop.indexOf('C1')!==-1) && codop.substring(0,1)==="C"){
                        category="APPORT/RETRAIT ";
                        if(codop.indexOf('C100')!==-1 && codop.substring(0,1)=="C"){
                            category+="Emission Chèque";
                        }
                       if(codop.indexOf('C110')!==-1 && codop.substring(0,1)=="C"){
                            category+="Emission de virement";
                        }
                        if(codop.indexOf('C200')!==-1 && codop.substring(0,1)=="C"){
                            category+="Versement Espèces";
                        }
                        if(codop.indexOf('C210')!==-1 && codop.substring(0,1)=="C"){
                            category+="Réception Virement";
                        }
                        if(codop.indexOf('C220')!==-1 && codop.substring(0,1)=="C"){
                            category+="Remise Chèque";
                        }
                        if(codop.indexOf('C300')!==-1 && codop.substring(0,1)=="C"){
                            category+="Demande souscription";
                        }
                    
                       /* let matchPu=libel.match(/(\d+(\.\d+)?){1,}$/);// /(\d+(\.\d+)?){1,}$/ cherche tous le premier groupe de nombre a partir de la fin .prend en compte les float et les int
                        let matchQte=libel.match(/\d+/);//cherche tous le premier groupe de nombre a partir du debut
                        pu=matchPu[0];
                        qte=matchQte[0]*///libel.substring(qteindexStart,);
                    } 
                    //FRAIS
                    if((codop.indexOf('FT1')!==-1||codop.indexOf('FC1')!==-1) && (codop.substring(0,2)=="FT"||codop.substring(0,2)=="FC")){
                        category="FRAIS ";
                        if(codop.indexOf('FT10')!==-1 && codop.substring(0,2)=="FT"){
                            category+="Droit de garde";
                        }
                        if(codop.indexOf('FT12')!==-1 && codop.substring(0,2)=="FT"){
                            category+="Commisssions Lignes";
                        }
                        if(codop.indexOf('FT14')!==-1 && codop.substring(0,2)=="FT"){
                            category+="Mandat de Gestion";
                        }
                        if(codop.indexOf('FC10')!==-1 && codop.substring(0,2)=="FC"){
                            category+="Commissions diverses";
                        }
                    }
                    //if(codop==='')
                   let temparr={
                       'NUM_COMPTE_BANK_NSIAVIE':element.substring(0,6),
                       'AVANT_DATE_ACHAT':element.substring(13,17),
                       'DATE_ACHAT_DES_TITRES':element.substring(17,25),
                       'DATE_RECEPTION_DES_TITRES':element.substring(25,33),
                       'REFERENCE':element.substring(33,40),
                       'CODE_OPERATION':element.substring(40,44),
                       'SYMBOLE':element.substring(44,element.indexOf(' ')),//n'oublions pas de trimer ca si on doit l'utiliser
                       'CODE_ISIN':element.substring(element.indexOf(' '),72).trim(),
                       'OPERATION_COMPTABLE':comptable_op==='D'?'DEBIT':comptable_op==='C'?'CREDIT':'',
                       'MONTANT_TOTAL':parseInt(montant_op),
                       'APRES_ISIN':element.substring(72,85),
                       'LIBELLE_OPERATION':element.substring(85),
                       'CATEGORIE_TITRE':category,
                       'VALEUR': element.substring(40,44)==="T200"||element.substring(40,44)==="T100"?valeur:null,
                       'QUANTITE':qte,
                       'PRIX_UNITAIRE':pu

                   }; 
                 final.push(temparr);
                // todaysOps.push(temparr);
                    //TempReleve.remove({})
                  //  TempReleve.insert(temparr);
                   
                });
                
                //console.dir(final);
                //let xls=json2xls(final);
                fut['return'](final);
             
                //apres avoir fini le decoupage on efface le fichier du server et on stocke l'objet dans une variable de session
            }));
         return fut.wait();
        },
//-----------------COMPTABILISATION METHOD------------------------------->
        comptabilisation(rel){
            //console.dir(COMPTES);
            IsTraiting.insert({traitement:true});
            let COMPTES=ComptesFinanciers.find().fetch();
            let invcontent=Inventaire.find({},{sort:{DateAcquisition:1}}).fetch();
            TempInventaire.remove({});
            invcontent.forEach((e)=>{
                TempInventaire.insert(e);
            });
            if(rel.length<-1){
                throw new Meteor.Error("Relevé invalide");
            }else{
                //normalement la comptabilisation doit etre elle aussi chronologique mais pour l'instant on s'occupera des actions
                let compta;
                let tempArrD=[];
                let tempArrC=[];
                let pvmvTemp=[];//tableau de traitement des plus/moins values
                console.log("====Dans la comptabilisation=====================================================>")
                rel.forEach((e,i)=>{
                    //console.dir(e);
                    let codop=e.CODE_OPERATION;
                    let temp={};
                    let dateAchatFormatted=convertInDateObjFromFrenchDate(transformInFrenchDate(e.DATE_ACHAT_DES_TITRES));
                     //---------GESTION DE LA PARTIE DEBIT---------------------------//
                    //Achat d'action
                    if(codop.indexOf('T10')!==-1 && codop.substring(0,1)=="T"){
                        if(codop.indexOf('T100')!==-1 && codop.substring(0,1)=="T"){
                            console.log("achat d'action");
                           //il ya un achat d'action
                           let compte=COMPTES.filter((obj)=>{
                               return obj.type==="AC"
                           });
                           compte=compte[0];
                           
                            temp.compte=compte;
                            temp.libelle="Acquisition de "+e.QUANTITE+" actions "+e.VALEUR;
                            temp.libelleS="Acquisiton de "+e.QUANTITE+" actions "+e.VALEUR,
                            temp.montant=e.MONTANT_TOTAL;
                            temp.symbole=e.SYMBOLE;
                            temp.ref=parseInt(e.REFERENCE);
                            temp.ou="D";
                            temp.qte=e.QUANTITE;
                            temp.date=dateAchatFormatted;
                            temp.typeOp="AAC";
                            temp.indexOP=i;
                           //FIFO on verifie que cette ligne n'existe pas deja dans l'inventaire si elle existe on skip
                           

                           console.log("===== Date Achat en francais "+dateAchatFormatted);
                           let existInFIFO=TempInventaire.findOne({DateAcquisition:dateAchatFormatted,reference:temp.ref,Symbole:e.SYMBOLE,PrixUnitaire:e.PRIX_UNITAIRE,Quantite:e.QUANTITE});
                           
                           if(!existInFIFO){
                              
                               
                               let valbilan=parseInt(e.QUANTITE)*parseInt(e.PRIX_UNITAIRE);
                               TempInventaire.insert({
                                DateAcquisition:dateAchatFormatted,
                                Valeur:e.VALEUR,
                                Quantite:e.QUANTITE,
                                PrixUnitaire:e.PRIX_UNITAIRE,
                                ValBilan:valbilan,
                                SGI:'NSIAFINANCE',
                                Symbole:e.SYMBOLE,
                                reference:temp.ref,
                                lastTypeOp:'AAC',
                                IsFractionned:false,
                                type:"ACTIONS"

                               });
                               //Archivage de l'achat dans HistoriqueFIFO
                                TempHistoFIFO.insert({
                                    Valeur:e.VALEUR,
                                    Date:dateAchatFormatted,
                                    typeop:'ACHAT',
                                    Quantite:e.QUANTITE,
                                    prixVente:0,
                                    prixAchat:e.PRIX_UNITAIRE,
                                    ValBilan:valbilan,
                                    PMvalue:0,
                                    Symbole:e.SYMBOLE,
                                    ref:parseInt(e.REFERENCE),
                                    type:'ACTIONS'
                                });
                           }
                        }
                        else if((codop.indexOf('T102')!==-1||codop.indexOf('T103')!==-1||codop.indexOf('T104')!==-1||codop.indexOf('T105')!==-1) && codop.substring(0,1)=="T"){
                            console.log("frais achat d'action");
                            let compte=COMPTES.filter((obj)=>{
                                    return obj.type==="FR"
                                });
                                compte=compte[0];
                                temp.compte=compte;
                                temp.libelle=e.LIBELLE_OPERATION;
                                temp.libelleS="Frais sur acquisition de "+e.QUANTITE+" actions "+e.VALEUR,
                                temp.montant=e.MONTANT_TOTAL;
                                temp.symbole=e.SYMBOLE;
                                temp.ref=parseInt(e.REFERENCE,10);
                                temp.ou="D";
                                temp.qte=e.QUANTITE;
                                temp.date=dateAchatFormatted;
                                temp.typeOp="FRAAC";
                                temp.indexOP=i;
                                
                         
                            
                        }
                        
                    }
                    //Vente d'action
                    else if(codop.indexOf('T20')!==-1 && codop.substring(0,1)=="T"){
                        if(codop.indexOf('T200')!==-1 && codop.substring(0,1)=="T"){
                             console.log("vente d'action");
                           //il ya une vente d'action
                           //on verifie dans l'inventaire par la reference que on a la bonne action
                           let compte=COMPTES.filter((obj)=>{
                               return obj.type==="BANK"
                           });
                           compte=compte[0];
                            temp.compte=compte;
                            temp.libelle="Cession de "+e.QUANTITE+" actions "+e.VALEUR+" au prix de vente de "+e.PRIX_UNITAIRE,
                            temp.libelleS="Cession de "+e.QUANTITE+" actions "+e.VALEUR+" au prix de vente de "+e.PRIX_UNITAIRE,
                            temp.montant=e.MONTANT_TOTAL;
                            temp.symbole=e.SYMBOLE;
                            temp.ref=parseInt(e.REFERENCE,10);
                            temp.ou="D";
                            temp.qte=e.QUANTITE;
                            temp.date=dateAchatFormatted;
                            temp.typeOp="VAC";
                            temp.indexOP=i;

                            //recupere le resultat de la recherche et comptabilisation des plus/moins values 
                            comptaMVPV(e,i,0,pvmvTemp,[]);
                          
                            
                        
                        }
                        else if((codop.indexOf('T202')!==-1||codop.indexOf('T203')!==-1||codop.indexOf('T204')!==-1||codop.indexOf('T205')!==-1) && codop.substring(0,1)=="T"){
                             console.log("frais vente d'action");
                            let compte=COMPTES.filter((obj)=>{
                                    return obj.type==="FR"
                                });
                                compte=compte[0];
                                temp.compte=compte;
                                temp.libelle=e.LIBELLE_OPERATION,
                                temp.libelleS="Frais sur cession de "+e.QUANTITE+" actions "+e.VALEUR,
                                temp.montant=e.MONTANT_TOTAL;
                                temp.symbole=e.SYMBOLE;
                                temp.ref=parseInt(e.REFERENCE,10);
                                temp.ou="D";
                                temp.qte=e.QUANTITE;
                                temp.date=dateAchatFormatted;
                                temp.typeOp="FRVAC";
                                temp.indexOP=i;
                               
                           
                            
                        }
                        
                    }
                    tempArrD.push(temp);
                   // console.log("Pvmp");
                    //console.log(pvmvTemp[0]);
                    if(pvmvTemp!==undefined ){
                       // console.log("A la sortie====")
                        //console.log(pvmvTemp);
                        pvmvTemp.forEach((e)=>{
                            if(e!==undefined){
                                tempArrD.push(e.mvpv);
                                tempArrD.push(e.temp);
                            }
                            
                        });
                        
                    }
                    
                    
                });
                console.log("====TempArr===========================================>");
                    //console.dir(tempArrD);
                    console.log("====fin tempArr===========================================>");
                /*tempArr.sort((a,b)=>{
                    return a.ref-b.ref;
                });*///regroupe les operations du relever par reference

                //---------GESTION DE LA PARTIE CREDIT---------------------------//
                tempArrD.map((e)=>{
                    //pour l'Achat d'action on gere la bank ici
                    if(e.typeOp==="AAC"||e.typeOp==="FRAAC"){
                            let compte=COMPTES.filter((obj)=>{
                                    return obj.type==="BANK"
                                });
                                compte=compte[0];
                            let bankobj={
                                compte:compte,
                                libelle:e.libelle,
                                libelleS:e.libelleS,
                                montant:e.montant,
                                symbole:e.symbole,
                                ref:e.ref,
                                ou:'C',
                                qte:e.qte,
                                date:e.date,
                                typeOp:e.typeOp,
                                indexOp:e.indexOp,
                                
                            };
                            tempArrC.push(bankobj);
                         }
                          //cession d4actions et gestion des plus-moins value
                         if(e.typeOp==="VAC"){
                             /**Ici on doit pouvoir determiner dans linventaire si on a une plus value ou moins value */
                           /* let compte=COMPTES.filter((obj)=>{
                                    return obj.type==="AC"
                                });
                                compte=compte[0];
                            let bankobj={
                                compte:compte,
                                libelle:e.libelle,
                                libelleS:e.libelleS,
                                montant:e.montant,
                                symbole:e.symbole,
                                ref:e.ref,
                                ou:'C',
                                qte:e.qte,
                                typeOp:e.typeOp,
                                indexOp:e.indexOp,
                               
                            };
                            tempArrC.push(bankobj);*/

                         }else if(e.typeOp==="FRVAC"){
                             let compte=COMPTES.filter((obj)=>{
                                    return obj.type==="BANK"
                                });
                                compte=compte[0];
                            bankobj={
                                compte:compte,
                                libelle:e.libelle,
                                libelleS:e.libelleS,
                                montant:e.montant,
                                symbole:e.symbole,
                                ref:e.ref,
                                ou:'C',
                                qte:e.qte,
                                date:e.date,
                                typeOp:e.typeOp,
                                indexOp:e.indexOp,
                               
                            };
                            tempArrC.push(bankobj);
                            
                         }
                });
           
                console.log("====comptabilisation finale=====================================================>");
                //console.dir(compta);
                let refArray=[];
                tempArrD.forEach((e)=>{
                    if(refArray.indexOf(e)===-1){
                         refArray.push(e.ref);
                    }
                   
                });
                refArray=R.filter((n)=>(n>0),refArray);//on enleve les references qui n'existe pas
                compta=tempArrD.concat(tempArrC);
                let filteringVide=R.filter((n)=>(n.montant>0),compta);
                let byRef=filteringVide.groupBy('ref');
                let final=[];
                let properOrder=[];
                refArray.forEach((e,ind)=>{
                   // console.log(e+"  "+typeof e);
                   // console.log(byRef[`${e}`]);
                    properOrder.push(byRef[`${e}`]);
                });
                //tableau dans le bon ordre est un tableau multidimensionnel donc une double for loop est requise pour le tableau final
                for(let i=0;i<properOrder.length;i++){
                    let operation=properOrder[i];
                    for(let j=0;j<operation.length;j++){
                        final.push(operation[j]);
                    }
                }
                //la on filtre les doublons dans le tableau final en utilisant une fonction de lodash ou underscore
                let dEnd=_.uniq(final,(v)=>{
                    return v.compte.compte && v.compte.libelle && v.compte.type && v.libelle && v.libelleS && v.montant && v.symbole && v.ref && v.ou && v.qte && v.typeOp && v.indexOp;
                });
                let properOps=groupByLibel(dEnd);
				let finaly=[];
				properOps.forEach((e)=>{
					e.forEach((v)=>{
						finaly.push(v);
					})
					
				});
                //console.dir(finaly);
                return finaly;
            }
        },
        mapInventory(){
            //let fut=new Future();
            const pathToFile=process.env.PWD+'/FICHIERS/Inventaire/inventory.csv';
            console.log(pathToFile);
            console.dir(Baby);
            
            let parsed=Baby.parseFiles(pathToFile,{
                header:true,
                complete(results,file){
                   // console.dir(results.data);
                    check(results.data,Array);
                    for(let i=0;i<results.data.length;i++){
                        console.dir(results.data[i]);
                        Inventaire.insert({
                            DateAcquisition:convertInDateObjFromFrenchDate(results.data[i].DATE),
                            Valeur:results.data[i].VALEURS,
                            Quantite:parseInt(results.data[i].Qtites,10),
                            PrixUnitaire:parseInt(results.data[i].Nominal,10),
                            ValBilan:parseInt(results.data[i].Qtites,10)*parseInt(results.data[i].Nominal,10),
                            SGI:results.data[i].SGI,
                            Symbole:results.data[i].SYMBOL,
                            reference:parseInt(results.data[i].Reference,10),
                            lastTypeOp:"INVFILE",
                            IsFractionned:false,
                            type:results.data[i].TYPE_VALEUR
                        });
                        TempInventaire.insert({
                            DateAcquisition:convertInDateObjFromFrenchDate(results.data[i].DATE),
                            Valeur:results.data[i].VALEURS,
                            Quantite:parseInt(results.data[i].Qtites,10),
                            PrixUnitaire:parseInt(results.data[i].Nominal,10),
                            ValBilan:parseInt(results.data[i].Qtites,10)*parseInt(results.data[i].Nominal,10),
                            SGI:results.data[i].SGI,
                            Symbole:results.data[i].SYMBOL,
                            reference:parseInt(results.data[i].Reference,10),
                            lastTypeOp:"INVFILE",
                            IsFractionned:false,
                            type:results.data[i].TYPE_VALEUR
                        });
                    }
                    Inventaire.remove({
                        Valeur:null
                    });
                    TempInventaire.remove({
                        Valeur:null
                    });
                    
                }
            });
           
        },
         dropInventory(momento){
             if(momento==null){
                //on vide tout comme neuf
                InventaireBackup.remove({});
                HistoriqueFIFO.remove({});
                HistoriqueFIFOBackup.remove({});
                HistoriqueR.remove({});
                HistoriqueRBackup.remove({});
                IsTraiting.remove({});
                TempInventaire.remove({});
                Inventaire.remove({},(e,r)=>{
                    if(e){
                        throw new Meteor.Error("Une erreur s'est produite lors de la vidange de l'inventaire");
                    }else if(r){
                    
                        return true;
                    }
                });
             }else{
                let inventaireBack=InventaireBackup.find({}).fetch();
                let invB=groupSumBySymbole(inventaireBack,['moment'],['Quantite']);
                let invback,histoFIFOback,histoRback;
                //on recupere la sauvegarde au moment demande
                invback=InventaireBackup.find({moment:momento},{}).fetch();
                 //on verifie quel sauvegarde a ete choisie
                 //si le choix est egal au dernier moment dans la base
                 let momentoLast=invB.length==2?invB[0].moment>invB[1].moment?invB[0].moment:invB[1].moment:0;
                 console.log("momento="+momento+" invB length="+invB.length+" momentoLast="+momentoLast);

                 if(momento==momentoLast){ 
                    //on recupere les differents Historiques avant le moment demande
                     histoFIFOback=HistoriqueFIFOBackup.find({moment:{$lt:momento}},{}).fetch();
                     histoRback=HistoriqueRBackup.find({moment:{$lt:momento}},{}).fetch();

                 }
                             
                InventaireBackup.remove({});
                HistoriqueFIFOBackup.remove({});
                HistoriqueRBackup.remove({});
                HistoriqueFIFO.remove({});
                HistoriqueR.remove({});
                IsTraiting.remove({});
                TempInventaire.remove({});
                Inventaire.remove({},(e,r)=>{
                    if(e){
                        throw new Meteor.Error("Une erreur s'est produite lors de la vidange de l'inventaire");
                    }else if(r){
                        if(momento==momentoLast){

                            histoFIFOback.map((e)=>{
                                HistoriqueFIFO.insert(e);
                            });
                            histoRback.map((e)=>{
                                HistoriqueR.insert(e);
                            });
                        }
                        
                        invback.map((e)=>{
                            Inventaire.insert(e);
                        });
                        
                        return true;
                    }
                });
             }
        },
        dropTempInventory(){
             
           TempInventaire.remove({},(e,r)=>{
            if(e){
                throw new Meteor.Error("Une erreur s'est produite lors de la vidange de l'inventaire");
            }else if(r){
                return true;
            }
           });
           TempHistoFIFO.remove({})
        },
        chargeInvWithSnap(fifosnap){
            fifosnap.map((e)=>TempInventaire.insert(e));
            //IsTraiting
            IsTraiting.remove({});
        },
        getInventoryCount(){
            return Inventaire.find({}).count();
        },
        defaultSGI(){
            let SGIS={
                nom:['HUDSON','NSIAFINANCE']
            };
            SGIS.forEach((e)=>{
                SGI.upsert({
                    nom:e.nom
                },{
                    $set:{
                        nom:e.nom
                    }
                });
            });
            
        },
        defaultComptesFin(){//A completer
            let comptes={
                abrev:['OOIC','OIFC','AOC','CLOTOCBRVM','CLOT','AC','CLOTONC','CLOT2','OEC','CLOTVENC','AEC','VETANC','OOINC','OIFNC','AONC','ANC','ONC','BANK','FR','MV','PV','DIV'],
                libelles:['Obligations des organismes internationaux côtées','Obligations des institutions financières côtées','Autres obligations côtées','CLOTURE (obligation côtée BRVM)','CLOTURE (a identifier)','Actions côtées','CLOTURE (obligation non côtée)','CLOTURE (a identifier)','Obligations étrangères côtées','CLOTURE (valeur étrangère non côtée)','Actions étrangères côtées',"Valeurs d'etat non côtées",'Obligations des organismes internationaux non côtées','Obligations des institutions financières non côtées','Autres obligations non côtées','Actions non côtées','Obligations non côtées','Banque','Frais','Moins value','Plus Value','Dividendes'],
                compte:[232000,232100,232200,232300,232500,233000,233300,233500,236000,236500,237000,238100,238200,238300,238400,238500,238600,562115,675000,840000,845000,773500]
            };
            comptes.compte.forEach((e,index)=>{
                 ComptesFinanciers.upsert({
                        compte:e,
                        libelle:comptes.libelles[index],
                        type:comptes.abrev[index]
                    },{
                    $set:{
                        compte:e,
                        libelle:comptes.libelles[index],
                        type:comptes.abrev[index]
                    }
                });
            });
        },
        findTempReleve(){
            return TempReleve.find({}).fetch();
        },
        deleteTempReleve(){
            return TempReleve.remove({});
        }
    });
};