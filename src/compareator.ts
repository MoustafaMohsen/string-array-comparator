import { performance } from "perf_hooks";

export class Compareator {
  constructor() {}

  CompareMasterToSlaveStringArray(
    MasterStringArray: CustomeRangeIndex[],
    SlaveStringArray: CustomeRangeIndex[],
    compareOptions:CompareOptions
  ) {
    let PrcentageThreshHold: number = compareOptions.PrcentageThreshHold
    let arabic: boolean= compareOptions.arabic
    let useRangeOnly: boolean =  compareOptions.useRangeOnly
    let  diffrence: number= compareOptions.diffrence
    let useDynamicRange: boolean = compareOptions.useDynamicRange
    let outliersMagnitude: number = compareOptions.outliersMagnitude
    let ignores: string[] =  compareOptions.ignores
    let RefrenceDiffrences: number= compareOptions.RefrenceDiffrences

    // Check if array is empty
    if (
      this.isArrayEmpty(MasterStringArray) == true ||
      this.isArrayEmpty(SlaveStringArray) == true
    ) {
      return null;
    }
    //=====Calculate Proggress
    var rem10 = (remaning: number[]) => {
      let c = 0;
      remaning.forEach(x => {
        c = x ? x + c : c;
      });
      return c / remaning.length;
    };
    var round = number => {
      return parseFloat(Math.round(number * 100).toFixed(2)) / 100;
    };
    let lastPreformance: number; //Calculate Proggress
    let last10Remanings = []; //Calculate Proggress
    //Calculate Proggress=====

    //Initialing Return array
    let FinalResultsArray: IMasterToSlaveStringArrayResult[] = [];
    let last20Diffrences: number[] = [];
    let SmallestPercentage = 1;
    let SmallestSkew = 1;
    let SmallestIndexes = { master: null, slave: null };
    let notfoundsCount = 0;
    var abs = (number: number) => {
      let num = Math.abs(number);
      num = num ? num : null;
      return num;
    };
    var countnumbers = (arr: number[]) => {
      let count = 0;
      for (let i = 0; i < arr.length; i++) {
        const n = arr[i];
        count += n;
      }
      return count;
    };
    var avrageToMedian = (arr: number[]) => {
      let length = arr.length ? arr.length : 1;
      let sum = countnumbers(arr);
      return sum / length;
    };
    // Looping through the Master Array to match every elemnt in the master
    // array with every element  slave array
    for (let i = 0; i < MasterStringArray.length; i++) {
      let medianSlaveIndex: number;
      // if use dynamic range then get the last average madian
      if (useDynamicRange) {
        let filteredValues: number[] = this.filterOutliers(
          last20Diffrences,
          outliersMagnitude
        );
        medianSlaveIndex = avrageToMedian(filteredValues);
      }
      //=====Calculate Proggress
      let nowperformance = performance.now();
      let diff = nowperformance - lastPreformance;
      let CurretnremainingTime = ((MasterStringArray.length - i) * diff) / 1000;
      lastPreformance = nowperformance;
      if (last10Remanings.length > 20) {
        last10Remanings.shift();
      }
      last10Remanings.push(CurretnremainingTime);
      let remainingTime = rem10(last10Remanings);
      if (i > 0) {
        let StatusMessage = `Current Element:${i}, prog:${round(
          (i / MasterStringArray.length) * 100
        ).toFixed(2)}%, last Request took:${round(diff).toFixed(
          2
        )} Millisecond, remaining time: ${round(remainingTime).toFixed(2)} 
                SmallestPercentage:${SmallestPercentage}, SmallestSkew:${SmallestSkew}, in Master:${
          SmallestIndexes.master
        }, Slave:${SmallestIndexes.slave}
                \n`;
        //once Every 10 times
        if (i % 100 === 0) {
          if (useRangeOnly)
            process.stderr.write(`[${diffrence}]${StatusMessage}`);
          if (useDynamicRange)
            process.stderr.write(`[DynamicRange]${StatusMessage}`);
          if (!useRangeOnly && !useDynamicRange)
            process.stderr.write(`[fullMode]${StatusMessage}`);
        }
      } else {
        process.stderr.write(
          `Started, Current Element:${i}, prog:${round(
            (i / MasterStringArray.length) * 100
          ).toFixed(2)}%\n`
        );
      }
      //Calculate Proggress=====
      const MasterCustomIndex = MasterStringArray[i].index;
      const MasterString = MasterStringArray[i].string;
      let BiggestSimilarity: SimpleSimilarity = {
        foundPrecentage: 0,
        sekew: 0
      };
      let MasterToSlaveStringArrayResult: IMasterToSlaveStringArrayResult = {
        masterIndex: MasterCustomIndex,
        slaveExcpected: {
          index: null,
          similarity: BiggestSimilarity
        },
        found: false,
        biggestSimpleSimilarity: {
          index: null,
          similarity: BiggestSimilarity
        },
        slaveIndexs: [],
        slaveClosest: {
          index: null,
          similarity: {
            foundPrecentage: null,
            sekew: null
          }
        },
        slaveCloseToIndex: [],
        zeroedResult: false
      };
      let slaveIndexs: IndexAndSimilarty[] = [];
      let CloseIndexesResults: IndexAndSimilarty[] = [];
      let slaveExcpected: IndexAndSimilarty;

      // ==== Compare Master Element To Array of Slave Elements === //
      for (let i2 = 0; i2 < SlaveStringArray.length; i2++) {
        const SlaveString = SlaveStringArray[i2].string; //Slave String
        const SlaveCusomIndex = SlaveStringArray[i2].index; //Slave index
        let diff = abs(SlaveCusomIndex - MasterCustomIndex); //Diffrence In Range
        let inRange = false;
        // test in range in raneg only mode
        if (useRangeOnly) {
          inRange = diff != null && diff <= diffrence; // is In Range
        }
        // test in range in dynamic range mode
        if (useDynamicRange) {
          let currenctDiffrence = abs(medianSlaveIndex - SlaveCusomIndex);
          inRange = currenctDiffrence <= diffrence;
        }

        var Compare = () => {
          let Result = this.CompareMasterToSlaveString(
            MasterString,
            SlaveString,
            arabic,
            ignores
          );
          let isZeroed = Result.foundPrecentage == 0; //is it's not found at all
          // TODO: Set threshhold for skew and found
          let _found =
            Result.foundPrecentage > PrcentageThreshHold ||
            Result.sekew > PrcentageThreshHold;
          // if it's a zeroed results
          if (isZeroed) {
            MasterToSlaveStringArrayResult.zeroedResult = true;
          }
          // Log the biggest Similarity
          if (
            Result.foundPrecentage > BiggestSimilarity.foundPrecentage ||
            Result.sekew > BiggestSimilarity.sekew
          ) {
            BiggestSimilarity = Result;
          }
          //If it's bigger than Threshhold log to results
          if (_found) {
            MasterToSlaveStringArrayResult.found = true; // result found
            let slaveindx: IndexAndSimilarty = {
              index: SlaveCusomIndex,
              similarity: Result
            };
            slaveIndexs.push(slaveindx);
          }

          //Adds all results in range to array, and Adds the biggest to result, If in range
          if (inRange) {
            //add all in range
            // TODO: Set option to log close indexes
            let closeIndexResult: IndexAndSimilarty = {
              index: SlaveCusomIndex,
              similarity: Result
            };
            CloseIndexesResults.push(closeIndexResult);
          } //if range
        }; //Compare()

        // ===== Start Comparing ==== //
        //if any range options is activated
        if (useRangeOnly || useDynamicRange) {
          // don't compare unless you are in range
          if (inRange) Compare();
        }
        // if range options are disabled
        else {
          Compare();
        }
      } //for Slave

      // ==== Save comparasion results === //
      MasterToSlaveStringArrayResult.slaveIndexs = slaveIndexs;

      // get the biggest of all slave results
      for (
        let i = 0;
        i < MasterToSlaveStringArrayResult.slaveIndexs.length;
        i++
      ) {
        const element = MasterToSlaveStringArrayResult.slaveIndexs[i];
        if (
          element.similarity.foundPrecentage ==
            BiggestSimilarity.foundPrecentage ||
          element.similarity.sekew == BiggestSimilarity.sekew
        ) {
          MasterToSlaveStringArrayResult.biggestSimpleSimilarity.index =
            element.index;
          MasterToSlaveStringArrayResult.biggestSimpleSimilarity.similarity =
            element.similarity;
        }
      }

      MasterToSlaveStringArrayResult.slaveCloseToIndex = CloseIndexesResults;

      // get the biffest of all close slave results
      for (
        let i = 0;
        i < MasterToSlaveStringArrayResult.slaveCloseToIndex.length;
        i++
      ) {
        const x = MasterToSlaveStringArrayResult.slaveCloseToIndex[i];
        if (
          x.similarity.foundPrecentage >
            MasterToSlaveStringArrayResult.slaveClosest.similarity
              .foundPrecentage ||
          x.similarity.sekew >
            MasterToSlaveStringArrayResult.slaveClosest.similarity.sekew
        ) {
          MasterToSlaveStringArrayResult.slaveClosest = x;
        }
      }

      var findResultByIndex = (
        index: number,
        IndexAndSimilarty: IndexAndSimilarty[]
      ) => {
        for (let i = 0; i < IndexAndSimilarty.length; i++) {
          const element = IndexAndSimilarty[i];
          if (element.index === index) {
            return element;
          }
        }
        return null;
      };

      //Add the expected index, if not the first loop
      let lastResult = FinalResultsArray[FinalResultsArray.length - 1];
      if (lastResult) {
        let index1 = lastResult.biggestSimpleSimilarity.index + 1;
        slaveExcpected = findResultByIndex(
          index1,
          MasterToSlaveStringArrayResult.slaveCloseToIndex
        );
      }

      //Add resutl if found
      if (MasterToSlaveStringArrayResult.found) {
        last20Diffrences.push(
          MasterToSlaveStringArrayResult.biggestSimpleSimilarity.index
        );
        if (last20Diffrences.length > RefrenceDiffrences) {
          last20Diffrences.shift();
        }
        if (
          MasterToSlaveStringArrayResult.biggestSimpleSimilarity.similarity
            .foundPrecentage < SmallestPercentage
        ) {
          SmallestPercentage =
            MasterToSlaveStringArrayResult.biggestSimpleSimilarity.similarity
              .foundPrecentage;
          SmallestIndexes.master = MasterToSlaveStringArrayResult.masterIndex;
          SmallestIndexes.slave =
            MasterToSlaveStringArrayResult.biggestSimpleSimilarity.index;
        }

        if (
          MasterToSlaveStringArrayResult.biggestSimpleSimilarity.similarity
            .sekew < SmallestSkew
        ) {
          SmallestSkew =
            MasterToSlaveStringArrayResult.biggestSimpleSimilarity.similarity
              .sekew;
          SmallestIndexes.master = MasterToSlaveStringArrayResult.masterIndex;
          SmallestIndexes.slave =
            MasterToSlaveStringArrayResult.biggestSimpleSimilarity.index;
        }
      } //if

      MasterToSlaveStringArrayResult.slaveExcpected = slaveExcpected;

      if (MasterToSlaveStringArrayResult.found == false) {
        notfoundsCount++;
        //process.stderr.write(`\nNot Found in ${MasterToSlaveStringArrayResult.masterIndex}, Count:${notfoundsCount}\n`)
      }
      MasterToSlaveStringArrayResult.edited = false;
      FinalResultsArray.push(MasterToSlaveStringArrayResult);
    } //for Master

    return FinalResultsArray;
  } //CompareMasterToSlaveStringArray

