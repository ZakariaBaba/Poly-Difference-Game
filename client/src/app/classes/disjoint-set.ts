/*
 * Based on disjoint-set-ds
 * from https://github.com/dranidis/disjoint-set-ds
 */

import { DisjointSetArray } from '@app/classes/disjoint-set-array';

export class DisjointSet<T> {
    private position: Map<T, number> = new Map();
    private disjointSetArray = new DisjointSetArray();
    private elements: T[] = [];

    getSize(): number {
        return this.elements.length;
    }

    clear(): void {
        this.position = new Map();
        this.disjointSetArray = new DisjointSetArray();
        this.elements = [];
    }

    makeSet(element: T): void {
        if (this.position.has(element)) return;

        const index = this.disjointSetArray.makeSet();

        this.position.set(element, index);
        this.elements.push(element);
    }

    find(element: T): T {
        const index = this.position.get(element);
        if (index === undefined) throw new Error('Element ' + element + ' not found!');
        const p = this.disjointSetArray.find(index);
        return this.elements[p];
    }

    union(element1: T, element2: T): void {
        const index1 = this.position.get(element1);
        const index2 = this.position.get(element2);
        if (index1 === undefined) throw new Error('Element ' + element1 + ' not found!');
        if (index2 === undefined) throw new Error('Element ' + element2 + ' not found!');

        this.disjointSetArray.union(index1, index2);
    }
    getSetsContent(): Map<T, T[]> {
        const content: Map<T, T[]> = new Map();
        this.elements.forEach((value) => {
            const key = this.find(value);
            const previousContent = content.get(key);
            if (previousContent) {
                previousContent.push(value);
            } else {
                content.set(key, [value]);
            }
        });
        return content;
    }
}
