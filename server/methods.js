import {Meteor} from 'meteor/meteor';
import {Accounts} from 'meteor/accounts-base';
import Sequelize from 'sequelize';
import {DBSQLITE,DBSQLSERVER} from '../imports/api/graphql/connectors.js';
import {moment} from 'meteor/momentjs:moment';
import Excel from 'exceljs';
import LineByLineReader from 'line-by-line';
import {TempReleve,SGI,ComptesFinanciers,FichiersInv,Inventaire} from '../imports/api/collections.js';
import Future from 'fibers/future';
import {transformInFrenchDate,groupByLibel,convertInDateObjFromFrenchDate} from '../imports/utils/utils.js';
//import {Baby} from 'meteor/modweb:baby-parse';
import Baby from 'babyparse';
import {check} from 'meteor/check';
import _ from 'lodash';
const R= require('ramda');

const json2xls=require('json2xls');
//const Excel=require('exceljs');
let xlfile=process.env.PWD+'/FICHIERS/relevers/releveOp.xls';
const COMPTES=ComptesFinanciers.find().fetch();


Array.prototype.groupBy=function(prop){
    return this.reduce(function(groups,item){
        var val=item[prop];
        groups[val]=groups[val] || [];
        groups[val].push(item);
        return groups;
    },{});
}