  MultipleRangesComparsion(
    startRange:number,EndRange:number,step:number,masters:CustomeRangeIndex[],slaves:CustomeRangeIndex[],compareOptions:CompareOptions){
      let AllResults:IMasterToSlaveStringArrayResult[][] = []
      for (let index = startRange; index < EndRange; index++) {
        compareOptions.diffrence=index
        if (index%step === 0) {
        let results =this.CompareMasterToSlaveStringArray(masters,slaves,compareOptions);
            results=  results.sort((a,b)=>{
                return b.biggestSimpleSimilarity.similarity.foundPrecentage - a.biggestSimpleSimilarity.similarity.foundPrecentage
            })
            let notFoundslength = results.filter(x=>!x.found).length
            process.stderr.write(`Not founds in [${index}] Count:${notFoundslength}\n`)
            AllResults.push(results)
        }
    }
    return AllResults;
  }//StartComparing

  getElementsFromTo = (from: number, to: number, arr: CustomeRangeIndex[]) => {
    let returnArr = [];
    from = from < 1 ? 1 : from;

    var find;
    for (let i = from; i < arr.length && i <= to; i++) {
      let element = null;

      for (let i2 = 0; i2 < arr.length; i2++) {
        const x = arr[i2];
        if (x.index == i) {
          element = x;
          break;
        }
      }
      if (element) {
        returnArr.push(element);
      }
    }
    return returnArr;
  }; //getElementsFromTo

