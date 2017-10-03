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
import FullWalletBackups from '../components/FullWalletBackups.jsx';
import {InventaireBackup} from '../../api/collections.js';
import {arrAreSame,transformInFrenchDate,groupByLibel,groupSumBySymbole,convertInDateObjFromFrenchDate} from '../../utils/utils.js';
import {moment} from 'meteor/momentjs:moment';
import { createContainer } from 'meteor/react-meteor-data';
import {Meteor} from 'meteor/meteor';



let DateTimeFormat;
if(areIntlLocalesSupported(['fr'])){
    DateTimeFormat=global.Intl.DateTimeFormat;
}

class WalletBackups extends Component {
    constructor(){
        super();
        this.state={
            moment:null

        }

    }

    componentDidMount(){
        $('.toolbarTitle').delay(18000).show().addClass("fadeInRight animated");
        let invB=typeof this.props.inventaireBack!="undefined"?groupSumBySymbole(this.props.inventaireBack,['moment'],['Quantite']):[];
        this.setState({moment:typeof invB[0]!="undefined"?invB[0].moment.toString():null});        
    }

    _orderTable(){
            this.setState({
                orderDesc:!orderDesc
            });
     }

    render(){
        let invB=typeof this.props.inventaireBack!="undefined"?groupSumBySymbole(this.props.inventaireBack,['moment'],['Quantite']):[];
        console.dir(invB);
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
                            <ToolbarTitle text="Sauvegarde de l'inventaire des valeurs mobilières" className="toolbarTitle"/>
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
                                     <Field
                                        name="momentum" 
                                        component={SelectField}
                                        floatingLabelText="Sauvegarde du "
                                        floatingLabelFixed={true}
                                        onChange={(e,i,v)=>{
                                            //alert(this.props.momentum);
                                            this.setState({moment:v})
                                        }}
                                        //validate={[required]}
                                        value={this.state.moment}
                                    >
                                        {
                                        invB.map((e,i)=>{
                                            return(<MenuItem value={e.moment} key={i} primaryText={moment(e.moment).format("LLLL:ss")}/>);
                                        }) 
                                        }   
                                    </Field>
                            </div>
                        </form>
                        <Divider/>
                    <FullWalletBackups 
                        type="ALL"
                        moment={this.props.momentum}
                        search={this.props.search}
                        />
                     
                </div>
            </div>
        );
    }
}

WalletBackups=reduxForm({
    form:'searchWalletBackups',
   //fields:['nom','prenom','username','password','passwordconf','codeRedac']
})(WalletBackups);

const selector = formValueSelector('searchWalletBackups');

WalletBackups=connect(
    state => {
    // or together as a group
    const search  = selector(state, 'search');
    const momentum  = selector(state, 'momentum');
    return {
      search,
      momentum
    }
  }
)(WalletBackups);
WalletBackups= createContainer(()=>{
        const invhandle=Meteor.subscribe('inventaireTitreBack');
        const loading=!invhandle.ready();
        const invone=InventaireBackup.findOne({type:"ACTIONS"});
        const invExist=!loading && !!invone;
        return{
            inventaireBack:invExist? InventaireBackup.find({},{sort:{DateAcquisition:1}}).fetch():[],
        };
        },WalletBackups);


export default WalletBackups;

const style={
    homeicon:{
        width: 40,
        height: 40
    },
    toolbar:{
        backgroundColor:'white',
    }
};