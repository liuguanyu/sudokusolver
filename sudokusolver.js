const SIZE = 9;

const isArray = (obj) => {
    return obj.indexOf !== undefined
}

class SudokuSolver {
    constructor(datas) {
        this.datas = datas;
        this.solves = Array(SIZE).fill(0).map(_ => Array(SIZE).fill(0).map(__ => [1, 2, 3, 4, 5, 6, 7, 8, 9]));
        this.tries = [];
    }

    isEnd() {
        for (let i = 0; i < SIZE; ++i) {
            for (let j = 0; j < SIZE; ++j) {
                if (isArray(this.solves[i][j])) {
                    return false;
                }
            }
        }
        return true;
    }

    confirmSelfSolve(cell, i, j) {
        this.solves[i][j] = cell;
    }

    scanHorizon(cell, i, j) {
        let horizon = this.solves[i];

        for (let n = 0; n < SIZE; ++n) {
            if (n != j && isArray(horizon[n])) {
                let idx = horizon[n].indexOf(cell);
                if (idx !== -1) {
                    horizon[n].splice(idx, 1)
                }
            }
        }

        this.solves[i] = horizon;
    }

    scanVerticle(cell, i, j) {
        for (let n = 0; n < SIZE; ++n) {
            if (n != i && isArray(this.solves[n][j])) {
                let idx = this.solves[n][j].indexOf(cell);
                if (idx !== -1) {
                    this.solves[n][j].splice(idx, 1)
                }
            }
        }
    }

    scanMyCube(cell, i, j) {
        let hStart = Math.floor(i / 3);
        let vStart = Math.floor(j / 3);

        for (let m = hStart * 3; m < hStart * 3 + 3; ++m) {
            for (let n = vStart * 3; n < vStart * 3 + 3; ++n) {
                if (m != i && n != j && isArray(this.solves[m][n])) {
                    let idx = this.solves[m][n].indexOf(cell);
                    if (idx !== -1) {
                        this.solves[m][n].splice(idx, 1)
                    }
                }
            }
        }
    }


    minimizeSolves() {
        this.datas.forEach((rows, i) => {
            rows.forEach((cell, j) => {
                if (cell) {
                    this.confirmSelfSolve(cell, i, j);
                    this.scanHorizon(cell, i, j);
                    this.scanVerticle(cell, i, j);
                    this.scanMyCube(cell, i, j);
                }
            })
        });
    }

    trySolve() {
        let solves = this.solves;
        let multis = [];
        let tryStack = [];
        let minusStack = [];

        let makeATry = (multi, k, l) => {
            console.log(`第${k}个多解的第${l}个方案`);
            console.log(`现在，第${k}个多解的所有方案`, multi.solve.join(","));
            let solve = multi.solve[l];

            let aTry = {
                i: multi.i,
                j: multi.j,
                solve,
                idx: k,
                solveIdx: l,
                prev: multi.solve
            };

            solves[multi.i][multi.j] = solve; // 解决方案试算
            tryStack.push(aTry); // 解决栈加入

            multis[k].solve = solve; // 本身加入
            console.log("try", multi.i, multi.j, solve);
        }

        let undo = () => {
            let cancleOps = minusStack.pop(); // 削减操作栈退栈
            for (let i = 0; i < cancleOps.length; ++i) {
                let node = cancleOps[i];

                multis[node.idx].solve = Array.from(new Set(multis[node.idx].solve.concat([node.minus]).sort())); // 回位
            }

            let cancleTry = tryStack.pop(); // tryStack退栈
            solves[cancleTry.i][cancleTry.j] = cancleTry.prev; // 解决方案恢复原样
            multis[cancleTry.idx].solve = cancleTry.prev; // 本身恢复

            console.log("undo", solves[cancleTry.i][cancleTry.j], multis[26].solve, 200);

            return {
                idx: cancleTry.idx,
                solveIdx: cancleTry.solveIdx
            }
        }

        let minusFollowSolves = (k, solve) => {
            let me = multis[k];

            let ops = [];

            let pushOps = (i, idx, solve) => {
                ops.push({
                    idx: i,
                    minus: solve
                });

                multis[i].solve.splice(idx, 1);
            }

            for (let i = k + 1; i < multis.length; ++i) {
                let idx = multis[i].solve.indexOf(solve);

                let meI = Math.floor(me.i / 3);
                let meJ = Math.floor(me.j / 3);
                let fI = Math.floor(multis[i].i / 3);
                let fJ = Math.floor(multis[i].j / 3);

                if (me.i == multis[i].i && idx !== -1) { // 横排同数去掉。
                    pushOps(i, idx, solve);
                } else if (me.j == multis[i].j && idx !== -1) { // 竖排同数去掉。
                    pushOps(i, idx, solve);
                } else if (meI == fI && meJ == fJ && idx !== -1) { // 同方块同数去掉。
                    pushOps(i, idx, solve);
                }
            }

            minusStack.push(ops);

            for (let i = 0; i < multis.length; ++i) {
                if (multis[i].solve.length == 0) {
                    console.log(multis[i].i, multis[i].j, multis[i].solve, "方案无解，须退回");
                    return false;
                }
            }

            return true;
        }

        for (let i = 0; i < SIZE; ++i) {
            for (let j = 0; j < SIZE; ++j) {
                if (isArray(solves[i][j])) {
                    multis.push({
                        i,
                        j,
                        solve: solves[i][j]
                    })
                }
            }
        }

        let k = 0,
            l = 0,
            solve;

        do {
            if (k >= multis.length) {
                if (!this.isEnd()) {
                    let info = undo();
                    let lastK = info.idx;
                    let lastL = info.solveIdx;
                    while (info.idx === k) { // 一直回退到上一个多解
                        info = undo()
                    }
                    k = info.idx;
                    l = info.solveIdx;
                    l++;
                } else {
                    break;
                }
            }
            if (l < multis[k].solve.length) { // 有方案可试
                solve = multis[k].solve[l]; // 取最近一个方案
                makeATry(multis[k], k, l);

                if (!minusFollowSolves(k, solve)) { // 方案不可行
                    console.log("回退1");
                    let info = undo(); // 回退
                    let lastK = info.idx;
                    let lastL = info.solveIdx;

                    if (lastL >= multis[lastK].solve.length - 1) { // 这个多解不行，需要再回溯
                        while (info.idx === k) { // 一直回退到上一个多解
                            console.log("回退2");
                            info = undo()
                        }

                        k = info.idx;
                        l = info.solveIdx;
                    } else { // 以上一个解为起点，向前尝试解方案。
                        k = lastK;
                        l = lastL;
                    }
                    l++;
                } else { // 向前走一个多解
                    k++;
                    l = 0;
                }
            } else { // 当前多解都试过，前进多解
                k++;
                l = 0;
            }
        } while (tryStack.length !== 0)

        return {
            mydatas: this.datas,
            solves: this.solves
        };
    }

    solve() {
        this.minimizeSolves();
        return this.trySolve();
    }
}

export default SudokuSolver;