  filterOutliers(someArray: any[], magnitude = 1.5) {
    // Copy the values, rather than operating on references to existing values
    var values = someArray.concat();

    // Then sort
    values.sort(function(a, b) {
      return a - b;
    });
    /* Then find a generous IQR. This is generous because if (values.length / 4)
     * is not an int, then really you should average the two elements on either
     * side to find q1.
     */

    var q1 = values[Math.floor(values.length / 4)];
    // Likewise for q3.
    var q3 = values[Math.ceil(values.length * (3 / 4))];
    var iqr = q3 - q1;

    // Then find min and max values
    var maxValue = q3 + iqr * magnitude;
    var minValue = q1 - iqr * magnitude;

    // Then filter anything beyond or beneath these values.
    var filteredValues = values.filter(function(x) {
      return x <= maxValue && x >= minValue;
    });

    // Then return
    return filteredValues;
  }

  CompareMasterToSlaveString(
    MasterString: string,
    SlaveString: string,
    arabic: boolean,
    ignore: string[]
  ): SimpleSimilarity {
    MasterString = MasterString ? MasterString : "";
    SlaveString = SlaveString ? SlaveString : "";
    let Matches = {
      a: this.MatchStringToWord(MasterString, arabic, ignore),
      b: this.MatchStringToWord(SlaveString, arabic, ignore)
    };
    let SimpleSimilarity: SimpleSimilarity;
    try {
      SimpleSimilarity = this.CompareMatches(Matches);
    } catch (error) {
      console.log(MasterString);
      console.log(SlaveString);
      console.log(Matches);
      throw error;
    }
    return SimpleSimilarity;
  }

