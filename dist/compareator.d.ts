export declare class Compareator {
    constructor();
    CompareMasterToSlaveStringArray(MasterStringArray: CustomeRangeIndex[], SlaveStringArray: CustomeRangeIndex[], compareOptions: CompareOptions): IMasterToSlaveStringArrayResult[];
    MultipleRangesComparsion(startRange: number, EndRange: number, step: number, masters: CustomeRangeIndex[], slaves: CustomeRangeIndex[], compareOptions: CompareOptions): IMasterToSlaveStringArrayResult[][];
    getElementsFromTo: (from: number, to: number, arr: CustomeRangeIndex[]) => any[];
    filterOutliers(someArray: any[], magnitude?: number): any[];
    CompareMasterToSlaveString(MasterString: string, SlaveString: string, arabic: boolean, ignore: string[]): SimpleSimilarity;
    MatchStringToWord(str: string, arabic: any, arr: string[]): any[];
    RemoveCommoneWords(word: string, arr: string[]): string;
    arrToRegEx(arrStr: string[]): RegExp;
    RemoverWordsFromString(str: string, arr: string[]): string;
    CompareMatches(matches?: {
        a: any[];
        b: any[];
    }): SimpleSimilarity;
    CalculateSimilarity(matchingResults: IWordMatchingResult[]): {
        foundPrecentage: number;
        sekew: number;
    };
    isArrayEmpty(arr: any[]): boolean;
}
export interface IMasterToSlaveStringArrayResult {
    biggestSimpleSimilarity: IndexAndSimilarty;
    slaveClosest?: IndexAndSimilarty;
    slaveExcpected: IndexAndSimilarty;
    masterIndex: number;
    slaveIndexs?: IndexAndSimilarty[];
    found: boolean;
    slaveCloseToIndex?: IndexAndSimilarty[];
    zeroedResult: boolean;
    edited?: boolean;
}
export interface IndexAndSimilarty {
    index: number;
    similarity: SimpleSimilarity;
}
export interface SimpleSimilarity {
    foundPrecentage: number;
    sekew: number;
}
interface IWordMatchingResult {
    found: boolean;
    index: number;
}
export interface CustomeRangeIndex {
    index: number;
    string: string;
}
export declare class CompareOptions {
    PrcentageThreshHold: number;
    arabic: boolean;
    useRangeOnly: boolean;
    diffrence: number;
    useDynamicRange: boolean;
    outliersMagnitude: number;
    ignores: string[];
    RefrenceDiffrences: number;
}
export {};
//# sourceMappingURL=compareator.d.ts.map