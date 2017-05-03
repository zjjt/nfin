import React,{PropTypes,Component} from 'react';
import {TextField} from 'redux-form-material-ui';
import Divider from 'material-ui/Divider';
import {connect} from 'react-redux';
import {FlowRouter} from 'meteor/kadira:flow-router';
import RaisedButton from 'material-ui/RaisedButton';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import {connection} from '../../redux/actions/admin-actions.js'
import {Field,reduxForm,formValueSelector} from 'redux-form';
import store from '../../redux/store';
import {Meteor} from 'meteor/meteor';

//import {styles} from './LoginFormCSS.js';

 class AdminLoginForm extends Component{
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
        const {handleSubmit,pristine,submitting,dispatch}=this.props;
        console.dir(this.props);
        const submit=(values,dispatch)=>{
            if(values.admin===''||!values.admin){
                this.setState({
                    errorMsg:"Le champs nom d'administrateur ne peut être vide."
                });
                this._dialogOpen();
            }else if(values.password===''||!values.password){
                this.setState({
                    errorMsg:"Le champs mot de passe ne peut être vide."
                });
                this._dialogOpen();

            }
            else{
                Meteor.call("checkAdminUser",values.admin,values.password,(err,res)=>{
                    if(err){
                        this.setState({
                        errorMsg:"Mauvais identifiant administrateur ou mot de passe entré"
                    });
                    this._dialogOpen();
                    }
                    else{
                        console.log('tout est bon');
                        dispatch(connection());
                        FlowRouter.go('adminDashboard');
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
                >
                <span className="errorMsg">{this.state.errorMsg}</span>
                </Dialog>
                <form onSubmit={handleSubmit(submit)}>
                    <Field 
                        name="admin" 
                        component={TextField}
                        hintText="Entrez votre nom d'administrateur"
                        floatingLabelText="Nom d'administrateur"
                        fullWidth={true}
                        floatingLabelStyle={styles.floatingLabelStyle}
                        underlineFocusStyle={styles.underlineStyle}
                    />
                    <Field 
                        name="password" 
                        component={TextField}
                        hintText="Entrez votre mot de passe"
                        floatingLabelText="Mot de passe"
                        type="password"
                        fullWidth={true}
                        floatingLabelStyle={styles.floatingLabelStyle}
                        underlineFocusStyle={styles.underlineStyle}
                    />
                    
                    <div className="loginBtnDiv">
                        <RaisedButton
                            label="Se connecter" 
                            labelColor="white"
                            backgroundColor="gray"
                            type="submit"
                        />
                    </div>
                </form>
            </div>
        );
    }

}
AdminLoginForm=reduxForm({
    form:'adminlogin',
    fields:['admin','password']
})(AdminLoginForm);


export default AdminLoginForm;

const styles={
    floatingLabelStyle:{
        color:'gray'
    },
    underlineStyle:{
        borderColor:'gray'
    }
}

