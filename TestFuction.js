import SSA from "SSA.js";
import {basicLine} from "chats.js";

let dim = 30;
let lb = new Array(dim).fill(-10);
let ub = new Array(dim).fill(10);

function fu(x) {
    let a = 20
    let b = 0.2
    let c = 2 * Math.PI
    let s1 = 0
    let s2 = 0
    let result = 0;
    for (let i = 0; i < x.length; i++) {
        s1 += x[i] ** 2
        s2 += Math.cos(c * x[i])
    }
    s1 = -a * Math.exp(-b * Math.sqrt(s1 / x.length));
    s2 = -Math.exp(s2 / x.length)
    result = s1 + s2 + a + Math.exp(1)
    return result
}

let start = new Date().getTime();
let ssa = new SSA(fu, dim, 100, 50, lb = lb, ub = ub);
ssa.run();
let end = new Date().getTime();
console.log("寻优耗时:", (end - start) / 1000);
console.log("++++++++++++++++++++");
console.log("最优X值",ssa.gbestX);
console.log("最优Y值",ssa.gbestY);
console.log("Y迭代历史",ssa.gbestYHist);
basicLine(ssa.gbestYHist);
