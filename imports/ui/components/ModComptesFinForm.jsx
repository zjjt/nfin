import React,{PropTypes,Component} from 'react';
import {TextField,SelectField,DatePicker} from 'redux-form-material-ui';
import Divider from 'material-ui/Divider';
import CircularProgress from 'material-ui/CircularProgress';
import LinearProgress from 'material-ui/LinearProgress';
import {connect} from 'react-redux';
import RaisedButton from 'material-ui/RaisedButton';
import {FlowRouter} from 'meteor/kadira:flow-router';
import {Field,reduxForm,formValueSelector} from 'redux-form';
import Dialog from 'material-ui/Dialog';
import {moment} from 'meteor/momentjs:moment';
import {FilesCollection} from 'meteor/ostrio:files';
import FlatButton from 'material-ui/FlatButton';
import {Meteor} from 'meteor/meteor';
import MenuItem from 'material-ui/MenuItem';
import {ComptesFinanciers} from '../../api/collections';
import {Table, TableBody, TableFooter, TableHeader, TableHeaderColumn, TableRow, TableRowColumn} from 'material-ui/Table';
import areIntlLocalesSupported from 'intl-locales-supported';
import {arrAreSame,transformInFrenchDate,groupByLibel,groupSumBySymbole,formatNumberInMoney,convertInDateObjFromFrenchDate} from '../../utils/utils.js';

let DateTimeFormat;
if(areIntlLocalesSupported(['fr'])){
    DateTimeFormat=global.Intl.DateTimeFormat;
}
import {$} from 'meteor/jquery';

 class ModComptesFinForm extends Component{
    constructor(){
        super();
        this.state={
            dialogIsOpen:false,
            errorMsg:'',
            showLoader:false,
            error:false,
            alreadyOp:false,
            decoupage:[],
            currentFile:false,
            comptactuel:"",
            isCompteSet:false,
            typeCompte:"",
            showOld:false,
            showNew:true,
            showTable:false,
            progress:null,
           
        }
    }

   _dialogOpen(){
       this.setState({dialogIsOpen: true});
   }
   _dialogClose(){
       this.setState({dialogIsOpen: false});
   }
    _onRowSelection(rowsarr){
               
                
            }
   componentWillUpdate(){
       const {dispatch,typeCompte}=this.props;
       /*if(this.state.typeCompte && this.state.isCompteSet){
                let ol=ComptesFinanciers.find({type:this.state.typeCompte}).fetch();
           //alert(typeCompte);
           //alert(JSON.stringify(ol));
            if(ol){
                    this.setState({
                    comptactuel:ol[0].compte,
                    isCompteSet:false
                });
            }
           
           }
       /*if(this.state.decoupage.length>=1 && !this.state.alreadyOp){
            
            
       }  */  
         
   }
   
   render(){
        let handleSelectChange=(e,i,value)=>{
          this.setState({
                typeCompte:value,
                //isCompteSet:true
            });
            
   };
       const {handleSubmit,pristine,submitting,dispatch,reset,OldCompte}=this.props;
       //console.dir(OldCompte);
//alert(this.state.comptactuel);
       const submit=(values,dispatch)=>{
           
            if(values.typeCompte===''||!values.typeCompte){
                this.setState({
                    error:true,
                    errorMsg:"Veuillez à sélectionner un type de compte financier"
                });
                this._dialogOpen();
            }
            else if(values.Compte===''||!values.Compte){
               this.setState({
                   error:true,
                    errorMsg:"Veuillez fournir un nouveau compte financier"
                });
                this._dialogOpen(); 
            }else if(values.Compte!==''&& values.Compte==this.state.comptactuel){
               this.setState({
                   error:true,
                    errorMsg:"Veuillez fournir un compte financier différent de l'ancien "
                });
                this._dialogOpen(); 
            }else if(values.Compte.length>6){
               this.setState({
                   error:true,
                    errorMsg:"Veuillez fournir un compte financier valide "
                });
                this._dialogOpen(); 
            }else if(isNaN(values.Compte)){
               this.setState({
                   error:true,
                    errorMsg:"Veuillez fournir un compte financier valide "
                });
                this._dialogOpen(); 
            }              
            else{
               //alert(JSON.stringify(values));
               

                Meteor.call('updateComptesFin',values,(err,res)=>{
                    if(err){
                        this.setState({
                            error:true,
                            errorMsg:err.reason
                        });
                        this._dialogOpen();
                    }else if(res){
                        this.setState({
                            error:false,
                            errorMsg:"Modification effectuée"
                        });
                        this._dialogOpen();
                    }
                });
                
            }
        };

        const maxLength = max => value =>(value && value.length > max)||(value && value.length < max) ? `ce champs doit être de ${max} caractères` : undefined;
        const maxLength3=maxLength(3);
        const required = value => value ? undefined : 'Required';
        const comptedb=ComptesFinanciers.find({}).fetch();
        
         const dialogActions = [
                <FlatButton
                    label="OK"
                    primary={true}
                    onTouchTap={()=>{
                        
                        this._dialogClose();
                    }}
                />,
                ];
    return(
    <form  className="" style={{}} onSubmit={handleSubmit(submit)}>

    <Dialog
        actions={dialogActions}
        modal={false}
        open={this.state.dialogIsOpen}
        onRequestClose={this._dialogClose}
        style={{color:'red'}}
        autoDetectWindowHeight={true}
        >
        <span className={this.state.error?"errorMsg":"okMsg"}>{this.state.errorMsg}</span>
    </Dialog>
       <div className="innerFormDiv">          
                <Field
                    name="typeCompte" 
                    component={SelectField}
                    floatingLabelText="Choix du type de compte à modifier"
                    hintText="Compte financier"
                    floatingLabelFixed={true}
                    fullWidth={true}
                    //validate={[required]}
                    onChange={handleSelectChange}
                    value={this.state.typeCompte}
                >{
                   comptedb.map((e,i)=>{
                       return(<MenuItem value={e.type} key={i} primaryText={e.libelle}/>);
                   }) 
                }    
                </Field>
                 <Field
                    name="OldCompte" 
                    component={TextField}
                    hintText={!OldCompte?"Compte actuel":OldCompte.compte}
                    floatingLabelText="Compte financier actuel"
                    fullWidth={true}
                    value={!OldCompte?"Compte actuel":OldCompte.compte}
                    disabled={true}
                    floatingLabelFixed={true}
                />
                <Field
                    name="Compte" 
                    component={TextField}
                    hintText="Nouveau compte financier"
                    floatingLabelText="Nouveau compte financier"
                    fullWidth={true}
                    
                    floatingLabelFixed={true}
                />
               

                <div className="inAppBtnDivMiddle" style={{}}>
                    <RaisedButton
                        label="Mettre à jour" 
                        labelColor="white"
                        backgroundColor="#cd9a2e"
                        className="inAppBtnForm"
                        type="submit"
                    />
                    
                </div>
               </div>
               </form>
    );
   }
 }

 ModComptesFinForm=reduxForm({
    form:'modFin',
  //  fields:['nom','prenom','username','password','passwordconf','codeRedac','role']
})(ModComptesFinForm);

const selector = formValueSelector('modFin');

ModComptesFinForm = connect(
  state => {
    // or together as a group
    const { typeCompte, Compte,OldCompte } = selector(state, 'typeCompte', 'Compte','OldCompte');
    let oldone=ComptesFinanciers.findOne({type:typeCompte});
    return {
      typeCompte,
      OldCompte:oldone,
      Compte
    }
  }
)(ModComptesFinForm)

export default ModComptesFinForm;