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

 class AddComptesFinForm extends Component{
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
            oldtype:"",
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
   componentDidUpdate(){
       const {dispatch,typeCompte}=this.props;
       if(typeCompte!==this.state.oldtype && this.state.comptactuel===""){
           let ol=ComptesFinanciers.find({type:typeCompte}).fetch();
           //alert(typeCompte);
           //alert(JSON.stringify(ol));
           if(ol!==undefined){
                this.setState({
                comptactuel:ol[0].compte,
                oldtype:typeCompte
            });
           }
           
       }
       /*if(this.state.decoupage.length>=1 && !this.state.alreadyOp){
            
            
       }  */  
         
   }

   render(){
       const {handleSubmit,pristine,submitting,dispatch,reset}=this.props;
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
               

                Meteor.call('addToComptesFin',values,(err,res)=>{
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
                    name="libelle" 
                    component={TextField}
                    hintText="Entrer le libéllé du compte"
                    floatingLabelText="libéllé du compte"
                    fullWidth={true}
                    
                    floatingLabelFixed={true}
                />
                <Field
                    name="compte" 
                    component={TextField}
                    hintText="Compte financier"
                    floatingLabelText="Compte financier"
                    fullWidth={true}
                    floatingLabelFixed={true}
                />
               

                <div className="inAppBtnDivMiddle" style={{}}>
                    <RaisedButton
                        label="Ajouter" 
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

 AddComptesFinForm=reduxForm({
    form:'modFin',
  //  fields:['nom','prenom','username','password','passwordconf','codeRedac','role']
})(AddComptesFinForm);

const selector = formValueSelector('modFin');

AddComptesFinForm = connect(
  state => {
    // or together as a group
    const { libelle, compte } = selector(state, 'libelle', 'compte');
    return {
      libelle,
      compte
    }
  }
)(AddComptesFinForm)

export default AddComptesFinForm;