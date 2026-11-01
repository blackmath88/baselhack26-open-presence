const assert=require('node:assert/strict');
const {nand,halfAdder}=require('./weird.js');
for(let a=0;a<65536;a++){
 for(const b of [0,65535,0x5555,0xaaaa,a^0xffff]){
  const r=halfAdder(a,b);
  assert.equal(r.sum,a^b);assert.equal(r.carry,a&b);
  assert.equal(nand(a,b),(~(a&b))&65535);
 }
}
console.log('327680 bitmap pairs: NAND network matches XOR and AND at every pixel.');
