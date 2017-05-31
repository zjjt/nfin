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
import {Meteor} from 'meteor/meteor';

//import {Fichiers} from '../../api/collections';
import {Table, TableBody, TableFooter, TableHeader, TableHeaderColumn, TableRow, TableRowColumn} from 'material-ui/Table';

//import {decoupagedone} from '../../redux/actions/relever-actions';
import {$} from 'meteor/jquery';

class RelevTable extends Component{
    constructor(){
        super();
        this.state={
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
                    height:'300px'
                }
        };
    }
componentDidMount(){
            $('.tableau').parent().css("width","4041px").css("overflow","none");
        }
  _onRowSelection(rowsarr){
           // let regarray=[];
            if(rowsarr){
                rowsarr.map((r)=>{
                    return;
                //regarray.push(this.props.listeDispo[r]);
                //console.dir(this.props.data.userSQL[r])
             });
            }

            this.setState({
                selectedRows:rowsarr,

            });
            
        }

    render(){
        const {relever}=this.props;
        return( 
            <div className="relevtable">
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
                                <TableHeaderColumn>Ligne No</TableHeaderColumn>
                                <TableHeaderColumn tooltip="Numéro du compte banque de Nsia Vie Assurances">Compte banque</TableHeaderColumn>
                                <TableHeaderColumn tooltip="code avant la date d'achat">{`Code`}</TableHeaderColumn>
                                <TableHeaderColumn tooltip="Date d'achat des titres financiers ou date d'initialisation de l'opération">{`Date d'achat`}</TableHeaderColumn>
                                <TableHeaderColumn tooltip="Date de réception des titres financiers ou date effective de mise en oeuvre de l'opération">Date de réception</TableHeaderColumn>
                                <TableHeaderColumn tooltip="Référence de l'opération">Référence</TableHeaderColumn>
                                <TableHeaderColumn tooltip="Code de l'opération">{`Code de l'opération`}</TableHeaderColumn>
                                <TableHeaderColumn tooltip="Symbole de l'opération">Symbole</TableHeaderColumn>
                                <TableHeaderColumn tooltip="Code ISIN">Code ISIN</TableHeaderColumn>
                                <TableHeaderColumn tooltip="Operation comptable transposée dans nos comptes">Opération comptable</TableHeaderColumn>
                                <TableHeaderColumn tooltip="Montant total de l'opération">Montant total</TableHeaderColumn>
                                <TableHeaderColumn tooltip="Opération comptable et montant initiaux dans le relevé">Opération/Montant SLR </TableHeaderColumn>
                                <TableHeaderColumn tooltip="Libéllé de l'opération">Libéllé</TableHeaderColumn>
                                <TableHeaderColumn tooltip="catégorie de l'opération(ACTION,OBLIGATION)">Catégorie</TableHeaderColumn>
                                <TableHeaderColumn tooltip="Quantité des titres achetés ou vendus">Quantité</TableHeaderColumn>
                                <TableHeaderColumn tooltip="Prix unitaire en cfa">Prix unitaire en cfa</TableHeaderColumn>
                              
                            </TableRow>
                        </TableHeader>
                        <TableBody
                            displayRowCheckbox={this.state.table.showCheckboxes}
                            deselectOnClickaway={this.state.table.deselectOnClickaway}
                            showRowHover={this.state.table.showRowHover}
                            stripedRows={this.state.table.stripedRows}
                        >
                        {relever.map((row,index)=>{
                             return(<TableRow key={++index} className="animated bounceInRight" selected={this.state.selectedRows.indexOf(index)!==-1} ref={`user${index}`}>
                                        <TableRowColumn>{index}</TableRowColumn>
                                        <TableRowColumn title={row.NUM_COMPTE_BANK_NSIAVIE}>{row.NUM_COMPTE_BANK_NSIAVIE}</TableRowColumn>
                                        <TableRowColumn title={row.AVANT_DATE_ACHAT}>{row.AVANT_DATE_ACHAT}</TableRowColumn>
                                        <TableRowColumn title={row.DATE_ACHAT_DES_TITRES}>{row.DATE_ACHAT_DES_TITRES}</TableRowColumn>
                                        <TableRowColumn title={row.DATE_RECEPTION_DES_TITRES}>{row.DATE_RECEPTION_DES_TITRES}</TableRowColumn>
                                        <TableRowColumn title={row.REFERENCE}>{row.REFERENCE}</TableRowColumn>
                                        <TableRowColumn title={row.CODE_OPERATION}>{row.CODE_OPERATION}</TableRowColumn>
                                        <TableRowColumn title={row.SYMBOLE}>{row.SYMBOLE}</TableRowColumn>
                                        <TableRowColumn title={row.CODE_ISIN}>{row.CODE_ISIN}</TableRowColumn>
                                        <TableRowColumn title={row.OPERATION_COMPTABLE}>{row.OPERATION_COMPTABLE}</TableRowColumn>
                                        <TableRowColumn title={row.MONTANT_TOTAL}>{row.MONTANT_TOTAL}</TableRowColumn>
                                        <TableRowColumn title={row.APRES_ISIN}>{row.APRES_ISIN}</TableRowColumn>
                                        <TableRowColumn title={row.LIBELLE_OPERATION}>{row.LIBELLE_OPERATION}</TableRowColumn>
                                        <TableRowColumn title={row.CATEGORIE_TITRE}>{row.CATEGORIE_TITRE}</TableRowColumn>
                                        <TableRowColumn title={row.QUANTITE}>{row.QUANTITE}</TableRowColumn>
                                        <TableRowColumn title={row.PRIX_UNITAIRE}>{row.PRIX_UNITAIRE}</TableRowColumn>
                                    </TableRow>);
                        })}
                        </TableBody>
                    </Table>
                    
            </div>
        );
       
    }
}


export default RelevTable;