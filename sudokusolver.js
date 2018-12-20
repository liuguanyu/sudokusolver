import {
    SimpleSolver
} from './vendors/index.js';

class SudokuSolver {
    constructor(datas) {
        this.datas = [...datas].map(el => [...el]);
        this.vendor = new SimpleSolver(datas);
    }

    solve() {
        return {
            mydatas: this.datas,
            solves: this.vendor.solve(this.datas),
        };
    }
}

export default SudokuSolver;