function comptaMVPV(e,index,quantiteRestante,pvmvTemp,tableauRes){ //on renvoi un array d'objet avec la plus ou moins value
     //FIFO on verifie que cette ligne n'existe pas deja dans l'inventaire si elle existe on skip
                           // console.log("=====tableauRes au debut de la fonction comptaMVPV========")
                            //console.log(tableauRes.length);
                            //console.log(tableauRes);
                            //console.log("=====tableauRes au debut de la fonction comptaMVPV========")
                            let temp={};
                            let mvpv={};
                           let dateAchatFormatted=transformInFrenchDate(e.DATE_ACHAT_DES_TITRES);
                           //console.log("===== Date Achat en francais vente d'action "+dateAchatFormatted);
                           let existInFIFO=Inventaire.findOne({Symbole:e.SYMBOLE});
                           if(existInFIFO){
                              //si l'action existe dans l'inventaire on verifie la premiere occurence de l'action dans l'inventaire
                               console.log("Le voila premier objet trouver pour la vente d'action symbole= " +e.SYMBOLE+" est: ");
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
                                        Inventaire.update(existInFIFO,{
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
                                        mvpv.typeOp="VAC";
                                        mvpv.indexOP=index+1;
                                        
                                        tableauRes.push({temp,mvpv});
                                        console.log("content of tableauRes avant return======");
                                        //console.log(tableauRes);
                                        tableauRes.forEach((e)=>pvmvTemp.push(e));
                                        //return tableauRes;
                                        

                                    }else if(newQteEnStockDuPremierTrouver<0){
                                        //enlever la ligne dont la quantite est epuisee
                                        let montantMV=(existInFIFO.PrixUnitaire-e.PRIX_UNITAIRE)*existInFIFO.Quantite;
                                        Inventaire.remove(existInFIFO,()=>{
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
                                            mvpv.typeOp="VAC";
                                            mvpv.indexOP=index+1;

                                            //on yield la valeur trouver
                                             console.log("longueur du tableau avant "+tableauRes.length);
                                            tableauRes.push({temp,mvpv});
                                         
                                            //on check si on a encore ce type de valeur en stock
                                            existInFIFO=Inventaire.findOne({Symbole:e.SYMBOLE});
                                            if(existInFIFO){
                                                comptaMVPV(e,index++,Math.abs(newQteEnStockDuPremierTrouver),pvmvTemp,tableauRes);
                                            }
                                        

                                    }else if(newQteEnStockDuPremierTrouver===0){
                                       // console.log("MV avec QTE===0");
                                        //enlever la ligne dont la quantite est epuisee
                                        let montantMV=(existInFIFO.PrixUnitaire-e.PRIX_UNITAIRE)*existInFIFO.Quantite;
                                        //console.log("MontantMV:"+montantMV);
                                        //console.dir(existInFIFO);
                                        Inventaire.remove(existInFIFO,()=>{
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
                                            mvpv.typeOp="VAC";
                                            mvpv.indexOP=index+1;

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
                                        Inventaire.update(existInFIFO,{
                                            $set:{
                                                ValBilan:newQteEnStockDuPremierTrouver*existInFIFO.PrixUnitaire,
                                                Quantite:newQteEnStockDuPremierTrouver,
                                                lastTypeOp:"VACPV"
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
                                        mvpv.typeOp="VAC";
                                        mvpv.indexOP=index+1;
                                        
                                        tableauRes.push({temp,mvpv});
                                        console.log("content of tableauRes avant return======");
                                        //console.log(tableauRes);
                                        tableauRes.forEach((e)=>pvmvTemp.push(e));
                                        //return tableauRes;
                                        

                                    }else if(newQteEnStockDuPremierTrouver<0){
                                        //enlever la ligne dont la quantite est epuisee
                                        let montantPV=(e.PRIX_UNITAIRE-existInFIFO.PrixUnitaire)*existInFIFO.Quantite;
                                        Inventaire.remove(existInFIFO,()=>{
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
                                            mvpv.typeOp="VAC";
                                            mvpv.indexOP=index+1;

                                            //on yield la valeur trouver
                                             console.log("longueur du tableau avant "+tableauRes.length);
                                            tableauRes.push({temp,mvpv});
                                          
                                            //on check si on a encore ce type de valeur en stock
                                            existInFIFO=Inventaire.findOne({Symbole:e.SYMBOLE});
                                            if(existInFIFO){
                                                comptaMVPV(e,index++,Math.abs(newQteEnStockDuPremierTrouver),pvmvTemp,tableauRes);
                                            }
                                        

                                    }else if(newQteEnStockDuPremierTrouver===0){
                                        //enlever la ligne dont la quantite est epuisee
                                        let montantPV=(e.PRIX_UNITAIRE-existInFIFO.PrixUnitaire)*existInFIFO.Quantite;
                                        Inventaire.remove(existInFIFO,()=>{
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
                                            mvpv.typeOp="VAC";
                                            mvpv.indexOP=index+1;

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
        updateFraction(values){
            //on recupere les champs concernes pour effectuer le fractionnement
            
            let valeursInv=Inventaire.find({}).fetch();

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
            lr.on('error',(err)=>{
                console.dir(err)
            });
            lr.on('line',(line)=>{
                newObj.push(line);
               // console.dir(line)
            });
            
            lr.on('end',Meteor.bindEnvironment(()=>{
                newObj.forEach((element,i)=>{
                    //element.trim();
                    let codop=element.substring(40,44);
                    let libel=element.substring(85);
                    let valeur="";
                    let comptable_op=(element.substring(72,85)).substring(0,1);
                    let montantMatch=element.substring(72,85).match(/([0-9]{1,})$/);
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
            if(rel.length<-1){
                throw new Meteor.Error("Relever invalide");
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
                            temp.typeOp="AAC";
                            temp.indexOP=i;
                           //FIFO on verifie que cette ligne n'existe pas deja dans l'inventaire si elle existe on skip
                           let dateAchatFormatted=transformInFrenchDate(e.DATE_ACHAT_DES_TITRES);

                           console.log("===== Date Achat en francais "+dateAchatFormatted);
                           let existInFIFO=Inventaire.findOne({DateAcquisition:dateAchatFormatted,reference:temp.ref,Symbole:e.SYMBOLE,PrixUnitaire:e.PRIX_UNITAIRE,Quantite:e.QUANTITE});
                           if(!existInFIFO){
                              
                               
                               let valbilan=parseInt(e.QUANTITE)*parseInt(e.PRIX_UNITAIRE);
                               Inventaire.insert({
                                DateAcquisition:dateAchatFormatted,
                                Valeur:e.VALEUR,
                                Quantite:e.QUANTITE,
                                PrixUnitaire:e.PRIX_UNITAIRE,
                                ValBilan:valbilan,
                                SGI:'NSIAFINANCE',
                                Symbole:e.SYMBOLE,
                                reference:temp.ref,
                                lastTypeOp:'AAC',
                                type:"ACTIONS"

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
            const pathToFile=process.env.PWD+'/FICHIERS/inventaire/inventory.csv';
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
                            DateAcquisition:results.data[i].DATE,
                            Valeur:results.data[i].VALEURS,
                            Quantite:parseInt(results.data[i].Qtites,10),
                            PrixUnitaire:parseInt(results.data[i].Nominal,10),
                            ValBilan:parseInt(results.data[i].Qtites,10)*parseInt(results.data[i].Nominal,10),
                            SGI:results.data[i].SGI,
                            Symbole:results.data[i].SYMBOL,
                            reference:parseInt(results.data[i].Reference,10),
                            lastTypeOp:"INVFILE",
                            type:results.data[i].TYPE_VALEUR
                        });
                    }
                }
            });
        },
         dropInventory(){
             
           Inventaire.remove({},(e,r)=>{
            if(e){
                throw new Meteor.Error("Une erreur s'est produite lors de la vidange de l'inventaire");
            }else if(r){
                return true;
            }
           });
        },
        chargeInvWithSnap(fifosnap){
            fifosnap.map((e)=>Inventaire.insert(e));
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