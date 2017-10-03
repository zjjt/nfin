import {FlowRouter} from 'meteor/kadira:flow-router';
import {Meteor} from 'meteor/meteor';
import {mount} from 'react-mounter';
import React from 'react';
import store from '../../redux/store.js'
import Uploader from '../../ui/containers/Uploader.jsx';
import InventUploader from '../../ui/containers/InventUploader.jsx';
import Dashboard from '../../ui/containers/Dashboard.jsx';
import DashboardHisto from '../../ui/containers/DashboardHisto.jsx';
import MainLayout from '../../ui/Layouts/MainLayout/MainLayout.jsx';
import Login from '../../ui/containers/Login.jsx';
import AdminLogin from '../../ui/containers/AdminLogin.jsx';
import AfterCompta from '../../ui/containers/AfterCompta.jsx';
import AdminDashboard from '../../ui/containers/AdminDashboard.jsx';
import CreateUser from '../../ui/containers/CreateUser.jsx';
import AdminUserList from '../../ui/containers/AdminUserList.jsx';
import FormuFractionnement from '../../ui/containers/FormuFractionnement.jsx'
import Wallet from '../../ui/containers/Wallet.jsx';
import HistoFIFO from '../../ui/containers/HistoFIFO.jsx';
import WalletBackups from '../../ui/containers/WalletBackups.jsx';
import ComptesFin from '../../ui/containers/ComptesFin.jsx';
import injectTapEventPlugin from 'react-tap-event-plugin';
import {FichiersInv,Inventaire,ComptesFinanciers,IsTraiting,InventaireBackup} from '../../api/collections.js';
import {Session} from 'meteor/session';

injectTapEventPlugin();
FlowRouter.route('/',{
	name:'home',
	triggersEnter:[(context,redirect)=>{
		if(Meteor.user()){
			redirect('/');
		}
	}],
	action(){
		mount(MainLayout,
			{content:()=><Login/>})
	}
});

FlowRouter.route('/dashboard',{
	name:'dashboard',
	triggersEnter:[(context,redirect)=>{
		if(!Meteor.user()){
			redirect('/');
		}
	}],
	action(){
		mount(MainLayout,
			{content:()=><Dashboard/>})
	}
});


FlowRouter.route('/dashboard/fractionnement/',{
	name:'fracform',
	triggersEnter:[(context,redirect)=>{
		let res=Inventaire.find().count();
		if(!res){
			if(!Meteor.user()){
					redirect('/');
				}else if(Meteor.user()){
					alert("Aucun inventaire détecté !!!");
					redirect('/dashboard/insert-wallet/');
				}
		}
	}],
	action(){
		mount(MainLayout,
			{content:()=><FormuFractionnement/>})
	}
});


FlowRouter.route('/dashboard/historique/',{
	name:'histodashboard',
	triggersEnter:[(context,redirect)=>{
		let res=Inventaire.find().count();
		if(!res){
			if(!Meteor.user()){
					redirect('/');
				}else if(Meteor.user()){
					alert("Aucun inventaire détecté !!!");
					redirect('/dashboard/insert-wallet/');
				}
		}
	}],
	action(){
		mount(MainLayout,
			{content:()=><DashboardHisto/>})
	}
});

FlowRouter.route('/dashboard/historique/sauvegarde-inventaire',{
	name:'histoInv',
	triggersEnter:[(context,redirect)=>{
		let res=InventaireBackup.find().count();
		if(!res){
			if(!Meteor.user()){
					redirect('/');
				}else if(Meteor.user()){
					alert("Aucune sauvegarde d'inventaire détecté !!!");
					redirect('/dashboard/historique');
				}
		}
	}],
	action(){
		mount(MainLayout,
			{content:()=><WalletBackups/>})
	}
});

FlowRouter.route('/dashboard/historique/FIFO/',{
	name:'histoFIFO',
	triggersEnter:[(context,redirect)=>{
		let res=Inventaire.find().count();
		if(!res){
			if(!Meteor.user()){
					redirect('/');
				}else if(Meteor.user()){
					alert("Aucun inventaire détecté !!!");
					redirect('/dashboard/insert-wallet/');
				}
		}
	}],
	action(){
		mount(MainLayout,
			{content:()=><HistoFIFO/>})
	}
});

