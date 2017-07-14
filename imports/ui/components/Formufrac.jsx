import React,{PropTypes,Component} from 'react';
import {TextField,SelectField,DatePicker} from 'redux-form-material-ui';
import Divider from 'material-ui/Divider';
import CircularProgress from 'material-ui/CircularProgress';
import LinearProgress from 'material-ui/LinearProgress';
import {connect} from 'react-redux';
import RaisedButton from 'material-ui/RaisedButton';
import {FlowRouter} from 'meteor/kadira:flow-router';
import {Field,reduxForm,formValueSelector} from 'redux-form';
import Dialog from 'material-ui/Dialog';
import {moment} from 'meteor/momentjs:moment';
import {FilesCollection} from 'meteor/ostrio:files';
import FlatButton from 'material-ui/FlatButton';
import {Meteor} from 'meteor/meteor';
import MenuItem from 'material-ui/MenuItem';
import {Inventaire} from '../../api/collections';
import {Table, TableBody, TableFooter, TableHeader, TableHeaderColumn, TableRow, TableRowColumn} from 'material-ui/Table';
import areIntlLocalesSupported from 'intl-locales-supported';
import {arrAreSame,transformInFrenchDate,groupByLibel,groupSumBySymbole,formatNumberInMoney,convertInDateObjFromFrenchDate} from '../../utils/utils.js';

