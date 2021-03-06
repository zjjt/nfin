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
import {InventaireBackup} from '../../api/collections.js';
import {RadioButton,RadioButtonGroup} from 'material-ui/RadioButton';
import MenuItem from 'material-ui/MenuItem';
import {miseajourDispo} from '../../redux/actions/user-actions.js';
import { createContainer } from 'meteor/react-meteor-data';
import {arrAreSame,transformInFrenchDate,groupByLibel,groupSumBySymbole,convertInDateObjFromFrenchDate} from '../../utils/utils.js';
import LinearProgress from 'material-ui/LinearProgress';

import {$} from 'meteor/jquery';

const ITEMS_PER_PAGE=10;

class FullWalletBackups extends Component{

        constructor(){
            super();
            this.state={
                dialogIsOpen:false,
                errorMsg:'',
                selectedRows:[],
                regSelected:[],
                exportFormat:"XLS",
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
            const {handleSubmit,pristine,submitting,dispatch,data,inventaire,loadMoreEntries,loading}=this.props;
           console.log("props are");
           console.dir(this.props);
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
                        
                        if(this.props.moment&&this.props.inventaireBack){
                            let choix=confirm("Voulez vous vraiment supprimer cette sauvegarde de l'inventaire datant du "+moment(this.props.moment).format("LLLL:ss")+" ?");
                            if(choix){
                                Meteor.call("dropInventory",this.props.moment,(err,res)=>{
                                            this._dialogClose();
                                            alert('Sauvegarde éffacée');
                                            FlowRouter.go("histodashboard");
                                            
                                        });
                                
                            }
                        }
                        
                        
                    }}
                />,
               
                ];

            return(
                <div >
                <Dialog
                title="ECRASER L'INVENTAIRE SAUVEGARD&Eacute; ?"
                actions={dialogActions}
                modal={false}
                open={this.state.dialogIsOpen}
                onRequestClose={this._dialogClose}
                >
                        Vous êtes sur le point de vider cette sauvegarde de l'inventaire.En êtes vous sur ?
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
                                <TableHeaderColumn tooltip="Date d'acquisition">Acquis le</TableHeaderColumn>
                                <TableHeaderColumn tooltip="Valeurs mobilières">Valeurs mobilières</TableHeaderColumn>
                                <TableHeaderColumn tooltip="Quantité">Quantité</TableHeaderColumn>
                                <TableHeaderColumn tooltip="Nominal">Nominal</TableHeaderColumn>
                                <TableHeaderColumn tooltip="VAL. Bilan">Valeur totale</TableHeaderColumn>
                                <TableHeaderColumn tooltip="SGI">SGI</TableHeaderColumn>
                                <TableHeaderColumn tooltip="Symbole">Symbole</TableHeaderColumn>
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
                                                Recherchez dans l'inventaire selon le nom de la valeur<br/>    
                                                    </div>
                                               </TableRowColumn>
                                            </TableRow>
                                           ):typeof this.props.inventaireBack!=='undefined'?this.props.inventaireBack.map((row,index)=>{
                                            return(<TableRow key={index} className="animated bounceInRight" selected={this.state.selectedRows.indexOf(index)!==-1} ref={`user${index}`}>
                                                <TableRowColumn title="">{index+1}</TableRowColumn>
                                                <TableRowColumn title={moment(row.DateAcquisition).format("DD/MM/YYYY")}>{moment(row.DateAcquisition).format("DD/MM/YYYY")}</TableRowColumn>
                                                <TableRowColumn title={row.Valeur}>{row.Valeur}</TableRowColumn>
                                                <TableRowColumn title={row.Quantite}>{row.Quantite}</TableRowColumn>
                                                <TableRowColumn title={row.PrixUnitaire}>{row.PrixUnitaire}</TableRowColumn>
                                                <TableRowColumn title={row.ValBilan}>{row.ValBilan}</TableRowColumn>
                                                <TableRowColumn title={row.SGI}>{row.SGI}</TableRowColumn>
                                               <TableRowColumn title={row.Symbole}>{row.Symbole}</TableRowColumn>
                                               <TableRowColumn title={row.reference}>{row.reference}</TableRowColumn>
                                               <TableRowColumn title={row.type}>{row.type}</TableRowColumn>    
                                            </TableRow>);
                                        }):<TableRow>
                                               <TableRowColumn colSpan="14">
                                                    <div style={{textAlign:'center'}}>
                                                Aucun élément dans l'inventaire<br/>veuillez choisir un inventaire à afficher    
                                                    </div>
                                               </TableRowColumn>
                                            </TableRow>
                                        
                        }
                        </TableBody>
                    </Table>
                     <div className="loadmoreDivSpaceAround">
                         <RadioButtonGroup name="exportFormat" defaultSelected="XLS" onChange={(e,v)=>{
                                this.setState({
                                   exportFormat:v
                                });
                             }}>
                             <RadioButton
                                value="XLS"
                                title="bon pour effectuer des analyses"
                                label="format MS-Excel"
                             />
                             <RadioButton
                                value="CSV"
                                title="bon pour insertion d'un inventaire en cas de corruption des données"
                                label="format CSV simple"
                             />
                         </RadioButtonGroup>
                        <RaisedButton 
                            label="Exporter vers..." 
                            labelColor="white"
                            backgroundColor="#cd9a2e"
                            onClick={()=>{ 
                                Meteor.call("extractArraysToExcel",[inventaire],['Inventaire'],this.state.exportFormat,(err,res)=>{
                                   if(res){
                                      // console.dir(res);
                                     
                                        const blob=new Blob([res],{
                                            type:'application/octet-stream'
                                        });
                                      if(this.state.exportFormat==="CSV"){
                                        alert("Un fichier CSV contenant une sauvegarde de l'inventaire à la date du "+moment(res.date).format("DD/MM/YYYY")+" sera téléchargé automatiquement...");
                                        const a=window.document.createElement('a');
                                        a.href=window.URL.createObjectURL(blob,{
                                            type:'data:attachment/csv'
                                        });
                                        a.download="INVENTAIRE_"+moment(res.date).format("DD/MM/YYYY")+".csv";
                                        document.body.appendChild(a);
                                        a.click();
                                        document.body.removeChild(a);
                                      }else if(this.state.exportFormat==="XLS"){
                                        alert("Un fichier excel contenant une sauvegarde de l'inventaire à la date du "+moment(res.date).format("DD/MM/YYYY")+" pour analyse, sera téléchargé automatiquement...");
                                        const a=window.document.createElement('a');
                                        a.href=window.URL.createObjectURL(blob,{
                                            type:'data:attachment/xlsx'
                                        });
                                        a.download="INVENTAIRE_"+moment(res.date).format("DD/MM/YYYY")+".xlsx";
                                        document.body.appendChild(a);
                                        a.click();
                                        document.body.removeChild(a);
                                      }
                                    
                                    
                                   }else{
                                       alert(err);
                                   }
                                })
                            }}
                        />
                        <RaisedButton 
                            label="Vider l'inventaire" 
                            labelColor="white"
                            backgroundColor="#cd9a2e"
                            onClick={this._dialogOpen.bind(this)}
                        />
                        {loading?"Chargement...":null}
                        
                    </div>
                    <div className="helperDiv">
                     Pour effectuer une recherche ,veuillez entrez la valeur mobilière recherchée.Elle sera retrouvée si elle existe dans la sauvegarde de l'inventaire que vous êtes en train de visualiser.
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
FullWalletBackups=connect(mapDispatchToProps)(FullWalletBackups);

