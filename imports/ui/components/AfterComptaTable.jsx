import React,{PropTypes,Component} from 'react';
import {FlowRouter} from 'meteor/kadira:flow-router';
import {Toolbar,ToolbarSeparator,ToolbarTitle,ToolbarGroup} from 'material-ui/Toolbar';
import RaisedButton from 'material-ui/RaisedButton';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import { connect } from 'react-redux';
import {Field,reduxForm,formValueSelector,submit} from 'redux-form';
import {TextField,DatePicker,SelectField} from 'redux-form-material-ui';
import Home from 'material-ui/svg-icons/action/home';
import Divider from 'material-ui/Divider';
import CircularProgress from 'material-ui/CircularProgress';
import {Table, TableBody, TableFooter, TableHeader, TableHeaderColumn, TableRow, TableRowColumn} from 'material-ui/Table';
import {graphql} from 'react-apollo';
import gql from 'graphql-tag';
import MenuItem from 'material-ui/MenuItem';
import {miseajourDispo} from '../../redux/actions/user-actions.js'
import LinearProgress from 'material-ui/LinearProgress';
import {simplifyOp,explodeOps} from '../../redux/actions/relever-actions.js';
import {$} from 'meteor/jquery';

//Quand on click sur les checkbox on compte le nombre de lignes selectionnes et on dispacth une action sur store avec side effects de modification dans la database
let DateTimeFormat;


const ITEMS_PER_PAGE=10;

class AfterComptaTable extends Component{

        constructor(){
            super();
            this.state={
                buttonLbl:"Simplifier les opérations",
                dialogTIsOpen:false,
                dialogIsOpen:false,
                errorMsg:'',
                selectedRows:[],
                regSelected:[],
                loaderVisible:false,
                table:{
                        fixedHeader:true,
                        fixedFooter:true,
                        stripedRows:false,
                        showRowHover:false,
                        selectable:true,
                        multiSelectable: false,
                        enableSelectAll:false,
                        deselectOnClickaway:false,
                        showCheckboxes:true,
                        height:'500px'
                    }
            };
        }

        componentDidUpdate(){
          console.dir(this.props.data);
        }
        componentDidMount(){
           // $('.tableau').parent().css("width","4288px");
        }

    
       
toggleTextandExpand()
{
    const {opCompta,dispatch}=this.props;
    dispatch(simplifyOp());
    if(this.state.buttonLbl==='Simplifier les opérations'){
        this.setState({
           buttonLbl:"Exploser les opérations", 
        });
    }else if(this.state.buttonLbl==="Exploser les opérations"){
         this.setState({
           buttonLbl:"Simplifier les opérations", 
        });
    }
}
        _onRowSelection(rowsarr){
            let regarray=[];
            if(rowsarr){
                rowsarr.map((r)=>{
                regarray.push(this.props.listeDispo[r]);
                //console.dir(this.props.data.userSQL[r])
             });
            }
            
            this.setState({
                selectedRows:rowsarr,
                regSelected:regarray,
                dialogTIsOpen:true
            });
            console.dir(regarray);
            
        }

        render(){
            const {handleSubmit,pristine,submitting,dispatch,opCompta,isFull}=this.props;
            return(
                <div >
                   
                    <Table
                        height={this.state.table.height}
                        fixedHeader={this.state.table.fixedHeader}
                        fixedFooter={this.state.table.fixedFooter}
                        selectable={this.state.table.selectable}
                        multiSelectable={this.state.table.multiSelectable}
                        onRowSelection={this._onRowSelection.bind(this)}
                    >
                        <TableHeader
                            displaySelectAll={this.state.table.showCheckboxes}
                            adjustForCheckbox={this.state.table.showCheckboxes}
                            enableSelectAll={this.state.table.enableSelectAll}
                        >
                            <TableRow>
                                <TableHeaderColumn tooltip="Compte débité">Compte Débit</TableHeaderColumn>
                                <TableHeaderColumn tooltip="Compte crédité">Compte Crédit</TableHeaderColumn>
                                <TableHeaderColumn tooltip="Libéllé">Libéllé</TableHeaderColumn>
                                <TableHeaderColumn tooltip="Montant au débit">Montant Débit</TableHeaderColumn>
                                <TableHeaderColumn tooltip="Montant au crédir">Montant Crédit</TableHeaderColumn>
                                
                            </TableRow>
                        </TableHeader>
                        <TableBody
                            displayRowCheckbox={this.state.table.showCheckboxes}
                            deselectOnClickaway={this.state.table.deselectOnClickaway}
                            showRowHover={this.state.table.showRowHover}
                            stripedRows={this.state.table.stripedRows}
                        >
                        {
                            
                           (!opCompta)?(
                                            <TableRow>
                                               <TableRowColumn colSpan="8">
                                                    <div style={{textAlign:'center'}}>
                                                        Veuillez insérer un fichier à intégrer pour avoir des resultats
                                                    </div>
                                               </TableRowColumn>
                                            </TableRow>
                                           ):typeof opCompta!=='undefined'?opCompta.map((row,index)=>{
                                            console.dir(row);
                                            return(<TableRow key={index} selected={this.state.selectedRows.indexOf(index)!==-1} ref={`user${index}`}>
                                                <TableRowColumn  title={row.ou==="D"?row.compte.compte:""}>{row.ou==="D"?row.compte.compte:""}</TableRowColumn>
                                                <TableRowColumn  title={row.ou==="C"?row.compte.compte:""}>{row.ou==="C"?row.compte.compte:""}</TableRowColumn>
                                                <TableRowColumn  title={isFull?row.libelle:row.libelleS}>{isFull?row.libelle:row.libelleS}</TableRowColumn>
                                                <TableRowColumn  title={row.ou==="D"?row.montant:""}>{row.ou==="D"?row.montant:""}</TableRowColumn>
                                                <TableRowColumn  title={row.ou==="C"?row.montant:""}>{row.ou==="C"?row.montant:""}</TableRowColumn>
                                            </TableRow>);
                                        }):<TableRow>
                                               <TableRowColumn colSpan="8">
                                                    <div style={{textAlign:'center'}}>
                                                Aucun resultat    
                                                    </div>
                                               </TableRowColumn>
                                            </TableRow>
                                        
                        }
                        </TableBody>
                    </Table>
                     <div className="loadmoreDiv" >
                        <RaisedButton
                            label="Exporter vers excel"
                            labelColor="white"
                            backgroundColor="#cd9a2e"
                            onClick={()=>{}}
                        />
                     </div>
                    <div className="helperDiv">
                     Ceci est le journal comptable des operations contenues dans le relevé des opérations que vous avez fourni
                     </div>
                </div>
            );
        }

}


AfterComptaTable=reduxForm({
    form:'modifForm',
   //fields:['nom','prenom','username','password','passwordconf','codeRedac']
})(AfterComptaTable);
function mapDispatchToProps(dispatch){
    return{
        dispatch
    }
}


AfterComptaTable=connect(mapDispatchToProps)(AfterComptaTable);


export default AfterComptaTable;


