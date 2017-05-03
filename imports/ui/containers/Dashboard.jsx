import React,{PropTypes,Component} from 'react';
import {Card,CardHeader,CardMedia} from 'material-ui/Card';
import { connect } from 'react-redux';
import {Session} from 'meteor/session';

 class Dashboard extends Component{
    constructor(){
        super();
    }
  
    render(){
        console.log("object de sessiion user "+Session.get('userRole'));
            let user=Session.get('userRole');
            
            if(typeof user!=="undefined" && user==="C"){
                return(<div className="centeredContent">
                            <div className="cardMenu " >
                                <div className="cardContainer fadeInRight animated">
                                    <Card className="cards" onClick={()=>FlowRouter.go('obligations')}>
                                        <CardHeader 
                                            title="Portefeuille des titres financiers"
                                            className="cardsHeader" 
                                        />
                                        <CardMedia className="cardsMedia">
                                            <img src="../img/exportxls.png"/>
                                        </CardMedia>
                                    </Card>
                                </div>
                            </div>
                        </div>);
            }else if(typeof user!=="undefined" && user==="G"){
                return(<div className="centeredContent">
                            <div className="cardMenu " >
                             <div className="cardContainer fadeInRight animated">
                                <Card className="cards" onClick={()=>FlowRouter.go('excel')}>
                                    <CardHeader 
                                        title="Inventaire des titres financiers"
                                        className="cardsHeader" 
                                    />
                                    <CardMedia className="cardsMedia">
                                        <img src="../img/titre.png"/>
                                    </CardMedia>
                                </Card>
                            </div>
                            
                            <div className="cardContainer fadeInRight animated">
                                <Card className="cards" onClick={()=>FlowRouter.go('upload')}>
                                    <CardHeader 
                                        title="Intégrer un relevé"
                                        className="cardsHeader" 
                                    />
                                    <CardMedia className="cardsMedia">
                                        <img src="../img/fichier.png"/>
                                    </CardMedia>
                                </Card>
                            </div>
                            <div className="cardContainer fadeInRight animated">
                                <Card className="cards" onClick={()=>FlowRouter.go('excel')}>
                                    <CardHeader 
                                        title="Historique des opérations"
                                        className="cardsHeader" 
                                    />
                                    <CardMedia className="cardsMedia">
                                        <img src="../img/histo.png"/>
                                    </CardMedia>
                                </Card>
                            </div>
                            </div>
                        </div>);
            }
        else{
            return (<div>lol</div>);
        }
        /*return(
            <div className="centeredContent">
                <div className="cardMenu " >
                    
                    <div className="cardContainer fadeInRight animated">
                        <Card className="cards " onClick={()=>FlowRouter.go('dispo')}>
                            <CardHeader 
                                title="Règlements disponibles"
                                className="cardsHeader" 
                            />
                            <CardMedia className="cardsMedia">
                                <img src="../img/disporeg.png"/>
                            </CardMedia>
                        </Card>
                    </div>
                    <div className="cardContainer fadeInRight animated">
                         <Card className="cards" onClick={()=>FlowRouter.go('dispolist')}>
                            <CardHeader 
                                title="Modifier les disponibilités"
                                className="cardsHeader" 
                            />
                            <CardMedia className="cardsMedia">
                                <img src="../img/modifrgt.png"/>
                            </CardMedia>
                         </Card>
                    </div>
                   <div className="cardContainer fadeInRight animated">
                         <Card className="cards" onClick={()=>FlowRouter.go('excel')}>
                            <CardHeader 
                                title="Exporter les données"
                                className="cardsHeader" 
                            />
                            <CardMedia className="cardsMedia">
                                <img src="../img/exportxls.png"/>
                            </CardMedia>
                         </Card>
                    </div>
                </div>
            </div>
        );*/
    }
}
const mapStateToProps= (state) => {
    return{
        currentUser:state.userActions.user
    };
  }
Dashboard=connect(
   mapStateToProps
)(Dashboard);

export default Dashboard;