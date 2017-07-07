export const MAJDISPO='MAJDISPO';
export const USERCONNECTED='USERCONNECTED';
export const EXTOEXLEND='EXTOEXLEND';
export const JEVALIDETOUT='JEVALIDETOUT';


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
export function toutEstValid(){
	return{
		type:JEVALIDETOUT,
	}
}
export function shouldExtractAgresso(){
	return{
		type:EXTOEXLEND,
	}
}
