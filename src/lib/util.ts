
export namespace Utils {
    export const isNumber = (x: any): x is number => !Number.isNaN(Number(x));
    export const toNumber = (x: any): number => isNumber(x) ? Number(x) : 0;
    export const formToDict = (form: FormData) => Array.from(form.entries())
        .filter(val => typeof val[1] === "string")
        .reduce((obj, val) => ({ ...obj, [val[0]]: val[1] }), {} as any)
}