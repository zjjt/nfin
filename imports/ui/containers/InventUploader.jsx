import React,{PropTypes,Component} from 'react';
import AppBar from 'material-ui/AppBar';
import InventFileUpload from '../components/InventFileUpload.jsx';

export default class InventUploader extends Component{
    constructor(){
        super();
    }
    
    render(){
        return(
           <div className="centeredContent">
                <div className="loginDiv zoomIn animated">
                    <AppBar
                        title="Télécharger le fichier inventaire à intégrer"
                        style={{backgroundColor: '#212f68'}}
                        iconClassNameLeft="none"
                        titleStyle={{
                            textAlign:'center'
                        }}
                    />
                    <InventFileUpload/>
                </div>
           </div>
        )
    }
}