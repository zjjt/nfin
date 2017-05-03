export const ADMINCONNECTION='ADMINCONNECTION';
export const ADMINDECONNECTION='ADMINDECONNECTION';
export const DELUSER='DELUSER';
export const SETUSERCODES='SETUSERCODES';

export function connection(){
	return{
		type:ADMINCONNECTION
	}
}
export function deconnection(){
	return{
		type:ADMINDECONNECTION
	}
}
export function deluser(){
	return{
		type:DELUSER
	}
}
export function setUserCodes(userCodes){
	return{
		type:SETUSERCODES,
		userCodes
	}
}