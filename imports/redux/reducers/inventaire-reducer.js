import * as actions from '../actions/inventaire-actions';

const initialState={
    inventaireSnap:null 
};

export default function inventaireReducer(state=initialState,action){
   // console.dir(action);
    switch(action.type){
        case actions.SNAPINVENTAIRE:
        return{
            ...state,
            inventaireSnap:action.inventaireSnap
        };
        
        default:
            return state;

    }

}