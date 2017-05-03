import {FlowRouter} from 'meteor/kadira:flow-router';
import {Meteor} from 'meteor/meteor';
import {mount} from 'react-mounter';
import React from 'react';
import store from '../../redux/store.js'
import Uploader from '../../ui/containers/Uploader.jsx';
import Dashboard from '../../ui/containers/Dashboard.jsx';
import MainLayout from '../../ui/Layouts/MainLayout/MainLayout.jsx';
import Login from '../../ui/containers/Login.jsx';
import AdminLogin from '../../ui/containers/AdminLogin.jsx';
import AfterCompta from '../../ui/containers/AfterCompta.jsx';
import AdminDashboard from '../../ui/containers/AdminDashboard.jsx';
import CreateUser from '../../ui/containers/CreateUser.jsx';
import AdminUserList from '../../ui/containers/AdminUserList.jsx';
import injectTapEventPlugin from 'react-tap-event-plugin';
import {Session} from 'meteor/session';

injectTapEventPlugin();
FlowRouter.route('/',{
	name:'home',
	triggersEnter:[(context,redirect)=>{
		if(Meteor.user()){
			redirect('/dashboard');
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

FlowRouter.route('/dashboard/wallet/actions/',{
	name:'actions',
	triggersEnter:[(context,redirect)=>{
		if(!Meteor.user()){
			redirect('/');
		}
	}],
	action(){
		mount(MainLayout,
			{content:()=><Actions/>})
	}
});

FlowRouter.route('/dashboard/wallet/',{
	name:'wallet',
	triggersEnter:[(context,redirect)=>{
		if(!Meteor.user()){
			redirect('/');
		}
	}],
	action(){
		mount(MainLayout,
			{content:()=><Wallet/>})
	}
});
FlowRouter.route('/dashboard/wallet/obligations/',{
	name:'obligations',
	triggersEnter:[(context,redirect)=>{
		if(!Meteor.user()){
			redirect('/');
		}
	}],
	action(){
		mount(MainLayout,
			{content:()=><Obligations/>})
	}
});
FlowRouter.route('/dashboard/treatOps',{
	name:'upload',
	triggersEnter:[(context,redirect)=>{
		if(!Meteor.user()){
			redirect('/');
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
		}
	}],
	action(){
		mount(MainLayout,
			{content:()=><AdminUserList/>})
	}
});