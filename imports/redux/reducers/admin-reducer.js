import * as actions from '../actions/admin-actions';

const initialState={
    adminConnected:false,
    deluser:false,
    usercodes:[]
};

export default function adminReducer(state=initialState,action){

    switch(action.type){
        case actions.ADMINCONNECTION:
            return{
                ...state,
                adminConnected:true
            };
        case actions.ADMINDECONNECTION:
            return{
                ...state,
                adminConnected:false
            };
        case actions.DELUSER:
            return{
                ...state,
                deluser:!state.deluser
            }
        case actions.SETUSERCODES:
            return{
                ...state,
                usercodes:action.userCodes
            }
        default:
            return state;

    }

}