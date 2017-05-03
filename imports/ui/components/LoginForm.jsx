import React,{PropTypes,Component} from 'react';
import {TextField} from 'redux-form-material-ui';
import Divider from 'material-ui/Divider';
import {connect} from 'react-redux';
import RaisedButton from 'material-ui/RaisedButton';
import {FlowRouter} from 'meteor/kadira:flow-router';
import {Field,reduxForm,formValueSelector} from 'redux-form';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import {Meteor} from 'meteor/meteor'

 class LoginForm extends Component{
    constructor(){
        super();
        this.state={
            dialogIsOpen:false,
            errorMsg:''
        }
    }

   _dialogOpen(){
       this.setState({dialogIsOpen: true});
   }
   _dialogClose(){
       this.setState({dialogIsOpen: false});
   }
    render(){
        const dialogActions = [
        <FlatButton
            label="OK"
            primary={true}
            onTouchTap={this._dialogClose.bind(this)}
        />,
        ];
        const {handleSubmit,pristine,submitting}=this.props;
        //console.log(this.state.champsRemplis)
        const submit=(values,dispatch)=>{
            if(values.username===''||!values.username){
                this.setState({
                    errorMsg:"Le champs nom d'utilisateur ne peut être vide."
                });
                this._dialogOpen();
            }else if(values.password===''||!values.password){
                this.setState({
                    errorMsg:"Le champs mot de passe ne peut être vide."
                });
                this._dialogOpen();
            }else{
                    Meteor.loginWithPassword(values.username,values.password,(err)=>{
                        if(err){
                                let errmsg=err.reason=="User not found"?"Cet utilisateur n'existe pas.Veuillez contacter l'administrateur":null;
                            this.setState({
                                errorMsg:"Un problême de connection est survenu. "+errmsg
                            });      
                            this._dialogOpen();     
                        }else{
                            FlowRouter.go('dashboard');
                        }
                    });
            }
        };
        return(
            <div className="loginformCont1">
                <Dialog
                actions={dialogActions}
                modal={false}
                open={this.state.dialogIsOpen}
                onRequestClose={this._dialogClose}
                style={{color:'red'}}
                autoDetectWindowHeight={true}
                >
                <span className="errorMsg">{this.state.errorMsg}</span>
                </Dialog>
                <form onSubmit={handleSubmit(submit)}>
                    <Field 
                        name="username" 
                        component={TextField}
                        hintText="Entrez votre nom d'utilisateur"
                        floatingLabelText="Nom d'utilisateur"
                        fullWidth={true}
                        
                    />
                    <Field 
                        name="password" 
                        component={TextField}
                        hintText="Entrez votre mot de passe"
                        floatingLabelText="Mot de passe"
                        type="password"
                        fullWidth={true}
                    />
                    
                    <div className="loginBtnDiv">
                        <RaisedButton 
                            label="Se connecter" 
                            labelColor="white"
                            backgroundColor="#cd9a2e"
                            type="submit"
                        />
                    </div>
                </form>
            </div>
        );
    }

}
LoginForm=reduxForm({
    form:'userlogin',
    fields:['username','password']
})(LoginForm);

//decorate with connect to read form values



export default LoginForm;

