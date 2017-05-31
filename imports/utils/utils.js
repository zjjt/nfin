Array.prototype.sum=(prop)=>{
    let total=0;
    for(let i=0,_len=this.length;i<_len;i++){
        total+=this[i][prop];
    }
    return total;
};

let transformInFrenchDate=(e)=>{
    let day=e.substring(6);
    let mois=e.substring(4,6);
    let year=e.substring(0,4);
    let date=`${day}/${mois}/${year}`;
    return date;
};

export {transformInFrenchDate};