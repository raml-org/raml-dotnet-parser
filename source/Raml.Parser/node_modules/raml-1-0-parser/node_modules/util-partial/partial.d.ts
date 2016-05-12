// Five arguments.
declare function partial <A, B, C, D, E, T> (fn: (a: A, b: B, c: C, d: D, e: E) => T): (a: A, b: B, c: C, d: D, e: E) => T;
declare function partial <A, B, C, D, E, T> (fn: (a: A, b: B, c: C, d: D, e: E) => T, a: A): (b: B, c: C, d: D, e: E) => T;
declare function partial <A, B, C, D, E, T> (fn: (a: A, b: B, c: C, d: D, e: E) => T, a: A, b: B): (c: C, d: D, e: E) => T;
declare function partial <A, B, C, D, E, T> (fn: (a: A, b: B, c: C, d: D, e: E) => T, a: A, b: B, c: C): (d: D, e: E) => T;
declare function partial <A, B, C, D, E, T> (fn: (a: A, b: B, c: C, d: D, e: E) => T, a: A, b: B, c: C, d: D): (e: E) => T;
declare function partial <A, B, C, D, E, T> (fn: (a: A, b: B, c: C, d: D, e: E) => T, a: A, b: B, c: C, d: D, e: E): () => T;

// Four arguments.
declare function partial <A, B, C, D, T> (fn: (a: A, b: B, c: C, d: D) => T): (a: A, b: B, c: C, d: D) => T;
declare function partial <A, B, C, D, T> (fn: (a: A, b: B, c: C, d: D) => T, a: A): (b: B, c: C, d: D) => T;
declare function partial <A, B, C, D, T> (fn: (a: A, b: B, c: C, d: D) => T, a: A, b: B): (c: C, d: D) => T;
declare function partial <A, B, C, D, T> (fn: (a: A, b: B, c: C, d: D) => T, a: A, b: B, c: C): (d: D) => T;
declare function partial <A, B, C, D, T> (fn: (a: A, b: B, c: C, d: D) => T, a: A, b: B, c: C, d: D): () => T;

// Three arguments.
declare function partial <A, B, C, T> (fn: (a: A, b: B, c: C) => T): (a: A, b: B, c: C) => T;
declare function partial <A, B, C, T> (fn: (a: A, b: B, c: C) => T, a: A): (b: B, c: C) => T;
declare function partial <A, B, C, T> (fn: (a: A, b: B, c: C) => T, a: A, b: B): (c: C) => T;
declare function partial <A, B, C, T> (fn: (a: A, b: B, c: C) => T, a: A, b: B, c: C): () => T;

// Two arguments.
declare function partial <A, B, T> (fn: (a: A, b: B) => T): (a: A, b: B) => T;
declare function partial <A, B, T> (fn: (a: A, b: B) => T, a: A): (b: B) => T;
declare function partial <A, B, T> (fn: (a: A, b: B) => T, a: A, b: B): () => T;

// One argument.
declare function partial <A, T> (fn: (a: A) => T): (a: A) => T;
declare function partial <A, T> (fn: (a: A) => T, a: A): () => T;

// Any arguments.
declare function partial <T> (fn: (...args: any[]) => T): (...args: any[]) => T;

export = partial;
