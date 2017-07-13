import React,{PropTypes,Component} from 'react';
import {FlowRouter} from 'meteor/kadira:flow-router';
import {Toolbar,ToolbarSeparator,ToolbarTitle,ToolbarGroup} from 'material-ui/Toolbar';
import RaisedButton from 'material-ui/RaisedButton';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import { connect } from 'react-redux';
import {Field,reduxForm,formValueSelector} from 'redux-form';
import {TextField,DatePicker,SelectField} from 'redux-form-material-ui';
import areIntlLocalesSupported from 'intl-locales-supported';
import MenuItem from 'material-ui/MenuItem';
import Home from 'material-ui/svg-icons/action/home';
import ActionAspectRatio from 'material-ui/svg-icons/action/aspect-ratio';
import Divider from 'material-ui/Divider';
import {Tabs, Tab} from 'material-ui/Tabs';
import FontIcon from 'material-ui/FontIcon';
import AfterComptaTable from '../components/AfterComptaTable.jsx';
import AfterComptaTableZoom from '../components/AfterComptaTableZoom.jsx';
import AfterComptaInvZoom from '../components/AfterComptaInvZoom.jsx';
import AfterComptaInv from '../components/AfterComptaInv.jsx';
import {moment} from 'meteor/momentjs:moment';
import {shouldExtractAgresso,toutEstValid} from '../../redux/actions/user-actions.js';
import { createContainer } from 'meteor/react-meteor-data';
import {groupByLibel} from '../../utils/utils.js'
import AppBar from 'material-ui/AppBar';
import {Meteor} from 'meteor/meteor';
let json2xls=require("json2xls");
//let Excel=require('exceljs');


let DateTimeFormat;
if(areIntlLocalesSupported(['fr'])){
    DateTimeFormat=global.Intl.DateTimeFormat;
}

class AfterCompta extends Component {
    constructor(){
        super();
        this.state={
           dialogTIsOpen:false,
           dialogIsOpen:false,
           dmessage:"Vous vous appretez à quitter la page de comptabilisation. En êtes vous sur ?",
           dtitle:"Quitter la page ?",
           alreadyOp:false ,
           agrandir:'',

        }

    }

    componentDidMount(){
        //On empeche l'utilisateur de fuir
        
        
        $('.toolbarTitle').delay(18000).show().addClass("fadeInRight animated");
        $('.animAppBar1').addClass("animated fadeInLeft");
        $('.animAppBar2').addClass("animated fadeInRight");
        $('.window').resizable();
        $('.animAppBar1').hover(()=>{
            let pw=$('.animAppBar1').parent('.window');
            if(!$('.window:first').hasClass('lit')){
                $('.window:first').addClass('lit');
            }
        },()=>{
            let pw=$('.animAppBar1').parent('.window');
            if($('.window:first').hasClass('lit')){
                $('.window:first').removeClass('lit');
            }
        });
        //===============
         $('.animAppBar2').hover(()=>{
            let pw=$('.animAppBar2').parent('.window');
            if(!$('.window:last').hasClass('lit')){
                $('.window:last').addClass('lit');
            }
        },()=>{
            let pw=$('.animAppBar2').parent('.window');
            if($('.window:last').hasClass('lit')){
                $('.window:last').removeClass('lit');
            }
        });
    }

