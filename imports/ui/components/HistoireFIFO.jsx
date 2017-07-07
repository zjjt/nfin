import React,{PropTypes,Component} from 'react';
import {FlowRouter} from 'meteor/kadira:flow-router';
import {Toolbar,ToolbarSeparator,ToolbarTitle,ToolbarGroup} from 'material-ui/Toolbar';
import RaisedButton from 'material-ui/RaisedButton';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import { connect } from 'react-redux';
import {moment} from 'meteor/momentjs:moment';
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
import {formatNumberInMoney} from '../../utils/utils.js';
import LinearProgress from 'material-ui/LinearProgress';

import {$} from 'meteor/jquery';

const ITEMS_PER_PAGE=10;

class HistoireFIFO extends Component{

        constructor(){
            super();
            this.state={
                dialogIsOpen:false,
                errorMsg:'',
                selectedRows:[],
                regSelected:[],
                table:{
                        fixedHeader:true,
                        fixedFooter:true,
                        stripedRows:false,
                        showRowHover:false,
                        selectable:true,
                        multiSelectable: false,
                        enableSelectAll:false,
                        deselectOnClickaway:false,
                        showCheckboxes:false,
                        height:'450px'
                    }
            };
        }

        componentDidUpdate(){
          
        }
        componentDidMount(){
           // $('.tableau').parent().css("width","2646px");
        }

        _dialogOpen(){
            this.setState({dialogIsOpen: true});
        }

        _dialogClose(){
            this.setState({dialogIsOpen: false});
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
            });
            console.dir(regarray);
            
        }
        
        render(){
            const {handleSubmit,pristine,submitting,dispatch,data,histoFIFO,loadMoreEntries,loading}=this.props;
           
            let self=this;
                const dialogActions = [
                <FlatButton
                    label="FERMER"
                    primary={true}
                    onTouchTap={this._dialogClose.bind(this)}
                />,
                <FlatButton
                    label="VIDER"
                    primary={true}
                    onTouchTap={()=>{
                        Meteor.call("dropInventory",(err,res)=>{
                            this._dialogClose();
                            alert('Inventaire vidé !!!');
                            FlowRouter.go("dashboard");
                        });
                        
                    }}
                />,
               
                ];
console.dir(this.props);
            return(
                <div >
                <Dialog
                    title="ECRASER L'INVENTAIRE ?"
                    actions={dialogActions}
                    modal={false}
                    open={this.state.dialogIsOpen}
                    onRequestClose={this._dialogClose}
                    >
                        Vous êtes sur le point de vider cet inventaire.En êtes vous sur ?
                    </Dialog>
                    <Table
                        height={this.state.table.height}
                        fixedHeader={this.state.table.fixedHeader}
                        fixedFooter={this.state.table.fixedFooter}
                        selectable={this.state.table.selectable}
                        multiSelectable={this.state.table.multiSelectable}
                        onRowSelection={this._onRowSelection.bind(this)}
                        className="tableau"
                    >
                        <TableHeader
                            displaySelectAll={this.state.table.showCheckboxes}
                            adjustForCheckbox={this.state.table.showCheckboxes}
                            enableSelectAll={this.state.table.enableSelectAll}
                        >
                            <TableRow>
                                 <TableHeaderColumn tooltip="Ligne numero">N°</TableHeaderColumn>
                                <TableHeaderColumn tooltip="Date de l'opération">Date de l'opération</TableHeaderColumn>
                                <TableHeaderColumn tooltip="Valeurs mobilières">Valeurs mobilières</TableHeaderColumn>
                                <TableHeaderColumn tooltip="Quantité">Quantité</TableHeaderColumn>
                                <TableHeaderColumn tooltip="Prix d'Achat/Prix de Vente">Prix d'Achat/Prix de Vente</TableHeaderColumn>
                                <TableHeaderColumn tooltip="VAL. Bilan">Valeur totale</TableHeaderColumn>
                                <TableHeaderColumn tooltip="SGI">SGI</TableHeaderColumn>
                                <TableHeaderColumn tooltip="Opération réalisée">Opération réalisée</TableHeaderColumn>
                                <TableHeaderColumn tooltip="Référence">Référence</TableHeaderColumn>
                                <TableHeaderColumn tooltip="Type de valeur">Type de valeur</TableHeaderColumn>
                              
                            </TableRow>
                        </TableHeader>
                        <TableBody
                            displayRowCheckbox={this.state.table.showCheckboxes}
                            deselectOnClickaway={this.state.table.deselectOnClickaway}
                            showRowHover={this.state.table.showRowHover}
                            stripedRows={this.state.table.stripedRows}
                        >
                        {
                            
                           (loading)?(
                                            <TableRow>
                                               <TableRowColumn colSpan="14">
                                                    <div style={{textAlign:'center'}}>
                                                Recherchez dans l'historique selon les filtres ci-dessus<br/>    
                                                    </div>
                                               </TableRowColumn>
                                            </TableRow>
                                           ):typeof histoFIFO!=='undefined'?histoFIFO.map((row,index)=>{
                                            return(<TableRow key={index} className="animated bounceInRight" selected={this.state.selectedRows.indexOf(index)!==-1} ref={`user${index}`}>
                                                <TableRowColumn title="">{index+1}</TableRowColumn>
                                                <TableRowColumn title={moment(row.Date).format("DD/MM/YYYY")}>{moment(row.DateAcquisition).format("DD/MM/YYYY")}</TableRowColumn>
                                                <TableRowColumn title={row.Valeur}>{row.Valeur}</TableRowColumn>
                                                <TableRowColumn title={row.Quantite}>{row.Quantite}</TableRowColumn>
                                                <TableRowColumn title={row.prixAchat?"prix d'achat "+formatNumberInMoney(row.prixAchat):"prix de vente de "+formatNumberInMoney(row.prixVente)}>{row.prixAchat?formatNumberInMoney(row.prixAchat):formatNumberInMoney(row.prixVente)}</TableRowColumn>
                                                <TableRowColumn title={row.ValBilan}>{formatNumberInMoney(row.ValBilan)}</TableRowColumn>
                                                <TableRowColumn title="NSIAFINANCE">NSIAFINANCE</TableRowColumn>
                                               <TableRowColumn title={row.typeop}>{row.typeop}</TableRowColumn>
                                               <TableRowColumn title={row.reference}>{row.reference}</TableRowColumn>
                                               <TableRowColumn title={row.type}>{row.type}</TableRowColumn>    
                                            </TableRow>);
                                        }):<TableRow>
                                               <TableRowColumn colSpan="14">
                                                    <div style={{textAlign:'center'}}>
                                                Aucun élément dans la base de données<br/>veuillez re faire une integration    
                                                    </div>
                                               </TableRowColumn>
                                            </TableRow>
                                        
                        }
                        </TableBody>
                    </Table>
                     <div className="loadmoreDivSpaceAround">
                        
                        
                    </div>
                    <div className="helperDiv">
                     Pour effectuer une recherche ,veuillez entrez la valeur mobilière recherchée.
                     <b>NB:LES RECHERCHES SONT EXECUTEES DYNAMIQUEMENT.</b>
                     </div>
                </div>
            );
        }

}



