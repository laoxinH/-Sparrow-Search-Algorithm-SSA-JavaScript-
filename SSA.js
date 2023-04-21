/**
 * SSA 麻雀搜索算法
 * @Auther laoxin
 * @Email thixin@qq.com
 * @Data  2023/4/10
 *
 */

export default class SSA {
    func = undefined; // 待搜索的函数
    dim = undefined;  // 维度数(变量数)
    popSize = 20;     // 种群数量
    maxIter = 50;      // 最大迭代数
    lb = [];            // 变量下届
    ub = [];            // 变量上界
    verbose = false;    // 是否打印每次迭代结果
    constructor(func = function (x = []) {}, dim, popSize = 20, maxIter = 50, lb = [], ub = [], verbose = false) {
        this.func = func;
        this.dim = dim;
        this.popSize = popSize;
        this.maxIter = maxIter;
        this.lb = lb;
        this.ub = ub;
        this.verbose = verbose;
        const Ppercent = 0.2;  //生产者的人口规模占人口规模的20%
        const Dpercent = 0.1;  //预警者的人口规模占人口规模的10%
        this.pNum = Math.round(this.popSize * Ppercent);
        this.warn = Math.round(this.popSize * Dpercent);

        if (this.lb.length != this.dim || this.ub.length != this.dim) throw new Error("上下界变量数需与维度数不一致");
        for (let i = 0; i < this.lb.length; i++) {
            if (this.lb[i] > this.ub[i]) throw new Error("变量下届需要小于变量上界 " + this.lb[i] + " " + this.ub[i]);
        }
        this.X = this._uniform(this.lb, this.ub, this.popSize);

        this.Y = new Array(this.popSize);
        for (let i = 0; i < this.X.length; i++) {
            this.Y[i] = func(this.X[i]);
        }
        this.pbestX = this.X.concat();
        this.pbestY = new Array(this.popSize).fill(Infinity);
        this._gbestX = this._mean(this.pbestX);
        this._gbestY = Infinity;
        this._gbestYHist = [];   // 储存每次迭代的Y值
        this._updatePbest();
        this._updateGbest();
        this.recordMode = false;
        this.recordValue = {"X": [], "V": [], "Y": []};
        this._bestX = this._gbestX;
        this._bestY = this._gbestY;
        this.idxMax = 0;
        this.xMax = this.X[this.idxMax];
        this.yMax = this.Y[this.idxMax];

    }

    _calY(start, end) {
        for (let i = start; i < end; i++) {
            this.Y[i] = this.func(this.X[i]);
        }
    }

    _updatePbest() {
        for (let i = 0; i < this.Y.length; i++) {
            if (this.pbestY[i] > this.Y[i]) {
                this.pbestX[i] = this.X[i];
                this.pbestY[i] = this.Y[i];
            }
        }
    }

    _updateGbest() {
        const idxMin = this.pbestY.indexOf(Math.min(...this.pbestY));

        if (this._gbestY > this.pbestY[idxMin]) {
            this._gbestX = this.X[idxMin].concat();
            this._gbestY = this.pbestY[idxMin];
        }
    }

    _findWorst() {
        this.idxMax = this.Y.indexOf(Math.max(...this.Y));
        this.xMax = this.X[this.idxMax];
        this.yMax = this.Y[this.idxMax];

    }

    _updateFinder(iterNum) {
        this.idx = this._sortX(this.Y);
        const temp = [];
        for (let idx of this.idx) {
            temp.push(idx.id);
        }
        this.idx = temp;
        // 更新探索者位置

        for (let i = 0; i < this.pNum; i++) {
            const r2 = Math.random();  // 预警值
            if (r2 < 0.8) {
                const r1 = Math.random();
                // 对自变量做出随机变换
                const temp = this.X[this.idx[i]].concat();
                for (let j = 0; j < temp.length; j++) {
                    temp[j] = temp[j] * Math.exp(-iterNum / (r1 * this.maxIter));
                }
                this.X[this.idx[i]] = temp;
            } else {
                const Q = this._getNumberInNormalDistribution(0, 1);
                const temp = this.X[this.idx[i]].concat();
                for (let j = 0; j < temp.length; j++) {
                    temp[j] = temp[j] + Q;
                }
                this.X[this.idx[i]] = temp;
            }

        }
        this.X = this._clip(this.X, this.lb, this.ub);  // 对超过边界的变量进行去除
        this._calY(0, this.pNum);
    }

    _updateFollower() {
        // 加入者位置更新
        for (let ii = 0; ii < this.popSize - this.pNum; ii++) {
            const i = ii + this.pNum;
            const A = new Array(this.dim);

            for (let j = 0; j < A.length; j++) {
                A[j] = Math.floor(Math.random() * 2) * 2 - 1;
            }
            const bestIdx = this.Y.slice(0, this.pNum).indexOf(Math.min(...this.Y.slice(0, this.pNum)));
            const bestXX = this.X[bestIdx];

            if (i > this.popSize / 2) {
                const Q = Math.random();
                this.X[this.idx[i]].forEach((value, index, arr) => {
                    arr[index] = Q * Math.exp((this.xMax[index] - arr[index]) / (i ** 2));
                });
            } else {
                const a = [this.X[this.idx[i]].concat()];
                const aT = this._transpose(a);
                const aaT = this._multiply(a, aT);
                const b = [new Array(3).fill(1)];
                const c = this._multiply(aT, aaT)
                c.forEach((value, index, array) => {
                    array[index] = [1 / value];
                })
                const d = this._multiply(c, b);
                const e = a.concat();
                e[0].forEach((value, index, array) => {
                    array[index] = Math.abs(value - bestXX);
                })
                const f = this._multiply(e, d)
                f[0].forEach((value, index, array) => {
                    array[index] = value + bestXX;
                });
            }
        }

        this.X = this._clip(this.X, this.lb, this.ub);
        this._calY(this.pNum, this.popSize);
    }