  MatchStringToWord(str: string, arabic, arr: string[]) {
    str = str ? str : "";
    const ArabicWordRegex = /[\u0620-\u064A]+/g;
    const EnglishWordRegex = /([a-z|A-Z]+)/g;
    const RegexWordsMatcher = arabic ? ArabicWordRegex : EnglishWordRegex;
    let matches = str.match(RegexWordsMatcher);
    let FixedMatches = [];
    for (let i = 0; i < matches.length; i++) {
      let m = matches[i];
      m = this.RemoveCommoneWords(m, arr);
      if (m && m.length > 1) {
        m = m.replace(/[ي|ى]/g, "ي").replace(/[أ|إ|ا]/g, "ا");
        FixedMatches.push(m);
      }
    }
    return FixedMatches;
  }

  RemoveCommoneWords(word: string, arr: string[]) {
    return this.RemoverWordsFromString(word, arr);
    /*
        let replaced = word.replace(HadithCommoneWordregex,"");
        if (replaced.length==0) {
            return replaced
        }else{
            return word
        }
        */
  }

  arrToRegEx(arrStr: string[]): RegExp {
    var re = new RegExp(arrStr.join("|"), "g");
    return re;
  }

  RemoverWordsFromString(str: string, arr: string[]): string {
    let finalStr = str;
    if (!str || this.isArrayEmpty(arr)) {
      return finalStr;
    }
    if (arr.length < 1) {
      return finalStr;
    }
    var regex = this.arrToRegEx(arr);
    return finalStr.replace(regex, "");
  }

