import React,{PropTypes,Component} from 'react';
import AppBar from 'material-ui/AppBar';
import FileUpload from '../components/FileUpload.jsx';

export default class Uploader extends Component{
    constructor(){
        super();
    }
    
    render(){
        return(
           <div className="centeredContent">
                <div className="loginDiv zoomIn animated">
                    <AppBar
                        title="Veuillez choisir le relevé à intégrer"
                        style={{backgroundColor: '#212f68'}}
                        iconClassNameLeft="none"
                        titleStyle={{
                            textAlign:'center'
                        }}
                    />
                    <FileUpload/>
                </div>
           </div>
        )
    }
}