    _detect() {
        const arrc = new Array(this.popSize);
        for (let i = 0; i < arrc.length; i++) {
            arrc[i] = i;
        }
        const c = arrc.sort(function () {
            return Math.random() - 0.5;
        });

        const e = 10e-10;
        const b = [];
        c.slice(0, this.warn).forEach(value => {
            b.push(this.idx[value]);
        });
        for (let j = 0; j < b.length; j++) {
            if (this.Y[b[j]] > this._gbestY) {
                const temp = new Array(this.dim);
                for (let i = 0; i < temp.length; i++) {
                    temp[i] = this._getNumberInNormalDistribution(0, 1);
                }

                const temp2 = this.X[b[j]].concat();
                temp2.forEach((value, index, arr) => {
                    arr[index] = this._gbestX[index] + temp[index] * Math.abs(value - this._gbestX[index]);

                });
                this.X[b[j]] = temp2;

            } else {
                this.X[b[j]].forEach((value, index, arr) => {
                    arr[index] = value + (2 * Math.random() - 1) * Math.abs(value - this.xMax[index]) / (this.func(this.X[b[j]]) - this.yMax + e)
                })
            }
            this.X = this._clip(this.X, this.lb, this.ub);
            this.Y[b[j]] = this.func(this.X[b[j]]);

        }
    }

    run(maxIter) {
        this.maxIter = maxIter || this.maxIter;
        for (let i = 0; i < this.maxIter; i++) {
            this._updateFinder(i);
            this._findWorst();
            this._updateFollower();
            this._updatePbest();
            this._updateGbest();
            this._findWorst();
            this._detect();
            this._updatePbest();
            this._updateGbest();
            this._gbestYHist.push(this._gbestY);
        }
    }

    // 生成满足条件的均匀分布数组
    _uniform(low, high, size = 0) {
        if (low.length != high.length) throw new Error("上下届变量数不一致!")
        const m = low.length;
        const result = new Array(size);
        for (let i = 0; i < result.length; i++) {
            result[i] = new Array(low.length);
        }
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < m; j++) {
                result[i][j] = Math.random() * (high[j] - low[j]) + low[j];
            }
        }
        return result;
    }

    // 求多维数组平均值
    _mean(arr = []) {
        let result = []
        for (let i = 0; i < arr[0].length; i++) {
            let sum1 = 0;
            for (let j = 0; j < arr.length; j++) {
                sum1 += arr[j][i] / arr.length;
            }
            result.push(sum1);
        }
        return result;
    }

    // 对数组排序并标注索引
    _sortX(arr = [20, 10, 40]) {
        let result = new Array(arr.length);
        for (let i = 0; i < arr.length; i++) {
            result[i] = {};
            result[i].id = i;
            result[i].value = arr[i]
        }
        return result.sort((a, b) => {
            return a.value - b.value
        })
    }
    // 矩阵转置
    _transpose (arr) {
        const result = new Array(arr[0].length);
        for (let i = 0; i < arr[0].length; i++) {
            result[i] = new Array(arr.length);

            for (let j = 0; j < arr.length; j++) {
                result[i][j] = arr[j][i];
            }
        }
        return result;
    };

    // 矩阵乘法
    _multiply(arrA, arrB) {
        if (arrA[0].length !== arrB.length) {
            throw new Error("Matrix mismatch");
        }

        const result = new Array(arrA.length);

        for (let x = 0; x < arrA.length; x++) {
            result[x] = new Array(arrB[0].length);
        }

        let arrB_T = this._transpose(arrB);

        for (let i = 0; i < result.length; i++) {
            for (let j = 0; j < result[i].length; j++) {
                result[i][j] = this._dotproduct(arrA[i], arrB_T[j]);
            }
        }
        return result;
    };

    _dotproduct(vectorA, vectorB) {
        if (vectorA.length !== vectorB.length) {
            throw new Error("Vector mismatch");
        }
        let result = 0;
        for (let i = 0; i < vectorA.length; i++) {
            result += vectorA[i] * vectorB[i];
        }
        return result;
    };
    // 生成正态分布随机数
    _getNumberInNormalDistribution(mean, std_dev) {
        return mean + (this._randomNormalDistribution() * std_dev);
    }

    _randomNormalDistribution() {
        let u = 0.0, v = 0.0, w = 0.0, c = 0.0;
        do {
            //获得两个（-1,1）的独立随机变量
            u = Math.random() * 2 - 1.0;
            v = Math.random() * 2 - 1.0;
            w = u * u + v * v;
        } while (w == 0.0 || w >= 1.0)
        //这里就是 Box-Muller转换
        c = Math.sqrt((-2 * Math.log(w)) / w);
        //返回2个标准正态分布的随机数，封装进一个数组返回
        //当然，因为这个函数运行较快，也可以扔掉一个
        //return [u*c,v*c];
        return u * c;
    }

    // 去除不满足上下界的变量
    _clip(arr = [], lb = [], ub = []) {
        const arrCopy = arr.concat();
        for (let i = 0; i < lb.length; i++) {
            for (let j = 0; j < arr.length; j++) {
                arrCopy[j][i] = arr[j][i] > ub[i] ? ub[i] : arr[j][i];
                arrCopy[j][i] = arr[j][i] < lb[i] ? lb[i] : arr[j][i];
            }
        }
        return arrCopy;
    }

    get gbestX() {
        return this._gbestX;
    }

    get gbestY() {
        return this._gbestY;
    }

    get gbestYHist() {
        return this._gbestYHist;
    }
}
