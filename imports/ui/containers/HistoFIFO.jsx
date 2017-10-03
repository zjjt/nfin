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
import HistoireFIFO from '../components/HistoireFIFO.jsx';
import {moment} from 'meteor/momentjs:moment';
import { createContainer } from 'meteor/react-meteor-data';
import {Inventaire} from '../../api/collections';
import {arrAreSame,transformInFrenchDate,groupByLibel,groupSumBySymbole,formatNumberInMoney,convertInDateObjFromFrenchDate} from '../../utils/utils.js';
import {Meteor} from 'meteor/meteor';



let DateTimeFormat;
if(areIntlLocalesSupported(['fr'])){
    DateTimeFormat=global.Intl.DateTimeFormat;
}

class HistoFIFO extends Component {
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
        const inventaire=groupSumBySymbole(Inventaire.find().fetch(),['Symbole'],['Quantite']);
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
                            <ToolbarTitle text="Historique de gestion des stock des valeurs" className="toolbarTitle"/>
                        </ToolbarGroup>
                    </Toolbar>
                    <Divider/>
                    <form >
                        <div className="topaligned">
                                
                                    
                                     <Field
                                        name="type" 
                                        component={SelectField}
                                        floatingLabelText="Type de valeur mobilière"
                                        hintText="Valeur mobilière"
                                        floatingLabelFixed={true}
                                        //validate={[required]}
                                        value={this.props.type}
                                    >
                                        <MenuItem value="ACTIONS" primaryText="ACTIONS"/>    
                                    </Field>
                                    <Field
                                        name="valeur" 
                                        component={SelectField}
                                        floatingLabelText="Valeur mobilière dans l'inventaire"
                                        floatingLabelFixed={true}
                                        //validate={[required]}
                                        value={this.props.valeur}
                                    >
                                        <MenuItem value="" primaryText="TOUTES LES OPERATIONS"/>
                                        {
                                        inventaire.map((e,i)=>{
                                            return(<MenuItem value={e.Symbole} key={i} primaryText={e.Valeur}/>);
                                        }) 
                                        }   
                                    </Field>
                                    <Field
                                        name="typeop" 
                                        component={SelectField}
                                        floatingLabelText="Filtrer par "
                                        hintText="Transaction financière"
                                        floatingLabelFixed={true}
                                        //validate={[required]}
                                        value={this.props.typeop}
                                    >
                                          <MenuItem value="TOUT"  primaryText="TOUTES LES OPERATIONS"/>
                                          <MenuItem value="VENTE+"  primaryText="VENTES AVEC PLUS VALUE"/>
                                          <MenuItem value="VENTE-"  primaryText="VENTES AVEC MOINS VALUE"/>
                                          <MenuItem value="ACHAT"  primaryText="ACHAT"/>
                                    </Field>
                            </div>
                        </form>
                        <Divider/>
                    <HistoireFIFO 
                        type="ALL"
                        typeop={!this.props.typeop?"TOUT":this.props.typeop}
                        symbole={this.props.valeur?this.props.valeur:""}
                        />
                     
                </div>
            </div>
        );
    }
}

HistoFIFO=reduxForm({
    form:'searchHistoFIFO',
   //fields:['nom','prenom','username','password','passwordconf','codeRedac']
})(HistoFIFO);

const selector = formValueSelector('searchHistoFIFO');

HistoFIFO=connect(
    state => {
    // or together as a group
    const type  = selector(state, 'type');
    const valeur=selector(state, 'valeur');
    const typeop=selector(state, 'typeop');
   
    return {
      type,
      valeur,
      typeop
    }
  }
)(HistoFIFO);



export default HistoFIFO;

const style={
    homeicon:{
        width: 40,
        height: 40
    },
    toolbar:{
        backgroundColor:'white',
    }
};