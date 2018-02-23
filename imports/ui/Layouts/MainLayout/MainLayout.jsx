import React,{PropTypes,Component} from 'react';
import store from '../../../redux/store';
import {client} from '../../../redux/rootReducer.js';
import {ApolloProvider} from 'react-apollo';
import {FlowRouter} from 'meteor/kadira:flow-router';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import AppBar from 'material-ui/AppBar';
import IconButton from 'material-ui/IconButton';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import FlatButton from 'material-ui/FlatButton';
import Drawer from 'material-ui/Drawer';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import {connect} from 'react-redux';
import {blue900} from 'material-ui/styles/colors';
import {Meteor} from 'meteor/meteor';
import Divider from 'material-ui/MenuItem';
import {deconnection} from '../../../redux/actions/admin-actions.js';
import { createContainer } from 'meteor/react-meteor-data';
import Logged from './Logged.jsx';


//pour desactiver METEOR_OFFLINE_CATALOG=1 meteor
const muiTheme= getMuiTheme({
	appBar:{
		backgroundColor: blue900
	}
});

class Bienvenue extends Component{
	//static muiName='FlatButton';
	constructor(){
		super();
		
	}
	render(){
		return(
			<FlatButton {...this.props} 
				label="Bienvenue"  
				style={{
					color:'white',
					marginTop:'5%'
				}} />
		);
	}
}



//Logged.muiName='IconMenu';

export default class MainLayout extends Component{
	constructor(){
		super();
		this.state={
			loggedIn:false,
			drawerOpen:false
		};
	}
	componentWillMount() {
		

	}

	handleToggle(){
		this.setState({
			drawerOpen:!this.state.drawerOpen
		});
		
	}
	handleClose(){
		this.setState({drawerOpen:false});
	}

	componentDidUpdate(){
		if((store.getState().administrateurAction.adminConnected||Meteor.user()) && !this.state.loggedIn)
		{
			this.setState({
				loggedIn:true
			});
		}
	}
	componentDidMount(){
		
		if(Meteor.user()){
			this.setState({
				loggedIn:false
			});
		}
	}
	render(){
		
		const {content}=this.props;
		//{content()}
			
			return(
			<ApolloProvider store={store} client={client}>
				<MuiThemeProvider muiTheme={muiTheme}>
					<div className="masterContainer">
						<header>
						<AppBar
							title="Gestion du portefeuille des titres NSIA VIE ASSURANCES"
							style={{backgroundColor:'#cd9a2e' }}
							onTitleTouchTap={()=>{FlowRouter.current().route.name=="report"?null:FlowRouter.go('home')}}
							iconStyleLeft={!Meteor.user()||FlowRouter.current().route.name=="report"?{display:'none'}:{}}
							onLeftIconButtonTouchTap={()=>this.handleToggle()}
							iconElementRight={store.getState().administrateurAction.adminConnected||Meteor.user()?<Logged/>:<Bienvenue/>}
						/>
						<Drawer
							docked={false}
							width={350}
							open={this.state.drawerOpen}
							onRequestChange={(drawerOpen)=>this.setState({drawerOpen})}
						>
							<MenuItem style={{color:'white',backgroundColor:'#1f2d67'}} 
								onTouchTap={()=>{
									FlowRouter.go('dashboard');
									this.handleClose();
								}}>Gestion du portefeuille</MenuItem>
							
							<MenuItem onTouchTap={()=>{FlowRouter.go('wallet');
							this.handleClose();}}>Inventaire total</MenuItem>
							<MenuItem onTouchTap={()=>{FlowRouter.go('insertwallet');
							this.handleClose();}}>Intégrer un fichier inventaire</MenuItem>
							<MenuItem onTouchTap={()=>{FlowRouter.go('insertValeur');
							this.handleClose();}}>Insérer un titre financier</MenuItem>
							<hr/>
							<MenuItem 
								onTouchTap={()=>{
									FlowRouter.go('upload');
									this.handleClose();
								}}>Intégrer un fichier relevé</MenuItem>
							<hr/>
							<MenuItem onTouchTap={()=>{FlowRouter.go('histodashboard');
							this.handleClose();}}>Historique des opérations et de l'inventaire</MenuItem>
							<MenuItem style={{color:'white',backgroundColor:'#1f2d67'}}>Administration</MenuItem>
							<MenuItem onTouchTap={()=>{FlowRouter.go('fracform');
							this.handleClose();}}>Edition des taux de fractionnement</MenuItem>
							<MenuItem onTouchTap={()=>{FlowRouter.go('modcomptefin');
							this.handleClose();}}>Edition des comptes financiers</MenuItem>
							
							
						</Drawer>
						</header>
						<section className="generalSection">
						{content()}
						</section>
						<footer>
							NFINAPP v.0.1.0 &copy; Nsia Vie Assurances tous droits réservés. 
						</footer>
					</div>
				</MuiThemeProvider>	
			</ApolloProvider>
		);
	}
	

}

MainLayout.propTypes={
	content:PropTypes.func.isRequired
};


