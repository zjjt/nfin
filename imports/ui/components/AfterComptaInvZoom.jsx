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
import {Meteor} from 'meteor/meteor';
import {TempInventaire} from '../../api/collections.js';
import {createContainer} from 'meteor/react-meteor-data';
import {formatNumberInMoney} from '../../utils/utils.js';
const R= require('ramda');
import {$} from 'meteor/jquery';

const ITEMS_PER_PAGE=10;

class AfterComptaInvZoom extends Component{

        constructor(){
            super();
            this.state={
                dialogIsOpen:false,
                filtre:"ALL",
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
           $('#ALL').click(()=>{
               this.setState({filtre:"ALL"});
           });
           $('#AAC').click(()=>{
               this.setState({filtre:"AC"});
           });
           $('#VACMV').click(()=>{
               this.setState({filtre:"MV"});
           });
           $('#VACPV').click(()=>{
               this.setState({filtre:"PV"});
           });
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
            //on compte le nombre d'operation propres realisee lors de la comptabilisation
            let numbAAC=TempInventaire.find({lastTypeOp:"AAC"}).count();
            let numbVAC=TempInventaire.find({lastTypeOp:"VAC"}).count();
            let numbVACPV=TempInventaire.find({lastTypeOp:"VACPV"}).count();
            let numbVACMV=TempInventaire.find({lastTypeOp:"VACMV"}).count();
            //================================
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
                    <h2>Filtrer par:</h2>
                    <hr/>
                    <div className="inventfilters animated zoomInDown">
                    <div className="filters ">
                        <div className="fintern " id="ALL">
                        <p>Tout affich&eacute;</p>
                        </div>      
                    </div>
                    {numbAAC!=0?(<div className="filters ">
                        <div className="fintern lightbluebak" id="AAC">
                        <p>{`${numbAAC} Achat d'action`}</p>
                        </div>
                    </div>):null}
                    {numbVAC!=0?(<div className="filters ">
                        <div className="fintern yellowbak" id="VAC">
                        <p>{`${numbVAC} Achat d'action`}</p>
                        </div>
                    </div>):null}
                    {numbVACPV!=0?(<div className="filters ">
                        <div className="fintern greenbak" id="VACPV">
                        <p>{`${numbVACPV} plus value de cession`}</p>
                        </div>
                        
                    </div>):null}
                    {numbVACMV!=0?(<div className="filters ">
                        <div className="fintern orangebak" id="VACMV">
                        <p>{`${numbVACMV} moins value de cession`}</p>
                        </div>
                    </div>):null}
                    </div>
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
                                                Recherchez dans linventaire selon le nom de la valeur<br/>    
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
                                            </TableRow>:this.state.filtre==="ALL"?typeof inventaire!=='undefined'?inventaire.map((row,index,arr)=>{
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
                                                                    <TableRowColumn title={formatNumberInMoney(row.PrixUnitaire)}>{formatNumberInMoney(row.PrixUnitaire)}</TableRowColumn>
                                                                    <TableRowColumn title={formatNumberInMoney(row.ValBilan)}>{formatNumberInMoney(row.ValBilan)}</TableRowColumn>
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
                                            </TableRow>:this.state.filtre==="MV"?R.filter(R.where({'lastTypeOp':R.contains("VACMV")}))(inventaire).map((row,index,arr)=>{
                                                return(<TableRow key={index} className="animated bounceInright orangebak" selected={this.state.selectedRows.indexOf(index)!==-1} ref={`user${index}`}>
                                                                    <TableRowColumn title="">{index+1}</TableRowColumn>
                                                                    <TableRowColumn title={moment(row.DateAcquisition).format("DD/MM/YYYY")}>{moment(row.DateAcquisition).format("DD/MM/YYYY")}</TableRowColumn>
                                                                    <TableRowColumn title={row.Valeur}>{row.Valeur}</TableRowColumn>
                                                                    <TableRowColumn title={row.Quantite}>{row.Quantite}</TableRowColumn>
                                                                    <TableRowColumn title={formatNumberInMoney(row.PrixUnitaire)}>{formatNumberInMoney(row.PrixUnitaire)}</TableRowColumn>
                                                                    <TableRowColumn title={formatNumberInMoney(row.ValBilan)}>{formatNumberInMoney(row.ValBilan)}</TableRowColumn>
                                                                    <TableRowColumn title={row.Symbole}>{row.Symbole}</TableRowColumn>
                                                                    <TableRowColumn title={row.reference}>{row.reference}</TableRowColumn> 
                                                                </TableRow>);
                                            }):this.state.filtre==="PV"?R.filter(R.where({'lastTypeOp':R.contains("VACPV")}))(inventaire).map((row,index,arr)=>{
                                                return(<TableRow key={index} className="animated bounceInright greenbak" selected={this.state.selectedRows.indexOf(index)!==-1} ref={`user${index}`}>
                                                                    <TableRowColumn title="">{index+1}</TableRowColumn>
                                                                    <TableRowColumn title={moment(row.DateAcquisition).format("DD/MM/YYYY")}>{moment(row.DateAcquisition).format("DD/MM/YYYY")}</TableRowColumn>
                                                                    <TableRowColumn title={row.Valeur}>{row.Valeur}</TableRowColumn>
                                                                    <TableRowColumn title={row.Quantite}>{row.Quantite}</TableRowColumn>
                                                                    <TableRowColumn title={formatNumberInMoney(row.PrixUnitaire)}>{formatNumberInMoney(row.PrixUnitaire)}</TableRowColumn>
                                                                    <TableRowColumn title={formatNumberInMoney(row.ValBilan)}>{formatNumberInMoney(row.ValBilan)}</TableRowColumn>
                                                                    <TableRowColumn title={row.Symbole}>{row.Symbole}</TableRowColumn>
                                                                    <TableRowColumn title={row.reference}>{row.reference}</TableRowColumn> 
                                                                </TableRow>);}):this.state.filtre==="AC"?R.filter(R.where({'lastTypeOp':R.contains("AAC")}))(inventaire).map((row,index,arr)=>{
                                                return(<TableRow key={index} className="animated bounceInright lightbluebak" selected={this.state.selectedRows.indexOf(index)!==-1} ref={`user${index}`}>
                                                                    <TableRowColumn title="">{index+1}</TableRowColumn>
                                                                    <TableRowColumn title={moment(row.DateAcquisition).format("DD/MM/YYYY")}>{moment(row.DateAcquisition).format("DD/MM/YYYY")}</TableRowColumn>
                                                                    <TableRowColumn title={row.Valeur}>{row.Valeur}</TableRowColumn>
                                                                    <TableRowColumn title={row.Quantite}>{row.Quantite}</TableRowColumn>
                                                                    <TableRowColumn title={formatNumberInMoney(row.PrixUnitaire)}>{formatNumberInMoney(row.PrixUnitaire)}</TableRowColumn>
                                                                    <TableRowColumn title={formatNumberInMoney(row.ValBilan)}>{formatNumberInMoney(row.ValBilan)}</TableRowColumn>
                                                                    <TableRowColumn title={row.Symbole}>{row.Symbole}</TableRowColumn>
                                                                    <TableRowColumn title={row.reference}>{row.reference}</TableRowColumn> 
                                                                </TableRow>);}):null
                                        
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
AfterComptaInvZoom=connect(mapDispatchToProps)(AfterComptaInvZoom);

AfterComptaInvZoom.propTypes={
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
},AfterComptaInvZoom);
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
   
})(AfterComptaInvZoom);*/