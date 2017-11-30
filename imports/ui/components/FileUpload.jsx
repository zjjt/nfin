import React,{PropTypes,Component} from 'react';
import {TextField} from 'redux-form-material-ui';
import Divider from 'material-ui/Divider';
import CircularProgress from 'material-ui/CircularProgress';
import LinearProgress from 'material-ui/LinearProgress';
import {connect} from 'react-redux';
import RaisedButton from 'material-ui/RaisedButton';
import {FlowRouter} from 'meteor/kadira:flow-router';
import {Field,reduxForm,formValueSelector} from 'redux-form';
import Dialog from 'material-ui/Dialog';
import {FilesCollection} from 'meteor/ostrio:files';
import FlatButton from 'material-ui/FlatButton';
import {Meteor} from 'meteor/meteor';
import {FichiersOP,HistoriqueR} from '../../api/collections';
import {decoupagedone,releverOk} from '../../redux/actions/relever-actions';
import {snapInvent} from '../../redux/actions/inventaire-actions';
import RelevTable from './RelevTable.jsx';
import {Inventaire} from '../../api/collections.js';
const R= require('ramda');
import {transformInFrenchDate,groupSumBySymbole} from '../../utils/utils.js';
import {$} from 'meteor/jquery';


const styles={
    uploadInput:{
        cursor:'pointer',
        position:'absolute',
        top:0,
        bottom:0,
        right:0,
        left:0,
        width:'0%',
        opacity:0,
        zIndex:-100000
    }
}
 class FileUpload extends Component{
    constructor(){
        super();
        this.state={
            dialogIsOpen:false,
            dialogTIsOpen:false,
            errorMsg:'',
            showLoader:false,
            error:false,
            alreadyOp:false,
            decoupage:[],
            currentFile:false,
            progress:null,

        }
    }

   _dialogOpen(){
       this.setState({dialogIsOpen: true});
   }
   _dialogClose(){
       this.setState({dialogIsOpen: false});
   }
    _dialogTOpen(){
        this.setState({dialogTIsOpen: true,alreadyOp:true});
    }

    _dialogTClose(){
        this.setState({dialogTIsOpen: false,alreadyOp:true});
    }
   componentWillUpdate(){
       const {dispatch}=this.props;
       if(this.state.decoupage.length>=1 && !this.state.alreadyOp){
            dispatch(decoupagedone(this.state.decoupage));
            dispatch(snapInvent());
            this.setState({
                dialogTIsOpen:true,
                alreadyOp:true
            })
            
        }
            /*setTimeout( Meteor.call("findTempReleve",(err,res)=>{
                        if(res){

                        console.dir(res);
                        const buf=new ArrayBuffer(res.length);
                        const view=new Uint8Array(buf);
                        for(let i=0;i!=res.length;i++) view[i]=res.charCodeAt(i) & 0xFF;
                        const blob=new Blob([buf],{
                            type:'application/octet-stream'
                        });

                        const a=window.document.createElement('a');
                        a.href=window.URL.createObjectURL(blob,{
                            type:'data:attachment/xlsx'
                        });
                        a.download='fichierDecouper'+new Date()+'.xlsx';
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        this.setState({
                            decoupage:res
                        });
                    }
                 }), 5000);*/
             
                
                
             
        
        
   }
    render(){
         const {handleSubmit,pristine,submitting,dispatch}=this.props;
        if(this.state.currentFile && this.state.decoupage.length<=0){
             Meteor.call("decoupExcel",(err,res)=>{
                // console.dir(res);
                        if(res){
                            //alert(typeof res)
                            if(typeof res !== "string"){
                                this.setState({
                                 decoupage:res
                             });
                            }else{
                                this.setState({
                                error:true,
                                showLoader:false,
                                errorMsg:res
                            });
                            this._dialogOpen();
                            }
                            
                             
                        }else if(err){
                            this.setState({
                                error:true,
                                showLoader:false,
                                errorMsg:err.reason
                            });
                            this._dialogOpen();
                        }
                        
             });
        }
        
        console.dir(this.state.decoupage);
       /* if(this.state.decoupage.length!==-1){
               const buf=new ArrayBuffer(this.state.decoupage.length);
                        const view=new Uint8Array(buf);
                        for(let i=0;i!=this.state.decoupage.length;i++) view[i]=this.state.decoupage.charCodeAt(i) & 0xFF;
                        const blob=new Blob([buf],{
                            type:'application/octet-stream'
                        });

                        const a=window.document.createElement('a');
                        a.href=window.URL.createObjectURL(blob,{
                            type:'data:attachment/xlsx'
                        });
                        a.download='fichierDecouper'+new Date()+'.xlsx';
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
        }*/
         const dialogTActions = [
                <FlatButton
                    label="OK"
                    primary={true}
                    onTouchTap={()=>{
                        //On cherche a savoir si l'on a assez de stock pour pouvoir vendre sinon le relever est errone
                        let rel=this.state.decoupage;
                        if(rel.length||rel!=undefined){
                           let i=HistoriqueR.findOne({
                                DATE_ACHAT_DES_TITRES:rel[0].DATE_ACHAT_DES_TITRES,
                                DATE_RECEPTION_DES_TITRES:rel[0].DATE_RECEPTION_DES_TITRES,
                                REFERENCE:rel[0].REFERENCE,
                                CODE_OPERATION:rel[0].CODE_OPERATION,
                                SYMBOLE:rel[0].SYMBOLE,
                                CODE_ISIN:rel[0].CODE_ISIN,
                                MONTANT_TOTAL:rel[0].MONTANT_TOTAL,
                                QUANTITE:rel[0].QUANTITE,
                                LIBELLE_OPERATION:rel[0].LIBELLE_OPERATION,
                                PRIX_UNITAIRE:rel[0].PRIX_UNITAIRE,
                            });
                           // console.log(typeof i);
                            
                            //console.dir(i);
                            if(i){
                                this.setState({
                                        error:true,
                                        showLoader:false,
                                        errorMsg:"Veuillez vérifier le relevé ou le changer car les opérations qu'il comporte ont déjà été intégrées le "+moment(i.DATE_RELEVER).format("DD/MM/YYYY")+" par l'utilisateur "+i.PAR
                                    });
                                    this._dialogOpen();
                                    return;
                                
                            }
                            let arrSym=[],invArr=[];
                            rel.map((e)=>{
                                if(e.CODE_OPERATION==="T200"){
                                     arrSym.push({symbole:e.SYMBOLE,qte:e.QUANTITE});
                                }
                               
                            });
                            invArr=Inventaire.find().fetch();
                            //alert(invArr[0]);
                            if(invArr[0]===undefined||typeof invArr[0] ===undefined){
                                this.setState({
                                        error:true,
                                        showLoader:false,
                                        errorMsg:`Il n'y a aucun stock dans l'inventaire. Veuillez ajouter un inventaire.`
                                    });
                                    this._dialogOpen();
                                    return;
                            }
                            arrSym=groupSumBySymbole(arrSym,["symbole"],["qte"]);
                            invArr=groupSumBySymbole(invArr,["Symbole"],["Quantite"]);
                            
                            console.log(this.state.error);
                            //alert("arrSym/"+JSON.stringify(arrSym));
                            //alert("invArr/"+JSON.stringify(invArr));
                           if(arrSym!=undefined && arrSym.length>0){ 
                               arrSym.forEach((e)=>{
                                let inv=R.filter(R.where({'Symbole':R.contains(e.symbole)}))(invArr);
                               console.log("inv/"+JSON.stringify(inv));
                                if(inv.length){
                                    if(e.qte>inv[0].Quantite){
                                        this.setState({
                                            error:true,
                                            showLoader:false,
                                            errorMsg:`Le relevé indique que l'opération de cession d'action ${inv[0].Valeur} a une quantité supérieure (${e.qte}) à celle présente dans le stock (${inv[0].Quantite}). Serait ce dû à un fractionnement non pris en compte ? Veuillez re-vérifier le relevé.`
                                        });
                                        this._dialogOpen();
                                        return;
                                    }else{
                                        this.setState({
                                                    error:false,
                                                    showLoader:true,
                                                    errorMsg:`Veuillez patienter pendant que le processus comptabilisation s'exécute...`
                                                });
                                                this._dialogOpen();
                                                dispatch(releverOk());
                                    }
                                }else{
                                    
                                    this.setState({
                                        error:true,
                                        showLoader:false,
                                        errorMsg:`Une erreur de traitement est survenue.... veuillez actualiser la page attendre un moment et réessayer...`
                                    });
                                    this._dialogOpen();
                                   return;
                                }
                                 /*else{
                                    
                                    this.setState({
                                        error:false,
                                        showLoader:true,
                                        errorMsg:`Veuillez patienter pendant que le processus comptabilisation s'exécute...`
                                    });
                                    this._dialogOpen();
                                    dispatch(releverOk());
                                }*/
                                //alert(JSON.stringify(inv));
                            });
                        }else{
                            this.setState({
                                        error:false,
                                        showLoader:true,
                                        errorMsg:`Veuillez patienter pendant que le processus comptabilisation s'exécute...`
                                    });
                                    this._dialogOpen();
                                    dispatch(releverOk());
                        }
                            
                        }else{
                            this.setState({
                                        error:true,
                                        showLoader:false,
                                        errorMsg:`Veuillez vérifier que vous avez fourni un relevé d'opérations valide`
                                    });
                        }
                        
                    }}
                />,
                ];
        const dialogActions = [
        <FlatButton
            label="OK"
            primary={true}
            onTouchTap={()=>{
                if(this.state.error){
                    this.setState({
                        error:false
                    });
                    Meteor.call("cancelTraitement");
                    FlowRouter.go('dashboard');
                }
                this._dialogClose();
            }}
        />,
        ];
       
        
        return(
            <div className="loginformCont">
                <Dialog
                    title={`Relevé des opérations financières à intégrer`}
                    actions={dialogTActions}
                    modal={false}
                    open={this.state.dialogTIsOpen}
                    onRequestClose={this._dialogTClose}
                    titleStyle={{backgroundColor:'#1f2d67',color:'white'}}
                    contentStyle={{width:'80%',maxWidth:'none'}}
                    autoScrollBodyContent={true}
                    >
                        <RelevTable dispatch={dispatch} relever={this.state.decoupage}/>
                    </Dialog>

                <Dialog
                actions={dialogActions}
                modal={false}
                open={this.state.dialogIsOpen}
                onRequestClose={this._dialogClose}
                style={{color:'red'}}
                autoDetectWindowHeight={true}
                >
                <span className={this.state.error?"errorMsg":"okMsg"}>{this.state.errorMsg}</span>
                {this.state.showLoader?(<LinearProgress mode="indeterminate"/>):null}
                </Dialog>

                <form>
                <input type="file" 
                    className="upl" 
                    style={styles.uploadInput}
                    onChange={(e)=>{
                        if(e.currentTarget.files && e.currentTarget.files[0]){
                            let file=e.currentTarget.files[0];
                            let upload=FichiersOP.insert({
                                file:file,
                                fileName:'operations.xls',
                                streams:'dynamic',
                                chunkSize:'dynamic'
                            },false);
                            
                            upload.on('start',()=>{
                                this.setState({
                                    currentFile:this
                                });
                            });
                             upload.on('end',(error,fileObj)=>{
                                    if(error){
                                         this.setState({
                                             error:true,
                                            errorMsg:"Une erreur est survenue pendant le téléchargement. "+error
                                        });
                                        this._dialogOpen();
                                    }else{
                                        //on affiche pour dire aue c'est fini
                                         this.setState({
                                                    error:false,
                                                    errorMsg:`Le fichier a été téléchargé avec succès.`
                                                });
                                                this._dialogOpen();
                                       
                                        
                                    }
                                    this.setState({
                                        //currentFile:false,
                                        error:false
                                    });
                                });

                                upload.start();
                                upload.on('progress',(prog,file)=>{
                                     this.setState({
                                        progress:prog
                                    });
                                });
                        }
                    }}/>
                    <div className="uploadDiv">
                        <div style={{height:'10px'}}></div>
                            <div>
                                <RaisedButton 
                                    label="Choisir un fichier" 
                                    labelColor="white"
                                    backgroundColor="#cd9a2e"  
                                    disabled={this.state.currentFile?true:false}
                                    onClick={()=>{
                                        $('.upl').click();
                                    }}  
                                />
                            </div>
                            <div style={{height:'10px'}}></div>
                            <div style={{height:'10px'}}></div>
                            <div>
                                {this.state.currentFile&&this.state.progress<=99?(<CircularProgress size={60} thickness={7}/>):this.state.progress!==100?(<span>Le fichier doit être au format xls et ne doit pas exéder 10MB</span>):null}
                                {this.state.progress===100?(<span style={{color:'green',textAlign:'center'}}>Fichier Téléchargé<br/>Veuillez patienter pendant le découpage<marquee>...</marquee></span>):null}
                            </div>
                        
                    </div>
                </form>
            </div>
        );
    }

}
FileUpload=reduxForm({
    form:'fileup',
})(FileUpload);

const mapDispatchToProps=(dispatch)=>{
    return{
        dispatch
    };
}
FileUpload=connect(mapDispatchToProps)(FileUpload);
//decorate with connect to read form values



export default FileUpload;

