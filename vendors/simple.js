const SIZE = 9;
const BSIZE = 3;

const getEmptyArray = (size, size2) => {
    return Array(size).fill(0).map(el => Array(size2).fill(0));
};

const getB = (i, j) => {
    return Math.floor(i / BSIZE) * BSIZE + Math.floor(j / BSIZE);
}

export default class {
    constructor(datas) {
        this.datas = datas;

        this.h = getEmptyArray(9, 10); // 水平有这个数字
        this.v = getEmptyArray(9, 10); // 垂直有这个数字
        this.b = getEmptyArray(9, 10); // 此宫有这个数字
    }

    isRepeat(i, j, v) {
        return this.h[i][v] ||
            this.v[j][v] ||
            this.b[getB(i, j)][v];
    }

    solve() {
        this.datas.map((row, i) => {
            row.map((node, j) => {
                if (node) {
                    this.h[i][node] = true;
                    this.v[j][node] = true;
                    this.b[getB(i, j)][node] = true;
                }
            });
        });

        let _solve = (i, j) => {
            if (i === SIZE) { // 遍历完毕
                return true;
            }
            if (j === SIZE) { // 最后一列
                return _solve(i + 1, 0);
            }

            if (this.datas[i][j] !== 0) { // 有数，跳过
                return _solve(i, j + 1);
            }

            for (let t = 1; t <= SIZE; ++t) {
                if (!this.isRepeat(i, j, t)) { // 是否合法
                    this.h[i][t] = true;
                    this.v[j][t] = true;
                    this.b[getB(i, j)][t] = true;
                    this.datas[i][j] = t;

                    if (_solve(i, j + 1)) { // 尝试下一个
                        return true;
                    } else {
                        this.h[i][t] = false;
                        this.v[j][t] = false;
                        this.b[getB(i, j)][t] = false;
                        this.datas[i][j] = 0;
                    }
                }
            }

        }

        _solve(0, 0);

        return this.datas;
    }
}