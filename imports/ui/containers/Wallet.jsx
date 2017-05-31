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
import Divider from 'material-ui/Divider';
import {Tabs, Tab} from 'material-ui/Tabs';
import FontIcon from 'material-ui/FontIcon';
import FullWallet from '../components/FullWallet.jsx';
import {moment} from 'meteor/momentjs:moment';
import { createContainer } from 'meteor/react-meteor-data';
import {Meteor} from 'meteor/meteor';



let DateTimeFormat;
if(areIntlLocalesSupported(['fr'])){
    DateTimeFormat=global.Intl.DateTimeFormat;
}

class Wallet extends Component {
    constructor(){
        super();
        this.state={
            

        }

    }

    componentDidMount(){
        $('.toolbarTitle').delay(18000).show().addClass("fadeInRight animated");
    }

    _orderTable(){
            this.setState({
                orderDesc:!orderDesc
            });
     }

    render(){
        console.dir(this.props);
        return(
            <div className="centeredContentSingle">
                <div className="contentWrapper fadeInUp animated">
                    <Toolbar style={style.toolbar}>
                        <ToolbarGroup>
                           <Home style={style.homeicon} 
                            color="#212f68" 
                            hoverColor="#cd9a2e" 
                            className="icono"
                            title="Aller a l'accueil"
                            onClick={()=>FlowRouter.go('dashboard')}
                            />
                        </ToolbarGroup>
                        <ToolbarGroup>
                            <ToolbarTitle text="Inventaire des valeurs mobilières" className="toolbarTitle"/>
                        </ToolbarGroup>
                    </Toolbar>
                    <Divider/>
                    <form >
                        <div className="topaligned">
                                
                                    <Field
                                    name="search" 
                                    component={TextField}
                                    hintText="Entrez le nom du titre recherché"
                                    floatingLabelFixed={true}
                                   
                                     />
                            </div>
                        </form>
                        <Divider/>
                    <FullWallet 
                        type="ALL"
                        search={this.props.search}
                        />
                     
                </div>
            </div>
        );
    }
}

Wallet=reduxForm({
    form:'searchWallet',
   //fields:['nom','prenom','username','password','passwordconf','codeRedac']
})(Wallet);

const selector = formValueSelector('searchWallet');

Wallet=connect(
    state => {
    // or together as a group
    const search  = selector(state, 'search');
   
    return {
      search,
    }
  }
)(Wallet);



export default Wallet;

const style={
    homeicon:{
        width: 40,
        height: 40
    },
    toolbar:{
        backgroundColor:'white',
    }
};