    componentDidUpdate(){
        const{toutEstValide,shouldExtract,dispatch}=this.props;
        //alert("toutEstValide"+toutEstValide+"shouldExtract "+shouldExtract);
        if(toutEstValide&&!shouldExtract){

        this._afficherConfirmation(dispatch);
       }
    }
    _orderTable(){
            this.setState({
                orderDesc:!orderDesc
            });
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
    _afficherConfirmation(dispatch){
        this.setState({
            dtitle:"Validez vous les résultats ?",
            dmessage:"La comptabilisation, la génération d'un fichier excel compatible avec le logiciel AGRESSO, ainsi que la mise à jour de l'inventaire et du FIFO seront répercutés dans la base de données.\nEtes vous d'accord ?"
        });
        this._dialogOpen();
        dispatch(toutEstValid());
    }

    render(){
      
       const {opCompta,isFull,fifoSnap,filtreInv,releve,toutEstValide}=this.props;
       
        const resiser1=(<ActionAspectRatio style={style.agrandicon} 
                            color="#ffffff" 
                            hoverColor="#cd9a2e" 
                            className="icono"
                            title="Agrandir la vue"
                            onClick={()=>{
                                if(this.state.agrandir!=="comptabilisation")
                                this.setState({agrandir:"comptabilisation"});
                                this._dialogTOpen();
                            }}
                            />);
        const resiser2=(<ActionAspectRatio style={style.agrandicon} 
                            color="#ffffff" 
                            hoverColor="#cd9a2e" 
                            className="icono"
                            title="Agrandir la vue"
                            onClick={()=>{
                                if(this.state.agrandir!=="inventaire")
                                this.setState({agrandir:"inventaire"});
                                this._dialogTOpen();
                            }}
                            />);
         const dialogActions = [
                <FlatButton
                    label="FERMER"
                    primary={true}
                    onTouchTap={this._dialogClose.bind(this)}
                />,
                <FlatButton
                    label="OK"
                    primary={true}
                    onTouchTap={()=>{
                       if(this.state.dtitle==="Quitter la page ?"){
                           //on efface l'inventaire actuel et on le remplace par le snap dans redux
                                Meteor.call('dropInventory',(err,res)=>{
                                    Meteor.call('chargeInvWithSnap',fifoSnap,()=>{
                                    });
                                });
                                FlowRouter.go('dashboard');
                       }else if(this.state.dtitle==="Validez vous les résultats ?"){
                           this._dialogClose();
                           const{fifoSnap,releve}=this.props;
                             Meteor.call("saveChanges",fifoSnap,releve,(res)=>{
                                 
                                 if(res){
                                     console.dir(res);
                                    alert("Sauvegarde effectuée...\n Un fichier excel contenant une sauvegarde de l'inventaire à la date du "+moment(res.date).format("DD/MM/YYYY")+" sera téléchargé automatiquement...");
                                    const blob=new Blob([res.blob],{
                                        type:'application/octet-stream'
                                    });
                                    const a=window.document.createElement('a');
                                    a.href=window.URL.createObjectURL(blob,{
                                        type:'data:attachment/xlsx'
                                    });
                                    a.download="INVENTAIRE_"+moment(res.date).format("DD/MM/YYYY")+".csv";
                                    document.body.appendChild(a);
                                    a.click();
                                    document.body.removeChild(a);
                                 }else{
                                     alert("Sauvegarde effectuée...");
                                 }
                             });
                             Meteor.call("exportToExcelAgresso",this.props.opCompta,(err,res)=>{
                                if(res){
                                    alert("Votre fichier sera téléchargé automatiquement...");
                                    console.dir(res);
                                    const blob=new Blob([res],{
                                        type:'application/octet-stream'
                                    });
                                    const a=window.document.createElement('a');
                                    a.href=window.URL.createObjectURL(blob,{
                                        type:'data:attachment/xlsx'
                                    });
                                    a.download="AGRESSO_COMPTA_"+moment(new Date()).format("DD/MM/YYYY")+".xlsx";
                                    document.body.appendChild(a);
                                    a.click();
                                    document.body.removeChild(a);
                                    FlowRouter.go("dashboard");
                                }
                            }); 
                       }
                        
                    }}
                />,
               
                ];
        const dialogTActions = [
                <FlatButton
                    label="Fermer"
                    primary={true}
                    onTouchTap={()=>{this._dialogTClose();}}
                />,
                ];
        return(
            <div className="centeredContentSingle">
                    <Dialog
                    title={this.state.dtitle}
                    actions={dialogActions}
                    modal={false}
                    open={this.state.dialogIsOpen}
                    onRequestClose={this._dialogClose}
                    >
                        {this.state.dmessage}
                    </Dialog>
                    <Dialog
                            title={this.state.agrandir==="comptabilisation"?"Journal de comptabilisation":this.state.agrandir==="inventaire"?"Inventaire après comptabilisation":null}
                            actions={dialogTActions}
                            modal={false}
                            open={this.state.dialogTIsOpen}
                            onRequestClose={this._dialogTClose}
                            titleStyle={{backgroundColor:'#1f2d67',color:'white'}}
                            contentStyle={{width:'90%',maxWidth:'none'}}
                            autoScrollBodyContent={true}
                            autoDetectWindowHeight={true}
                            >
                            {this.state.agrandir==="comptabilisation"?(<AfterComptaTableZoom opCompta={opCompta} isFull={isFull} type={filtreInv}/>):this.state.agrandir==="inventaire"?(<AfterComptaInvZoom fifoSnap={fifoSnap?fifoSnap:null} type="ALL" search=""/>):null}
                    </Dialog>
                <div className="contentWrapper fadeInUp animated">
                    <Toolbar style={style.toolbar}>
                        <ToolbarGroup>
                           <Home style={style.homeicon} 
                            color="#212f68" 
                            hoverColor="#cd9a2e" 
                            className="icono"
                            title="Aller a l'accueil"
                            onClick={()=>{
                                this.setState({
                                    dtitle:"Quitter la page ?",
                                    dmessage:"Vous vous appretez à quitter la page de comptabilisation. En êtes vous sur ?"
                                });
                                
                                this._dialogOpen();
                            }}
                            />
                        </ToolbarGroup>
                        <ToolbarGroup>
                            <ToolbarTitle text="Rapport de comptabilisation" className="toolbarTitle"/>
                        </ToolbarGroup>
                    </Toolbar>
                    <Divider/>
                    <form >
                        <div className="topaligned">
                            
                         </div>
                        </form>
                        <Divider/>
                        <div className="twoWindows">
                            <div className="window">
                                <AppBar
                                    title="Journal de comptabilisation"
                                    style={{backgroundColor: '#212f68'}}
                                    iconClassNameLeft="none"
                                    iconElementRight={resiser1}
                                    className="animAppBar1"
                                    titleStyle={{
                                        textAlign:'center'
                                    }}
                                />
                                <AfterComptaTable opCompta={opCompta} isFull={isFull} />
                            </div>
                            <div className="VerticalSeparator"></div>
                            <div className="window">
                                <AppBar
                                    title="Inventaire après comptabilisation"
                                    style={{backgroundColor: '#212f68'}}
                                    iconElementLeft={resiser2}
                                    className="animAppBar2"
                                    titleStyle={{
                                        textAlign:'center'
                                    }}
                                />
                                <AfterComptaInv fifoSnap={fifoSnap?fifoSnap:null} type="ALL" search=""/>
                            </div>
                            
                        </div>
                    
                    
                </div>
            </div>
        );
    }
}


AfterCompta=connect(
    (state,dispatch )=> {

    return {
     fifoSnap:state.inventaire.inventaireSnap,
      opCompta:state.releveDuJour.isFull?state.releveDuJour.resultatComptaFull:state.releveDuJour.resultatComptaSimple,
      isFull:state.releveDuJour.isFull,
      filtreInv:state.inventaire.filter,
      releve:state.releveDuJour.releverDuJour,
      toutEstValide:state.userActions.toutValide,
      shouldExtract:state.userActions.shouldExtractAGR,
      dispatch
    }
  }
)(AfterCompta);



export default AfterCompta;

const style={
    homeicon:{
        width: 40,
        height: 40
    },
    agrandicon:{
        width:35,
        height:35,
    },
    toolbar:{
        backgroundColor:'white',
    }
};