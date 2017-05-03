export const MAJDISPO='MAJDISPO';
export const USERCONNECTED='USERCONNECTED';


export function miseajourDispo(){
	return{
		type:MAJDISPO
	}
}
export function userconnected(userobj){
	return{
		type:USERCONNECTED,
		user:userobj
	}
}
