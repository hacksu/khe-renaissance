
export namespace Utils {
    export const isNumber = (x: any): x is number => !Number.isNaN(Number(x));
    export const toNumber = (x: any): number => isNumber(x) ? Number(x) : 0;
}