  CompareMatches(matches?: { a: any[]; b: any[] }) {
    //a master, b slave
    const Matches = matches;
    var joinTwo = (arr: any[], i: number) => {
      let first = arr[i] ? arr[i] : "";
      let second = arr[i + 1] ? arr[i + 1] : "";
      return first + second;
    };
    let aLenght = Matches.a ? Matches.a.length : 0;
    let bLenght = Matches.b ? Matches.b.length : 0;
    var compareson: ICompareson = {
      matchingResults: [],
      similarity: { sekew: null, foundPrecentage: null }
    };
    for (let i = 0; i < aLenght; i++) {
      let WordMatchingResult: IWordMatchingResult;
      let MasterWord = joinTwo(Matches.a, i);
      let SlaveWord: string = "";

      for (let i2 = 0; i2 < bLenght; i2++) {
        SlaveWord = joinTwo(Matches.b, i2);
        if (SlaveWord == MasterWord) {
          WordMatchingResult = { found: true, index: i };
          break;
        }
      }
      compareson.matchingResults.push(WordMatchingResult);
    }
    compareson.similarity = this.CalculateSimilarity(
      compareson.matchingResults
    );
    return compareson.similarity;
  }

  CalculateSimilarity(matchingResults: IWordMatchingResult[]) {
    let CalculatedResult = 0;
    let foundPrecentage = 0;
    let sekew = 0;
    let RightIndex = 0;
    for (let i = 0; i < matchingResults.length; i++) {
      const i1 = matchingResults[i] ? matchingResults[i].index : null;
      const i2 = matchingResults[i + 1] ? matchingResults[i + 1].index : null;
      if (i1 + 1 == i2) {
        RightIndex++;
      }
    }
    let foundcount = 0;
    matchingResults.forEach(m => {
      if (m && m.found) {
        foundcount++;
      }
    });
    foundPrecentage = foundcount / matchingResults.length;
    sekew = RightIndex / matchingResults.length;
    CalculatedResult = (foundPrecentage + sekew) / 2;
    return { foundPrecentage, sekew };
  }

  isArrayEmpty(arr: any[]) {
    if (!arr) {
      return true;
    }
    if (arr.length < 1) {
      return true;
    }
    return false;
  }
} //class

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
  index: number; // the is got from the number in the custom index array
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

interface ICompareson {
  matchingResults: IWordMatchingResult[];
  similarity: SimpleSimilarity;
}
export class CompareOptions {
  PrcentageThreshHold: number; // the thresHold of the matching percentage default is 70
  arabic: boolean; // is array in arabic, important to specify because to seperate sentance it's important to know the unicode matchs default is false
  useRangeOnly: boolean; //if you want to search in range of slave array default is false
  diffrence: number; //the difference of indexes if you used range option the range default is null
  useDynamicRange: boolean; // use dynamige indexed ranges default is false
  outliersMagnitude: number; //the magnitude of speficying an outlier default is 1
  ignores: string[]; //ignore matching these words default is null
  RefrenceDiffrences:number
  // under work
  //logCloseIndexesResults: boolean; //log the close indexes Results, if range option is enabled
}