FlowRouter.route('/dashboard/comptes-financiers-modification/',{
	name:'modcomptefin',
	triggersEnter:[(context,redirect)=>{
		let res=ComptesFinanciers.find().count();
		if(!res){
			if(!Meteor.user()){
					redirect('/');
				}else if(Meteor.user()){
					alert("Aucune base de donnees des comptes financiers détecté !!!");
					redirect('/dashboard/');
				}else if(IsTraiting.find().count()){
					alert("Un traitement est actuellement en cours veuillez patientez !!!");
					redirect('/dashboard/');
				}
		}else{
			if(!Meteor.user()){
					redirect('/');
				}
		}
	}],
	action(){
		mount(MainLayout,
			{content:()=><ComptesFin/>})
	}
});

FlowRouter.route('/dashboard/wallet/',{
	name:'wallet',
	triggersEnter:[(context,redirect)=>{
		//Check if collection inventaire isnt empty
		let res=Inventaire.find().count();
		if(!res){
			if(!Meteor.user()){
					redirect('/');
				}else if(Meteor.user()){
					redirect('/dashboard/insert-wallet/');
				}else if(IsTraiting.find().count()){
					alert("Un traitement est actuellement en cours veuillez patientez !!!");
					redirect('/dashboard/');
				}
		}
		
	}],
	action(){
		mount(MainLayout,
			{content:()=><Wallet/>})
	}
});

FlowRouter.route('/dashboard/insert-wallet/',{
	name:'insertwallet',
	triggersEnter:[(context,redirect)=>{
		//Check if collection inventaire isnt empty
		let res=Inventaire.find().count();
		if(res){
				if(!Meteor.user()){
					redirect('/');
				}else if(Meteor.user()){
					redirect('/dashboard/wallet/');
				}else if(IsTraiting.find().count()){
					alert("Un traitement est actuellement en cours veuillez patientez !!!");
					redirect('/dashboard/');
				}
			}	
	}],
	action(){
		mount(MainLayout,
			{content:()=><InventUploader/>})
	}
});

FlowRouter.route('/dashboard/treatOps',{
	name:'upload',
	triggersEnter:[(context,redirect)=>{
		if(!Meteor.user()){
			redirect('/');
		}else if(IsTraiting.find().count()){
			alert("Un traitement est actuellement en cours veuillez patientez !!!");
			redirect('/dashboard/');
		}
	}],
	action(){
		mount(MainLayout,
			{content:()=><Uploader/>})
	}
});
FlowRouter.route('/dashboard/treatOps/ops_report',{
	name:'report',
	triggersEnter:[(context,redirect)=>{
		if(!Meteor.user()){
			redirect('/');
		}
	}],
	action(){
		mount(MainLayout,
			{content:()=><AfterCompta/>})
	}
});
FlowRouter.route('/admin',{
	name:'admin',
	action(){
		mount(MainLayout,
			{content:()=><AdminLogin/>})
	}
});
FlowRouter.route('/admin/dashboard',{
	name:'adminDashboard',
	triggersEnter:[(context,redirect)=>{
		const isAdminConnected=store.getState().administrateurAction.adminConnected;
		console.log(isAdminConnected);
		if(!isAdminConnected){
			redirect('/admin');
		}
	}],
	action(){
		mount(MainLayout,
			{content:()=><AdminDashboard/>})
	}
});
FlowRouter.route('/admin/dashboard/create_user',{
	name:'createUser',
	triggersEnter:[(context,redirect)=>{
		const isAdminConnected=store.getState().administrateurAction.adminConnected;
		console.log(isAdminConnected);
		if(!isAdminConnected){
			redirect('/admin');
		}else if(IsTraiting.find().count()){
			alert("Un traitement est actuellement en cours veuillez patientez !!!");
			redirect('/admin/dashboard/');
		}
	}],
	action(){
		mount(MainLayout,
			{content:()=><CreateUser/>})
	}
});
FlowRouter.route('/admin/dashboard/list_user',{
	name:'listUser',
	triggersEnter:[(context,redirect)=>{
		const isAdminConnected=store.getState().administrateurAction.adminConnected;
		console.log(isAdminConnected);
		if(!isAdminConnected){
			redirect('/admin');
		}else if(IsTraiting.find().count()){
			alert("Un traitement est actuellement en cours veuillez patientez !!!");
			redirect('/admin/dashboard/');
		}
	}],
	action(){
		mount(MainLayout,
			{content:()=><AdminUserList/>})
	}
});