let DateTimeFormat;
if(areIntlLocalesSupported(['fr'])){
    DateTimeFormat=global.Intl.DateTimeFormat;
}
import {$} from 'meteor/jquery';

 class Formufrac extends Component{
    constructor(){
        super();
        this.state={
            dialogIsOpen:false,
            errorMsg:'',
            showLoader:false,
            error:false,
            alreadyOp:false,
            decoupage:[],
            currentFile:false,
            showOld:false,
            showNew:true,
            showTable:false,
            progress:null,
            fracArrOl:[],
            fracArrNew:[],
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
                    height:'330px'
                }

        }
    }

   _dialogOpen(){
       this.setState({dialogIsOpen: true});
   }
   _dialogClose(){
       this.setState({dialogIsOpen: false});
   }
    _onRowSelection(rowsarr){
               
                
            }
   componentWillUpdate(){
       const {dispatch}=this.props;
       /*if(this.state.decoupage.length>=1 && !this.state.alreadyOp){
            
            
       }  */  
         
   }

   render(){
       const {handleSubmit,pristine,submitting,dispatch,reset}=this.props;

       const submit=(values,dispatch)=>{
           let numberRGX=/^[0-9]+$/;
            if(values.valeur===''||!values.valeur){
                this.setState({
                    error:true,
                    errorMsg:"Veuillez à sélectionner une valeur mobilière"
                });
                this._dialogOpen();
            }else if(values.date_debut_frac===''||!values.date_debut_frac){
               this.setState({
                   error:true,
                    errorMsg:"Veuillez à fournir une date de fractionnement"
                });
                this._dialogOpen(); 
            } 
            else if(values.taux===''||!values.taux){
               this.setState({
                   error:true,
                    errorMsg:"Veuillez à fournir une taux de fractionnement"
                });
                this._dialogOpen(); 
            }
            else if(!values.taux.match(numberRGX)){
               this.setState({
                   error:true,
                    errorMsg:"Veuillez à fournir une taux de fractionnement valide"
                });
                this._dialogOpen(); 
            }             
            else{
               //alert(JSON.stringify(values));
               this.setState({
                   showLoader:true,
                   showTable:false
               });

                Meteor.call('updateFraction',values,(err,res)=>{
                    if(err){
                        if(err.error==="notfound"){
                            this.setState({
                                error:true,
                                showLoader:false,
                                errorMsg:err.reason
                            });
                        }
                        this._dialogOpen();
                    }else if(res){
                        //alert(JSON.stringify(res.updatedInv));
                        if(res.error){
                            this.setState({
                                fracArrOl:res.oldInv,
                                fracArrNew:res.updatedInv,
                                showTable:true,
                                showLoader:false,
                                error:true,
                                errorMsg:res.message
                            });
                            this._dialogOpen();
                        }else{
                            reset();
                            this.setState({
                                fracArrOl:res.oldInv,
                                fracArrNew:res.updatedInv,
                                showTable:true,
                                showLoader:false,
                                error:false,
                                errorMsg:res.message
                            });
                            this._dialogOpen();
                           // alert(JSON.stringify(this.state));
                        }
                        
                    }
                });
                
            }
        };

        const maxLength = max => value =>(value && value.length > max)||(value && value.length < max) ? `ce champs doit être de ${max} caractères` : undefined;
        const maxLength3=maxLength(3);
        const required = value => value ? undefined : 'Required';
        const inventaire=groupSumBySymbole(Inventaire.find({},{sort:{Symbole:1}}).fetch(),['Symbole'],['Quantite']);
         const dialogActions = [
                <FlatButton
                    label="OK"
                    primary={true}
                    onTouchTap={()=>{
                        if(this.state.errorMsg==="Fractionnement annulé"){
                            this.setState({
                                showLoader:false,
                            });
                        }
                        this._dialogClose();
                    }}
                />,
                ];
    return(
    <form  className="" style={{}} onSubmit={handleSubmit(submit)}>

    <Dialog
        actions={dialogActions}
        modal={false}
        open={this.state.dialogIsOpen}
        onRequestClose={this._dialogClose}
        style={{color:'red'}}
        autoDetectWindowHeight={true}
        >
        <span className={this.state.error?"errorMsg":"okMsg"}>{this.state.errorMsg}</span>
    </Dialog>
       <div className="innerFormDiv">          
                <Field
                    name="valeur" 
                    component={SelectField}
                    floatingLabelText="Valeur mobilière dans l'inventaire"
                    hintText="Valeur mobilière"
                    floatingLabelFixed={true}
                    fullWidth={true}
                    //validate={[required]}
                    value={this.props.valeur}
                >{
                   inventaire.map((e,i)=>{
                       return(<MenuItem value={e.Symbole} key={i} primaryText={e.Valeur}/>);
                   }) 
                }    
                </Field>
                 <Field
                            name="date_debut_frac" 
                            DateTimeFormat={DateTimeFormat}
                            className="datepicker"
                            component={DatePicker}
                            floatingLabelText="Date de début de la période de fractionnement"
                            fullWidth={true}
                            okLabel="OK"
                            cancelLabel="Annuler"
                            locale="fr"
                            format={(value,name)=>{
                                console.log('value being passed ',value);
                                console.log('is of type',typeof value);
                                return value===''?null:value;
                            }}
                            floatingLabelFixed={true}
                        />
                        <Field 
                        name="taux" 
                        type="number"
                        min="1"
                        max="100"
                        component={TextField}
                        hintText="Entrez taux de fractionnement désiré "
                        floatingLabelText="Taux de fractionnement"
                        fullWidth={true}
                        
                        />

                <div className="inAppBtnDivMiddle" style={{}}>
                    <RaisedButton
                        label="Fractionner" 
                        labelColor="white"
                        backgroundColor="#cd9a2e"
                        className="inAppBtnForm"
                        type="submit"
                    />
                    
                </div>
                <div style={{height:"10px"}}></div>
                <hr/>
                <div className="justLoader">
                {
                    this.state.showLoader?<CircularProgress size={60} thickness={7}/>:this.state.showTable?<Table
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
                                              
                            </TableRow>
                        </TableHeader>
                            <TableBody
                                displayRowCheckbox={this.state.table.showCheckboxes}
                                deselectOnClickaway={this.state.table.deselectOnClickaway}
                                showRowHover={this.state.table.showRowHover}
                                stripedRows={this.state.table.stripedRows}
                            >
                                {
                                    this.state.showNew? this.state.fracArrNew.length>0?this.state.fracArrNew.map((row,index)=>{
                                            return(<TableRow key={index} className={row.Quantite!==this.state.fracArrOl[index].Quantite?"animated bounceInLeft yellowbak":"animated bounceInLeft"} selected={this.state.selectedRows.indexOf(index)!==-1} ref={`user${index}`}>
                                               <TableRowColumn title="">{index+1}</TableRowColumn>
                                                <TableRowColumn title={moment(row.DateAcquisition).format("DD/MM/YYYY")}>{moment(row.DateAcquisition).format("DD/MM/YYYY")}</TableRowColumn>
                                                <TableRowColumn title={row.Valeur}>{row.Valeur}</TableRowColumn>
                                                <TableRowColumn title={row.Quantite}>{row.Quantite}</TableRowColumn>
                                                <TableRowColumn title={formatNumberInMoney(row.PrixUnitaire)}>{formatNumberInMoney(row.PrixUnitaire)}</TableRowColumn>
                                            </TableRow>);
                                        }):<TableRow>
                                               <TableRowColumn colSpan="14">
                                                    <div style={{textAlign:'center'}}>
                                                Aucun élément trouvé<br/>veuillez re faire une integration    
                                                    </div>
                                               </TableRowColumn>
                                            </TableRow>:this.state.showOld? this.state.fracArrOl.length>0?this.state.fracArrOl.map((row,index)=>{
                                            return(<TableRow key={index} className="animated bounceInLeft" selected={this.state.selectedRows.indexOf(index)!==-1} ref={`user${index}`}>
                                               <TableRowColumn title="">{index+1}</TableRowColumn>
                                                <TableRowColumn title={moment(row.DateAcquisition).format("DD/MM/YYYY")}>{moment(row.DateAcquisition).format("DD/MM/YYYY")}</TableRowColumn>
                                                <TableRowColumn title={row.Valeur}>{row.Valeur}</TableRowColumn>
                                                <TableRowColumn title={row.Quantite}>{row.Quantite}</TableRowColumn>
                                                <TableRowColumn title={formatNumberInMoney(row.PrixUnitaire)}>{formatNumberInMoney(row.PrixUnitaire)}</TableRowColumn>
                                            </TableRow>);
                                        }):<TableRow>
                                               <TableRowColumn colSpan="14">
                                                    <div style={{textAlign:'center'}}>
                                                Aucun élément trouvé<br/>veuillez re faire une integration    
                                                    </div>
                                               </TableRowColumn>
                                            </TableRow>:null
                    
                                }
                            </TableBody>
                        </Table>
                        :<p>Veuillez sélectionner la valeur mobilière à fractionner</p>
                }
                   
                {
                    this.state.showTable?<div style={{display:"flex",flexDirection:"column",width:'100%'}}>
                    <div className="inAppBtnDivMiddle" style={{justifyContent:"space-between"}}>
                            <RaisedButton
                                label="Avant Fractionnement" 
                                labelColor="white"
                                backgroundColor="#cd9a2e"
                                className="inAppBtnForm"
                                onClick={()=>{this.setState({showOld:true,showNew:false})}}
                            />
                            <RaisedButton
                                label="Après Fractionnement" 
                                labelColor="white"
                                backgroundColor="#cd9a2e"
                                className="inAppBtnForm"
                                onClick={()=>{this.setState({showOld:false,showNew:true})}}
                            />
                        </div><hr/> <div className="inAppBtnDivMiddle" style={{justifyContent:"center"}}>
                            <RaisedButton
                                label="Annuler le fractionnement" 
                                labelColor="white"
                                backgroundColor="#cd9a2e"
                                className="inAppBtnForm"
                                onClick={()=>{this.setState({showOld:false,
                                    showNew:true,
                                    showLoader:true,
                                    showTable:false
                                });
                                //meteor-all
                                Meteor.call("cancelFrac",this.state.fracArrOl,(err,res)=>{
                                    if(res){
                                       this.setState({
                                        error:false,
                                        errorMsg:res.message
                                    });
                                    this._dialogOpen(); 
                                    }
                                });
                            }}
                            />
                        </div></div>:null
                }
                    
                </div>
            </div>    
               </form>
    );
   }
 }

 Formufrac=reduxForm({
    form:'addFract',
  //  fields:['nom','prenom','username','password','passwordconf','codeRedac','role']
})(Formufrac);

const selector = formValueSelector('addFract');

Formufrac = connect(
  state => {
    // or together as a group
    const { valeur, date_debut_frac,taux } = selector(state, 'valeur', 'date_debut_frac','taux')
    return {
      valeur,
      date_debut_frac,
      taux
    }
  }
)(Formufrac)

export default Formufrac;