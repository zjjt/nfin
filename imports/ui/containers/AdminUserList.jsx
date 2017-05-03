import React,{PropTypes,Component} from 'react';
import {FlowRouter} from 'meteor/kadira:flow-router';
import {Toolbar,ToolbarSeparator,ToolbarTitle,ToolbarGroup} from 'material-ui/Toolbar';
import RaisedButton from 'material-ui/RaisedButton';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import { connect } from 'react-redux';
import {Field,reduxForm,formValueSelector} from 'redux-form';
import {TextField} from 'redux-form-material-ui';
import Home from 'material-ui/svg-icons/action/home';
import Divider from 'material-ui/Divider';
import {Tabs, Tab} from 'material-ui/Tabs';
import FontIcon from 'material-ui/FontIcon';
import UserTable from '../components/UserTable.jsx';
import {deluser} from '../../redux/actions/admin-actions.js';



class AdminUserList extends Component {
    constructor(){
        super();
        this.state={
            orderDesc:false,
            suppr:false,
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
                            onClick={()=>FlowRouter.go('adminDashboard')}
                            />
                        </ToolbarGroup>
                        <ToolbarGroup>
                            <ToolbarTitle text="Liste des utilisateurs" className="toolbarTitle"/>
                        </ToolbarGroup>
                    </Toolbar>
                    <Divider/>
                    <div className="formDiv" style={{width:'100%'}}>
                        <form onSubmit={()=>{}}>
                            <Field
                                name="searchField" 
                                component={TextField}
                                hintText="rechercher par nom "
                            />
                        </form>
                    </div>
                    <Divider/>
                    <UserTable nom={this.props.nom} orderDesc={this.state.orderDesc} suppr={this.props.deluser} usercodes={this.props.usercodes}/>
                     <Tabs className="optionTabs">
                        <Tab
                        icon={<FontIcon className="material-icons">cached</FontIcon>}
                        label="ordonne la liste par ordre alphabétique"
                        onClick={()=>this.setState({orderDesc:!this.state.orderDesc})}
                        />
                        <Tab
                        icon={<FontIcon className="material-icons">delete</FontIcon>}
                        label="supprime le ou les utilisateurs sélectionnés"
                        onClick={()=>this.props.dispatch(deluser())}
                    
                        />
                    </Tabs>
                </div>
            </div>
        );
    }
}

AdminUserList=reduxForm({
    form:'searchAdmin',
})(AdminUserList);

const selector = formValueSelector('searchAdmin');

AdminUserList = connect(
  state => {
    // or together as a group
    const  searchField = selector(state, 'searchField')
    const nom=searchField;
    const deluser=state.administrateurAction.deluser;
    const usercodes=state.administrateurAction.usercodes;
    return {
      nom,
      deluser,
      usercodes
    }
  }
)(AdminUserList)

export default AdminUserList;

const style={
    homeicon:{
        width: 40,
        height: 40
    },
    toolbar:{
        backgroundColor:'white',
    }
};