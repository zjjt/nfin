import React,{PropTypes,Component} from 'react';
import AppBar from 'material-ui/AppBar';
import AdminLoginForm from '../components/AdminLoginForm.jsx';

export default class Login extends Component{
    constructor(){
        super();
    }
    
    render(){
        return(
           <div className="centeredContent">
                <div className="loginDiv zoomIn animated">
                    <AppBar
                        title="Identification de l'administrateur"
                        style={{backgroundColor: 'gray'}}
                        iconClassNameLeft="none"
                        titleStyle={{
                            textAlign:'center'
                        }}
                    />
                    <AdminLoginForm />
                </div>
           </div>
        )
    }
}