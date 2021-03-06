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
import LinearProgress from 'material-ui/LinearProgress';
import {Meteor} from 'meteor/meteor';
import {TempInventaire} from '../../api/collections.js';
import {createContainer} from 'meteor/react-meteor-data';
import {formatNumberInMoney} from '../../utils/utils.js';

import {$} from 'meteor/jquery';

const ITEMS_PER_PAGE=10;

class AfterComptaInv extends Component{

        constructor(){
            super();
            this.state={
                dialogIsOpen:false,
                errorMsg:'',
                showFIFOSnap:false,
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
                        height:'500px'
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
            const {handleSubmit,pristine,submitting,dispatch,data,fifoSnap,inventaire,loadMoreEntries,loading}=this.props;
           
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
                                <TableHeaderColumn tooltip="Date d'acquisition">Acquis le</TableHeaderColumn>
                                <TableHeaderColumn tooltip="Valeurs mobilières">Valeurs M.</TableHeaderColumn>
                                <TableHeaderColumn tooltip="Quantité">Quantité</TableHeaderColumn>
                                <TableHeaderColumn tooltip="Nominal">Nominal</TableHeaderColumn>
                                <TableHeaderColumn tooltip="VAL. Bilan">Valeur totale</TableHeaderColumn>
                                <TableHeaderColumn tooltip="Symbole">Symbole</TableHeaderColumn>
                                <TableHeaderColumn tooltip="Référence">Référence</TableHeaderColumn>
                               
                              
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
                                           ):this.state.showFIFOSnap?typeof fifoSnap!=='undefined'?fifoSnap.map((row,index)=>{
                                            return(<TableRow key={index} className="animated bounceInLeft" selected={this.state.selectedRows.indexOf(index)!==-1} ref={`user${index}`}>
                                               <TableRowColumn title="">{index+1}</TableRowColumn>
                                                <TableRowColumn title={moment(row.DateAcquisition).format("DD/MM/YYYY")}>{moment(row.DateAcquisition).format("DD/MM/YYYY")}</TableRowColumn>
                                                <TableRowColumn title={row.Valeur}>{row.Valeur}</TableRowColumn>
                                                <TableRowColumn title={row.Quantite}>{row.Quantite}</TableRowColumn>
                                                <TableRowColumn title={formatNumberInMoney(row.PrixUnitaire)}>{formatNumberInMoney(row.PrixUnitaire)}</TableRowColumn>
                                                <TableRowColumn title={formatNumberInMoney(row.ValBilan)}>{formatNumberInMoney(row.ValBilan)}</TableRowColumn>
                                               <TableRowColumn title={row.Symbole}>{row.Symbole}</TableRowColumn>
                                               <TableRowColumn title={row.reference}>{row.reference}</TableRowColumn> 
                                            </TableRow>);
                                        }):<TableRow>
                                               <TableRowColumn colSpan="14">
                                                    <div style={{textAlign:'center'}}>
                                                Aucun élément dans linventaire<br/>veuillez re faire une integration    
                                                    </div>
                                               </TableRowColumn>
                                            </TableRow>:typeof inventaire!=='undefined'?inventaire.map((row,index,arr)=>{
                                                let classo="animated bounceInright ";
                                                let classy="";
                                                let val;
                                                
                                                   
                                                        if(row.lastTypeOp==="AAC"){
                                                            //On a affaire a un achat d'action on surligne avec une couleur verte
                                                           classy="lightbluebak";
                                                        }else if(row.lastTypeOp==="VACMV"){
                                                            classy="orangebak"
                                                        }else if(row.lastTypeOp==="VACPV"){
                                                            classy="greenbak"
                                                        }
                                                         val=(<TableRow key={index} className={classo+classy} selected={this.state.selectedRows.indexOf(index)!==-1} ref={`user${index}`}>
                                                                    <TableRowColumn title="">{index+1}</TableRowColumn>
                                                                    <TableRowColumn title={moment(row.DateAcquisition).format("DD/MM/YYYY")}>{moment(row.DateAcquisition).format("DD/MM/YYYY")}</TableRowColumn>
                                                                    <TableRowColumn title={row.Valeur}>{row.Valeur}</TableRowColumn>
                                                                    <TableRowColumn title={row.Quantite}>{row.Quantite}</TableRowColumn>
                                                                    <TableRowColumn title={row.PrixUnitaire}>{row.PrixUnitaire}</TableRowColumn>
                                                                    <TableRowColumn title={row.ValBilan}>{row.ValBilan}</TableRowColumn>
                                                                <TableRowColumn title={row.Symbole}>{row.Symbole}</TableRowColumn>
                                                                <TableRowColumn title={row.reference}>{row.reference}</TableRowColumn> 
                                                                </TableRow>);
                                                   
                                                    
                                                
                                                return val;
                                        }):<TableRow>
                                               <TableRowColumn colSpan="14">
                                                    <div style={{textAlign:'center'}}>
                                                Aucun élément dans linventaire<br/>veuillez re faire une integration    
                                                    </div>
                                               </TableRowColumn>
                                            </TableRow>
                                        
                        }
                        </TableBody>
                    </Table>
                     <div className="loadmoreDivSpaceAround">
                        <RaisedButton 
                            label="<<< Voir avant comptabilisation" 
                            labelColor="white"
                            backgroundColor="#cd9a2e"
                            onClick={()=>{this.setState({showFIFOSnap:true})}}
                        />
                        <RaisedButton 
                            label="Voir après comptabilisation >>>" 
                            labelColor="white"
                            backgroundColor="#cd9a2e"
                            onClick={()=>{this.setState({showFIFOSnap:false})}}
                        />
                        {loading?"Chargement...":null}
                        
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
AfterComptaInv=connect(mapDispatchToProps)(AfterComptaInv);

AfterComptaInv.propTypes={
        loading:PropTypes.bool,
       inventaire:PropTypes.array,
       fifoSnap:PropTypes.array,
       type:PropTypes.string,
       search:PropTypes.string,
};

export default createContainer(()=>{
    const invhandle=Meteor.subscribe('tempinventaireTitre');
    const loading=!invhandle.ready();
    const invone=TempInventaire.findOne({type:"ACTIONS"});
    const invExist=!loading && !!invone;
    return{
        loading,
        invone,
        invExist,
        inventaire:invExist? TempInventaire.find({},{sort:{DateAcquisition:1}}).fetch():[],
    };
},AfterComptaInv);
/*const getInventory=gql`
    query getInventory($type:String!){
        inventaire(type:$type){
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
    options:({type}) => ({  
        variables: {
            type,
            offset:0,
            limit:ITEMS_PER_PAGE          
    },forceFetch:true }),
        props:({data:{loading,inventaire,fetchMore}})=>{
            return{
                loading,
                inventaire,
                loadMoreEntries(){
                    return fetchMore({
                        variables:{
                            offset:inventaire.length
                        },
                        updateQuery:(previousResult,{fetchMoreResult})=>{
                            if(!fetchMoreResult.data){return previousResult;}
                            return Object.assign({},previousResult,{
                                inventaire:[...previousResult.inventaire,...fetchMoreResult.data.inventaire],
                            });
                        }
                    });
                }
            }
        }
   
})(AfterComptaInv);*/