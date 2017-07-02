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
import ModComptesFinForm from '../components/ModComptesFinForm.jsx';
import AddComptesFinForm from '../components/AddComptesFinForm.jsx';
import {moment} from 'meteor/momentjs:moment';
import { createContainer } from 'meteor/react-meteor-data';
import AppBar from 'material-ui/AppBar';
import {Meteor} from 'meteor/meteor';



let DateTimeFormat;
if(areIntlLocalesSupported(['fr'])){
    DateTimeFormat=global.Intl.DateTimeFormat;
}

class ComptesFin extends Component {
    constructor(){
        super();
        this.state={};
    }
    render(){
        const{modifyOrAdd}=this.props;
        return(<div className="centeredContent">
                <div className="fracDiv zoomIn animated">
                    <AppBar
                        title="Modification des comptes financiers"
                        style={{backgroundColor: '#212f68'}}
                        iconClassNameLeft="none"
                        titleStyle={{
                            textAlign:'center'
                        }}
                    />
                    <ModComptesFinForm/>
                    
                    
                </div>
           </div>)
    }
}

/*ComptesFin=connect(
    (state,dispatch )=> {

    return {
     modifyOrAdd:state.comptesfin.shouldMod,
      dispatch
    }
  }
)(ComptesFin);*/
export default ComptesFin;