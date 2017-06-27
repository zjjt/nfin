import * as actions from '../actions/inventaire-actions';

const initialState={
    inventaireSnap:null,
    filter:'ALL'
};

export default function inventaireReducer(state=initialState,action){
   // console.dir(action);
    switch(action.type){
        case actions.SNAPINVENTAIRE:
        return{
            ...state,
            inventaireSnap:action.inventaireSnap
        };
        case actions.FILTRERINVENTAIRE:
        return{
            ...state,
            filter:action.filter
        };
        
        default:
            return state;

    }

}