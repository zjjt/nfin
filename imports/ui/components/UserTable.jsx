import React,{PropTypes,Component} from 'react';
import {FlowRouter} from 'meteor/kadira:flow-router';
import {Toolbar,ToolbarSeparator,ToolbarTitle,ToolbarGroup} from 'material-ui/Toolbar';
import RaisedButton from 'material-ui/RaisedButton';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import { connect } from 'react-redux';
import {Field,reduxForm,formValueSelector} from 'redux-form';
import {TextField} from 'redux-form-material-ui';
import Home from 'material-ui/svg-icons/action/home';
import Divider from 'material-ui/Divider';
import CircularProgress from 'material-ui/CircularProgress';
import {Table, TableBody, TableFooter, TableHeader, TableHeaderColumn, TableRow, TableRowColumn} from 'material-ui/Table';
import {graphql} from 'react-apollo';
import gql from 'graphql-tag';
import {deluser,setUserCodes} from '../../redux/actions/admin-actions.js';

//Quand on click sur les checkbox on compte le nombre de lignes selectionnes et on dispacth une action sur store avec side effects de modification dans la database
class UserTable extends Component{

        constructor(){
            super();
            this.state={
                dialogIsOpen:false,
                errorMsg:'',
                selectedRows:[],
                codeRedacList:[],
                table:{
                        fixedHeader:true,
                        fixedFooter:true,
                        stripedRows:false,
                        showRowHover:false,
                        selectable:true,
                        multiSelectable: true,
                        enableSelectAll:true,
                        deselectOnClickaway:false,
                        showCheckboxes:true,
                        height:'350px'
                    }
            };
        }

        componentDidUpdate(){
            if(this.state.codeRedacList.length>0){
                this.props.dispatch(setUserCodes(this.state.codeRedacList));
            }

            if(this.props.suppr){
                this.props.deleteUsers(this.state.codeRedacList).then(()=>{
                    this.props.dispatch(deluser());
                });
               
            }
        }
        
        _onRowSelection(rowsarr){
            let codearray=[];
            if(rowsarr){
                rowsarr.map((r)=>{
                codearray.push(this.props.data.userSQL[r].redac);
                console.dir(this.props.data.userSQL[r])
             });
            }
            this.setState({
                selectedRows:rowsarr,
                codeRedacList:codearray
            });
            
            
        }

        _dialogOpen(){
            this.setState({dialogIsOpen: true});
        }

        _dialogClose(){
            this.setState({dialogIsOpen: false});
        }

        render(){
            const {handleSubmit,pristine,submitting,dispatch,data,username}=this.props;
            console.dir(this.props.data.user);
            const dialogActions = [
                <FlatButton
                    label="OK"
                    primary={true}
                    onTouchTap={this._dialogClose.bind(this)}
                />,
                ];
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
                                <TableHeaderColumn tooltip="Nom de l'utilisateur">Nom</TableHeaderColumn>
                                <TableHeaderColumn tooltip="Prénoms de l'utilisateur">Prénoms</TableHeaderColumn>
                                <TableHeaderColumn tooltip="Code Rédacteur de l'utilisateur">Code Rédacteur</TableHeaderColumn>
                                
                            </TableRow>
                        </TableHeader>
                        <TableBody
                            displayRowCheckbox={this.state.table.showCheckboxes}
                            deselectOnClickaway={this.state.table.deselectOnClickaway}
                            showRowHover={this.state.table.showRowHover}
                            stripedRows={this.state.table.stripedRows}
                        >
                        
                        {
                            data.loading||data.user===undefined||data.user.length<=0?(<TableRow>
                                            <TableRowColumn colSpan="3" style={{textAlign:'center'}}>
                                               <div style={{textAlign:'center'}}>Aucun utilisateur dans la base de donnée</div>
                                            </TableRowColumn>
                                        </TableRow>):data.user.map((row,index)=>(
                                            <TableRow key={index} selected={this.state.selectedRows.indexOf(index)!==-1} ref={`user${index}`}>
                                                <TableRowColumn>{row.nom}</TableRowColumn>
                                                <TableRowColumn>{row.prenom}</TableRowColumn>
                                                <TableRowColumn >{row.codeRedac}</TableRowColumn> 
                                            </TableRow>
                                        ))
                                        
                        }
                        </TableBody>
                    </Table>
                    <form>
                    
                    </form>
                </div>
            );
        }

}

UserTable.propTypes={
    data:PropTypes.shape({
        loading:PropTypes.bool,
        user:PropTypes.array
    }).isRequired,
    nom:PropTypes.string,
    deleteUsers:PropTypes.func
};

const listeUtilisateur=gql`
    query listeUtilisateur($nom:String,$orderDesc:Boolean!){
        user(username:$nom){
            username
            uncrypted
            nom
            prenoms
            fullname
            codeRedac
            createdAt
        },
        
    }`;
const deleteUsersBoth=gql`
    mutation deleteUsersBoth($usercodes:[String]!){
        deleteUsers(usercodes:$usercodes){
            redac
        }
    }
`;
UserTable=connect()(UserTable);

export default graphql(deleteUsersBoth,{
    name:'deleteUsers',
    options:{
        props:({mutate})=>({
            deleteUsers:(usercodes)=>mutate({variables:{usercodes}})
        }),
        forceFetch:true,
        pollInterval:4000,
        updateQueries:{
            listeUtilisateur:(prev,{queryVariables})=>{
            console.dir(prev);
            //console.dir(mutationResult);
            console.dir(queryVariables);
                return{
                    listeUtilisateur:[...prev.listeUtilisateur,mutationResult.data.deleteUsers]
                }
            }
        }
    }
})(graphql(listeUtilisateur,{
    options:({ nom,orderDesc }) => ({ variables: { nom,orderDesc },forceFetch:true,pollInterval:4000 }),
})(UserTable));

