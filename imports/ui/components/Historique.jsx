import React,{PropTypes,Component} from 'react';
import {TextField} from 'redux-form-material-ui';
import Divider from 'material-ui/Divider';
import CircularProgress from 'material-ui/CircularProgress';
import {connect} from 'react-redux';
import RaisedButton from 'material-ui/RaisedButton';
import {FlowRouter} from 'meteor/kadira:flow-router';
import {Field,reduxForm,formValueSelector} from 'redux-form';
import Dialog from 'material-ui/Dialog';
import {FilesCollection} from 'meteor/ostrio:files';
import FlatButton from 'material-ui/FlatButton';
import {Meteor} from 'meteor/meteor'
import {Fichiers} from '../../api/collections';
import {decoupagedone,releverOk} from '../../redux/actions/relever-actions';
import {$} from 'meteor/jquery';

class Historique extends Component{

    constructor(){
        super();
        this.state={};
    }

    render(){
        const {}=this.props;
        return(
            <div>

            </div>
        );
    }
}

export default Historique;