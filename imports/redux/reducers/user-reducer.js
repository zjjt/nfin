import * as actions from '../actions/user-actions';

const initialState={
    isUserConnected:false,
    user:null
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
        
        default:
            return state;

    }

}