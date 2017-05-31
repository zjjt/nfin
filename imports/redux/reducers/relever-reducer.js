import * as actions from '../actions/relever-actions';

const initialState={
    releverDuJour:null,
    resultatComptaFull:null,
    isFull:true
   
};

export default function releveReducer(state=initialState,action){
   // console.dir(action);
    switch(action.type){
        case actions.DECOUPAGEDONE:
        return{
            ...state,
            releverDuJour:action.releve
        };
        case actions.START_COMPTA_PROCESS:
        console.dir(action.resComptaSimple);
        return{
            ...state,
            resultatComptaFull:action.resComptaFull
        };
        case actions.SIMPLIFY:
        
        return{
            ...state,
            isFull:!state.isFull
        }
        default:
            return state;

    }

}