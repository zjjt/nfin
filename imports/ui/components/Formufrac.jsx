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
import {FilesCollection} from 'meteor/ostrio:files';
import FlatButton from 'material-ui/FlatButton';
import {Meteor} from 'meteor/meteor';
import MenuItem from 'material-ui/MenuItem';
import {Inventaire} from '../../api/collections';
import areIntlLocalesSupported from 'intl-locales-supported';
import {groupSumBySymbole} from '../../utils/utils.js';

let DateTimeFormat;
if(areIntlLocalesSupported(['fr'])){
    DateTimeFormat=global.Intl.DateTimeFormat;
}
import {$} from 'meteor/jquery';

 class Formufrac extends Component{
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
       /*if(this.state.decoupage.length>=1 && !this.state.alreadyOp){
            
            
       }  */    
   }

   render(){
       const {handleSubmit,pristine,submitting,dispatch,reset}=this.props;
       const submit=(values,dispatch)=>{
            if(values.nom===''||!values.nom){
                this.setState({
                    errorMsg:"Le champs nom d'utilisateur ne peut être vide."
                });
                this._dialogOpen();
            }
            else if(values.prenom===''||!values.prenom){
                this.setState({
                    errorMsg:"Le champs prénoms de l'utilisateur ne peut être vide."
                });
                this._dialogOpen();
            }
             else if(values.username===''||!values.username){
                this.setState({
                    errorMsg:"Le champs username de l'utilisateur ne peut être vide."
                });
                this._dialogOpen();
            }
            else if(values.password===''||!values.password){
                this.setState({
                    errorMsg:"Le champs mot de passe ne peut être vide."
                });
                this._dialogOpen();
            }
            else if(values.passwordconf===''||!values.passwordconf){
                this.setState({
                    errorMsg:"Le champs confirmation du mot de passe ne peut être vide."
                });
                this._dialogOpen();
            }
            else if(values.password!==values.passwordconf){
                this.setState({
                    errorMsg:"Les champs mot de passe et confirmation du mot de passe ne correspondent pas."
                });
                this._dialogOpen();
            }
            else if(values.codeRedac===''||!values.codeRedac){
                this.setState({
                    errorMsg:"Le champs code redacteur ne peut être vide."
                });
                this._dialogOpen();
            }
            else if(values.role===''||!values.role){
                this.setState({
                    errorMsg:"Veuillez donner un rôle à cet utilisateur."
                });
                this._dialogOpen();
            }
            else{
               //alert(JSON.stringify(values));
                Meteor.call('updateFraction',values,(err)=>{
                    if(err){
                        this.setState({
                            errorMsg:"Une erreur s'est produite lors de la creation de l'utilisateur. "+err.reason+". Veuillez re vérifier, il se pourrait que le code rédacteur existe déja"
                            });
                        this._dialogOpen();
                    }else{
                        reset();
                        this.setState({
                        snackMsg:`L'utilisateur ${values.username} a été créé`,
                        snackOpen:true
                        });
                    }
                });
                
            }
        };

        const maxLength = max => value =>(value && value.length > max)||(value && value.length < max) ? `ce champs doit être de ${max} caractères` : undefined;
        const maxLength3=maxLength(3);
        const required = value => value ? undefined : 'Required';
        const inventaire=groupSumBySymbole(Inventaire.find().fetch(),['Symbole'],['Quantite']);

    return(<div className="fracDiv">
    <form onSubmit={handleSubmit(submit)}>
                 
                <Field
                    name="valeur" 
                    component={SelectField}
                    floatingLabelText="Valeur mobilière dans l'inventaire"
                    hintText="Valeur mobilière"
                    floatingLabelFixed={true}
                    //validate={[required]}
                    value={this.props.valeur}
                >{
                   inventaire.map((e)=>{
                       return(<MenuItem value={e.Symbole} primaryText={e.Valeur}/>);
                   }) 
                }    
                </Field>
                 <Field
                            name="date_debut_frac" 
                            DateTimeFormat={DateTimeFormat}
                            className="datepicker"
                            component={DatePicker}
                            hintText="Entrez la date de début de la période de fractionnement"
                            floatingLabelText="Date de début de la période de fractionnement"
                            fullWidth={true}
                            okLabel="OK"
                            cancelLabel="Annuler"
                            locale="fr"
                            format={(value,name)=>{
                                console.log('value being passed ',value);
                                console.log('is of type',typeof value);
                                return value===''?null:value;
                            }}
                            floatingLabelFixed={true}
                        />
                <Field
                            name="date_fin_frac" 
                            DateTimeFormat={DateTimeFormat}
                            className="datepicker"
                            component={DatePicker}
                            hintText="Entrez la date de fin de la période de fractionnement"
                            floatingLabelText="Date de fin de la période de fractionnement"
                            fullWidth={true}
                            okLabel="OK"
                            cancelLabel="Annuler"
                            locale="fr"
                            format={(value,name)=>{
                                console.log('value being passed ',value);
                                console.log('is of type',typeof value);
                                return value===''?null:value;
                            }}
                            floatingLabelFixed={true}
                        />

                <div className="inAppBtnDiv">
                    <RaisedButton
                        label="Ajouter le fractionnement" 
                        labelColor="white"
                        backgroundColor="gray"
                        className="inAppBtnForm"
                        type="submit"
                    />
                </div>
                
               </form>
    </div>);
   }
 }

 Formufrac=reduxForm({
    form:'addFract',
  //  fields:['nom','prenom','username','password','passwordconf','codeRedac','role']
})(Formufrac);

const selector = formValueSelector('addFract');

Formufrac = connect(
  state => {
    // or together as a group
    const { valeur, date_debut_frac,date_fin_frac } = selector(state, 'valeur', 'date_debut_frac','date_fin_frac')
    return {
      valeur,
      date_debut_frac,
      date_fin_frac
    }
  }
)(Formufrac)

export default Formufrac;