FullWalletBackups.propTypes={
        loading:PropTypes.bool,
       inventaire:PropTypes.array,
       type:PropTypes.string,
       search:PropTypes.string,
};

const getInventory=gql`
    query getInventoryBack($type:String!,$moment:String!,$search:String){
        inventaireBack(type:$type,moment:$moment,search:$search){
            DateAcquisition
            Valeur
            Quantite
            PrixUnitaire
            ValBilan
            SGI
            Symbole
            reference
            lastTypeOp
            type
        },
        
    }`;

   

export default graphql(getInventory,{
    options:({type,moment,search}) => ({  
        variables: {
            type,
            moment,
            search,
            offset:0,
            limit:ITEMS_PER_PAGE          
    },forceFetch:true }),
        props:({data:{loading,inventaireBack,fetchMore}})=>{
            return{
                loading,
                inventaireBack,
                loadMoreEntries(){
                    return fetchMore({
                        variables:{
                            offset:inventaireBack.length
                        },
                        updateQuery:(previousResult,{fetchMoreResult})=>{
                            if(!fetchMoreResult.data){return previousResult;}
                            return Object.assign({},previousResult,{
                                inventaire:[...previousResult.inventaireBack,...fetchMoreResult.data.inventaireBack],
                            });
                        }
                    });
                }
            }
        }
   
})(FullWalletBackups);