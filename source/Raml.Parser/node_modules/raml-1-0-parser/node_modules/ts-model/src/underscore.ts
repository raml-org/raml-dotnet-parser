/// <reference path="../typings/main.d.ts" />
import _=require("underscore");

export interface ListIterator<T, TResult> {
    (value: T, index: number, list: T[]): TResult;
}

export function find<T>(t:T[],it:ListIterator<T,boolean>):T{
    return _.find(t,it);
}

export function filter<T>(t:T[],it:ListIterator<T,boolean>):T[]{
    return _.filter(t,it);
}
export function unique<T>(t:T[]):T[]{
    return _.unique(t);
}

export function sortBy<T>(t:T[],field:string):T[]{
    return _.sortBy(t,field);
}