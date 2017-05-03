import React,{PropTypes,Component} from 'react';
import {TextField} from 'redux-form-material-ui';
import Divider from 'material-ui/Divider';
import CircularProgress from 'material-ui/CircularProgress';
import LinearProgress from 'material-ui/LinearProgress';
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
import RelevTable from './RelevTable.jsx';
import {$} from 'meteor/jquery';


const styles={
    uploadInput:{
        cursor:'pointer',
        position:'absolute',
        top:0,
        bottom:0,
        right:0,
        left:0,
        width:'0%',
        opacity:0,
        zIndex:-100000
    }
}
 class FileUpload extends Component{
    constructor(){
        super();
        this.state={
            dialogIsOpen:false,
            dialogTIsOpen:false,
            errorMsg:'',
            showLoader:false,
            error:false,
            alreadyOp:false,
            decoupage:[],
            currentFile:false,
            progress:null,

        }
    }

   _dialogOpen(){
       this.setState({dialogIsOpen: true});
   }
   _dialogClose(){
       this.setState({dialogIsOpen: false});
   }
    _dialogTOpen(){
        this.setState({dialogTIsOpen: true,alreadyOp:true});
    }

    _dialogTClose(){
        this.setState({dialogTIsOpen: false,alreadyOp:true});
    }
   componentWillUpdate(){
       const {dispatch}=this.props;
       if(this.state.decoupage.length>=1 && !this.state.alreadyOp){
            dispatch(decoupagedone(this.state.decoupage));
            this.setState({
                dialogTIsOpen:true,
                alreadyOp:true
            })
            
        }
            /*setTimeout( Meteor.call("findTempReleve",(err,res)=>{
                        if(res){

                        console.dir(res);
                        const buf=new ArrayBuffer(res.length);
                        const view=new Uint8Array(buf);
                        for(let i=0;i!=res.length;i++) view[i]=res.charCodeAt(i) & 0xFF;
                        const blob=new Blob([buf],{
                            type:'application/octet-stream'
                        });

                        const a=window.document.createElement('a');
                        a.href=window.URL.createObjectURL(blob,{
                            type:'data:attachment/xlsx'
                        });
                        a.download='fichierDecouper'+new Date()+'.xlsx';
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        this.setState({
                            decoupage:res
                        });
                    }
                 }), 5000);*/
             
                
                
             
        
        
   }
    render(){
         const {handleSubmit,pristine,submitting,dispatch}=this.props;
        if(this.state.currentFile && this.state.decoupage.length<=0){
             Meteor.call("decoupExcel",(err,res)=>{
                 console.dir(res);
                        this.setState({
                            decoupage:res
                        });
             });
        }
        
        console.dir(this.state.decoupage);
       /* if(this.state.decoupage.length!==-1){
               const buf=new ArrayBuffer(this.state.decoupage.length);
                        const view=new Uint8Array(buf);
                        for(let i=0;i!=this.state.decoupage.length;i++) view[i]=this.state.decoupage.charCodeAt(i) & 0xFF;
                        const blob=new Blob([buf],{
                            type:'application/octet-stream'
                        });

                        const a=window.document.createElement('a');
                        a.href=window.URL.createObjectURL(blob,{
                            type:'data:attachment/xlsx'
                        });
                        a.download='fichierDecouper'+new Date()+'.xlsx';
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
        }*/
         const dialogTActions = [
                <FlatButton
                    label="OK"
                    primary={true}
                    onTouchTap={()=>{
                         this.setState({
                                        error:false,
                                        showLoader:true,
                                        errorMsg:`Veuillez patienter pendant que la magie opère...`
                                    });
                                    this._dialogOpen();
                        dispatch(releverOk());
                    }}
                />,
                ];
        const dialogActions = [
        <FlatButton
            label="OK"
            primary={true}
            onTouchTap={this._dialogClose.bind(this)}
        />,
        ];
       
        
        return(
            <div className="loginformCont">
                <Dialog
                    title={`Relevé des opérations financières à intégrer`}
                    actions={dialogTActions}
                    modal={false}
                    open={this.state.dialogTIsOpen}
                    onRequestClose={this._dialogTClose}
                    titleStyle={{backgroundColor:'#1f2d67',color:'white'}}
                    contentStyle={{width:'80%',maxWidth:'none'}}
                    autoScrollBodyContent={true}
                    >
                        <RelevTable dispatch={dispatch} relever={this.state.decoupage}/>
                    </Dialog>

                <Dialog
                actions={dialogActions}
                modal={false}
                open={this.state.dialogIsOpen}
                onRequestClose={this._dialogClose}
                style={{color:'red'}}
                autoDetectWindowHeight={true}
                >
                <span className={this.state.error?"errorMsg":"okMsg"}>{this.state.errorMsg}</span>
                {this.state.showLoader?(<LinearProgress mode="indeterminate"/>):null}
                </Dialog>

                <form>
                <input type="file" 
                    className="upl" 
                    style={styles.uploadInput}
                    onChange={(e)=>{
                        if(e.currentTarget.files && e.currentTarget.files[0]){
                            let file=e.currentTarget.files[0];
                            let upload=Fichiers.insert({
                                file:file,
                                fileName:'operations.xls',
                                streams:'dynamic',
                                chunkSize:'dynamic'
                            },false);
                            
                            upload.on('start',()=>{
                                this.setState({
                                    currentFile:this
                                });
                            });
                             upload.on('end',(error,fileObj)=>{
                                    if(error){
                                         this.setState({
                                             error:true,
                                            errorMsg:"Une erreur est survenue pendant le téléchargement. "+error
                                        });
                                        this._dialogOpen();
                                    }else{
                                        //on affiche pour dire aue c'est fini
                                         this.setState({
                                                    error:false,
                                                    errorMsg:`Le fichier a été téléchargé avec succès.`
                                                });
                                                this._dialogOpen();
                                       
                                        
                                    }
                                    this.setState({
                                        //currentFile:false,
                                        error:false
                                    });
                                });

                                upload.start();
                                upload.on('progress',(prog,file)=>{
                                     this.setState({
                                        progress:prog
                                    });
                                });
                        }
                    }}/>
                    <div className="uploadDiv">
                        <div style={{height:'10px'}}></div>
                            <div>
                                <RaisedButton 
                                    label="Choisir un fichier" 
                                    labelColor="white"
                                    backgroundColor="#cd9a2e"  
                                    disabled={this.state.currentFile?true:false}
                                    onClick={()=>{
                                        $('.upl').click();
                                    }}  
                                />
                            </div>
                            <div style={{height:'10px'}}></div>
                            <div style={{height:'10px'}}></div>
                            <div>
                                {this.state.currentFile&&this.state.progress<=99?(<CircularProgress size={60} thickness={7}/>):this.state.progress!==100?(<span>Le fichier doit être au format xls et ne doit pas exéder 10MB</span>):null}
                                {this.state.progress===100?(<span style={{color:'green',textAlign:'center'}}>Fichier Téléchargé<br/>Veuillez patienter pendant le découpage</span>):null}
                            </div>
                        
                    </div>
                </form>
            </div>
        );
    }

}
FileUpload=reduxForm({
    form:'fileup',
})(FileUpload);

const mapDispatchToProps=(dispatch)=>{
    return{
        dispatch
    };
}
FileUpload=connect(mapDispatchToProps)(FileUpload);
//decorate with connect to read form values



export default FileUpload;