function mapDispatchToProps(dispatch){
    return{
        dispatch
    }
}
HistoireFIFO=connect(mapDispatchToProps)(HistoireFIFO);

HistoireFIFO.propTypes={
        loading:PropTypes.bool,
       invehistoFIFOntaire:PropTypes.array,
       type:PropTypes.string,
       typeop:PropTypes.string,
       symbole:PropTypes.string
};

const getHisto=gql`
    query HistoFIFO($typeop:String,$type:String!,$symbole:String){
        histoFIFO(typeop:$typeop,type:$type,symbole:$symbole){
            Date
            Valeur
            Quantite
            prixVente
            prixAchat
            ValBilan
            PMvalue
            Symbole
            ref
            type
            typeop
        },
        
    }`;


export default graphql(getHisto,{
    options:({type,typeop,symbole}) => ({  
        variables: {
            type,
            typeop,
            symbole,
            offset:0,
            limit:ITEMS_PER_PAGE          
    },forceFetch:true }),
        props:({data:{loading,histoFIFO,fetchMore}})=>{
            return{
                loading,
                histoFIFO,
                loadMoreEntries(){
                    return fetchMore({
                        variables:{
                            offset:histoFIFO.length
                        },
                        updateQuery:(previousResult,{fetchMoreResult})=>{
                            if(!fetchMoreResult.data){return previousResult;}
                            return Object.assign({},previousResult,{
                                inventaire:[...previousResult.histoFIFO,...fetchMoreResult.data.histoFIFO],
                            });
                        }
                    });
                }
            }
        }
   
})(HistoireFIFO);