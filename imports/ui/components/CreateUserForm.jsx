import React,{PropTypes,Component} from 'react';
import {FlowRouter} from 'meteor/kadira:flow-router';
import {Toolbar,ToolbarSeparator,ToolbarTitle,ToolbarGroup} from 'material-ui/Toolbar';
import RaisedButton from 'material-ui/RaisedButton';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import { connect } from 'react-redux';
import {Field,reduxForm,formValueSelector} from 'redux-form';
import MenuItem from 'material-ui/MenuItem';
import {TextField,SelectField} from 'redux-form-material-ui';
import Home from 'material-ui/svg-icons/action/home';
import Divider from 'material-ui/Divider';
import Snackbar from 'material-ui/Snackbar';
import {Meteor} from 'meteor/meteor';
import {Random} from 'meteor/random';
import _ from 'lodash';



 class CreateUserForm extends Component{
    constructor(props){
        super(props);
        this.state={
            dialogIsOpen:false,
            errorMsg:'',
            snackOpen:false,
            snackMsg:'',
            
        };
    }
    _dialogOpen(){
        this.setState({dialogIsOpen: true});
    }

   _dialogClose(){
       this.setState({dialogIsOpen: false});
   }

   _snackClose(){
       this.setState({
           snackOpen:false
       });
   }

   componentDidUpdate(){
      
   }

    render(){
        const {handleSubmit,pristine,submitting,dispatch,REDAC,reset}=this.props;
        //console.log(REDAC);
        const dialogActions = [
        <FlatButton
            label="OK"
            primary={true}
            onTouchTap={this._dialogClose.bind(this)}
        />,
        ];
       
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
            else if(values.email===''||!values.email){
                this.setState({
                    errorMsg:"Le champs email ne peut être vide."
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
                Meteor.call('createNewUser',values,(err)=>{
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
                /*const retourServer=Meteor.call('createNewUser',values);
                if(retourServer.ok){
                   this.setState({
                        snackMsg:`L'utilisateur ${values.username} a été créé`,
                        snackOpen:true
                        });
                }else{
                    this.setState({
                    errorMsg:"Une erreur s'est produite lors de la creation de l'utilisateur."
                    });
                 this._dialogOpen();
                }*/
                
               // dispatch(connection());
                //FlowRouter.go('adminDashboard');
            }
        };

        const maxLength = max => value =>(value && value.length > max)||(value && value.length < max) ? `ce champs doit être de ${max} caractères` : undefined;
        const maxLength3=maxLength(3);
        const required = value => value ? undefined : 'Required';
        return(
            <div className="formDiv">
                <Dialog
                actions={dialogActions}
                modal={false}
                open={this.state.dialogIsOpen}
                onRequestClose={this._dialogClose}
                >
                    <span className="errorMsg">{this.state.errorMsg}</span>
                </Dialog>
                <Snackbar
                    open={this.state.snackOpen}
                    message={this.state.snackMsg}
                    autoHideDuration={5000}
                    onRequestClose={this._snackClose.bind(this)}
                />
               <form onSubmit={handleSubmit(submit)}>
                 <Field
                    name="nom" 
                    component={TextField}
                    hintText="Entrez le nom de famille du comptable"
                    floatingLabelText="Nom"
                    fullWidth={true}
                    floatingLabelFixed={true}
                />
                <Field
                    name="prenom" 
                    component={TextField}
                    hintText="Entrez les prénom de famille du comptable"
                    floatingLabelText="Prénoms"
                    fullWidth={true}
                    floatingLabelFixed={true}
                />
                <Field
                    name="username" 
                    component={TextField}
                    hintText="Entrez le username du comptable"
                    floatingLabelText="Nom d'utilisateur"
                    fullWidth={true}
                    floatingLabelFixed={true}
                />
                <Field
                    name="password" 
                    component={TextField}
                    hintText="Entrez le mot de passe du comptable"
                    floatingLabelText="Mot de passe"
                    fullWidth={true}
                    floatingLabelFixed={true}
                />
                <Field
                    name="passwordconf" 
                    component={TextField}
                    hintText="Confirmer le mot de passe du comptable"
                    floatingLabelText="Confirmation du mot de passe"
                    fullWidth={true}
                    floatingLabelFixed={true}
                />
                <Field
                    name="email" 
                    component={TextField}
                    hintText="Entrer l'email du gestionnaire"
                    floatingLabelText="Email"
                    fullWidth={true}
                    type="mail"
                    floatingLabelFixed={true}
                />
                 <Field
                    name="codeRedac" 
                    component={TextField}
                    hintText={this.props.REDAC?this.props.REDAC:"Entrez le code redacteur de l'utilisateur"}
                    floatingLabelText="Code redacteur"
                    fullWidth={true}
                    floatingLabelFixed={true}
                    validate={[ required ]}
                />
                <Field
                    name="role" 
                    component={SelectField}
                    floatingLabelText="Rôle de l'utilisateur"
                    hintText="Profile de l'utilisateur"
                    floatingLabelFixed={true}
                    //validate={[required]}
                    value={this.props.role}
                >
                    <MenuItem value="C" primaryText="CONSULTANT"/>
                    <MenuItem value="G" primaryText="GESTIONNAIRE"/>
                </Field>

                <div className="inAppBtnDiv">
                    <RaisedButton
                        label="Créer l'utilisateur" 
                        labelColor="white"
                        backgroundColor="gray"
                        className="inAppBtnForm"
                        type="submit"
                    />
                </div>
                
               </form>
            </div>
        );
    }
}
CreateUserForm=reduxForm({
    form:'createUser',
    fields:['nom','prenom','username','password','passwordconf','codeRedac','role']
})(CreateUserForm);

const selector = formValueSelector('createUser');

const formation2LastLetters=(prenom)=>{
        const arraystring=prenom.split(" ");
        let lastletter='';
        _.times(2,arraystring.forEach((prenoms)=>{
                lastletter+=prenoms.substring(0,1);
            })
        );
        if(lastletter.length>3){
            return lastletter.substring(0,4);
        }else{
            return lastletter;
        }  
    };

CreateUserForm = connect(
  state => {
    // or together as a group
    const { nom, prenom } = selector(state, 'nom', 'prenom')
    const f1stletter=nom?nom.substring(0,1):'';
    const lastletters=formation2LastLetters(prenom?prenom:'');
    const REDAC=f1stletter+lastletters;
    return {
      REDAC
    }
  }
)(CreateUserForm)

export default CreateUserForm;