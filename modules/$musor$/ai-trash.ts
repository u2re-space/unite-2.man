//
export const radixSort = (arr: number[]): number[]=>{
    const max = Math.max(...arr);
    const digits = Math.floor(Math.log10(max)) + 1;
    for (let i = 0; i < digits; i++) {
        const buckets: number[][] = Array.from({length: 10}, ()=>[]);
        for (const num of arr) {
            const digit = Math.floor(num / Math.pow(10, i)) % 10;
            buckets[digit].push(num);
        }
        arr = buckets.flat();
    }
    return arr;
}
