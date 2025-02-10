/*
 * Taken from disjoint-set-ds
 * from https://github.com/dranidis/disjoint-set-ds
 */

export class DisjointSetArray {
    private parent: number[] = [];
    private size = 0;

    constructor(size?: number) {
        this.size = size || 0;
        for (let i = 0; i < this.size; i++) {
            this.parent.push(i);
        }
    }

    makeSet(): number {
        this.parent.push(this.size);
        this.size++;
        return this.size - 1;
    }

    find(x: number): number {
        if (this.parent[x] !== x) {
            this.parent[x] = this.find(this.parent[x]);
            return this.parent[x];
        } else {
            return x;
        }
    }

    union(x: number, y: number): void {
        x = this.find(x);
        y = this.find(y);

        if (x === y) return;

        this.parent[y] = x;
    }
}
