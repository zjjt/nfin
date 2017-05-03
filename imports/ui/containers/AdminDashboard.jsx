import React,{PropTypes,Component} from 'react';
import {Card,CardHeader,CardMedia} from 'material-ui/Card';

export default class AdminDashboard extends Component{
    constructor(){
        super();
    }

    render(){
        return(
            <div className="centeredContent">
                <div className="cardMenu " >
                    
                    <div className="cardContainer fadeInRight animated">
                        <Card className="cards " onClick={()=>FlowRouter.go('createUser')}>
                            <CardHeader 
                                title="Créer un utilisateur"
                                className="cardsHeader" 
                            />
                            <CardMedia className="cardsMedia">
                                <img src="../img/background.jpg"/>
                            </CardMedia>
                        </Card>
                    </div>
                    <div className="cardContainer fadeInRight animated">
                         <Card className="cards" onClick={()=>FlowRouter.go('listUser')}>
                            <CardHeader 
                                title="Modifier un compte"
                                className="cardsHeader" 
                            />
                            <CardMedia className="cardsMedia">
                                <img src="../img/background.jpg"/>
                            </CardMedia>
                         </Card>
                    </div>
                   
                </div>
            </div>
        );
    }
}