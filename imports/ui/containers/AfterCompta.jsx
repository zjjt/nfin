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
import AfterComptaTable from '../components/AfterComptaTable.jsx';
import {moment} from 'meteor/momentjs:moment';
import { createContainer } from 'meteor/react-meteor-data';
import AppBar from 'material-ui/AppBar';
import {Meteor} from 'meteor/meteor';



let DateTimeFormat;
if(areIntlLocalesSupported(['fr'])){
    DateTimeFormat=global.Intl.DateTimeFormat;
}

class AfterCompta extends Component {
    constructor(){
        super();
        this.state={
            

        }

    }

    componentDidMount(){
        $('.toolbarTitle').delay(18000).show().addClass("fadeInRight animated");
        $('.animAppBar1').addClass("animated fadeInLeft");
        $('.animAppBar2').addClass("animated fadeInRight");
    }

    _orderTable(){
            this.setState({
                orderDesc:!orderDesc
            });
     }

    render(){
       const {opCompta,isFull}=this.props;
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
                                    className="animAppBar1"
                                    titleStyle={{
                                        textAlign:'center'
                                    }}
                                />
                                <AfterComptaTable opCompta={opCompta} isFull={isFull}/>
                            </div>
                            <div className="VerticalSeparator"></div>
                            <div className="window">
                                <AppBar
                                    title="Historique de comptabilisation"
                                    style={{backgroundColor: '#212f68'}}
                                    iconClassNameLeft="none"
                                    className="animAppBar2"
                                    titleStyle={{
                                        textAlign:'center'
                                    }}
                                />
                                
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
      opCompta:state.releveDuJour.isFull?state.releveDuJour.resultatComptaFull:state.releveDuJour.resultatComptaSimple,
      isFull:state.releveDuJour.isFull,
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
    toolbar:{
        backgroundColor:'white',
    }
};