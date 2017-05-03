Array.prototype.sum=(prop)=>{
    let total=0;
    for(let i=0,_len=this.length;i<_len;i++){
        total+=this[i][prop];
    }
    return total;
};