import * as actions from '../actions/user-actions';

const initialState={
    isUserConnected:false,
    user:null,
    toutValide:false,
    shouldExtractAGR:false,
};

export default function userReducer(state=initialState,action){
   // console.dir(action);
    switch(action.type){
        case actions.USERCONNECTED:
     //   alert(action.user);
        return{
            ...state,
            isUserConnected:true,
            user:action.user
        };
        case actions.EXTOEXLEND:
        //Toggle le switch pour l'extraction vers agresso et la mise a jour de la base pour les differentes tables
        return{
            ...state,
            shouldExtractAGR:!state.shouldExtractAGR
        }
        case actions.JEVALIDETOUT:
        //Toggle le switch pour afficher la boite de dialog
        return{
            ...state,
            toutValide:!state.toutValide
        }
        default:
            return state;

    }

}