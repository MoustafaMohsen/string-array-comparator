"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var perf_hooks_1 = require("perf_hooks");
var Compareator = /** @class */ (function () {
    function Compareator() {
        this.getElementsFromTo = function (from, to, arr) {
            var returnArr = [];
            from = from < 1 ? 1 : from;
            var find;
            for (var i = from; i < arr.length && i <= to; i++) {
                var element = null;
                for (var i2 = 0; i2 < arr.length; i2++) {
                    var x = arr[i2];
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
    }
    Compareator.prototype.CompareMasterToSlaveStringArray = function (MasterStringArray, SlaveStringArray, compareOptions) {
        var _this = this;
        var PrcentageThreshHold = compareOptions.PrcentageThreshHold;
        var arabic = compareOptions.arabic;
        var useRangeOnly = compareOptions.useRangeOnly;
        var diffrence = compareOptions.diffrence;
        var useDynamicRange = compareOptions.useDynamicRange;
        var outliersMagnitude = compareOptions.outliersMagnitude;
        var ignores = compareOptions.ignores;
        var RefrenceDiffrences = compareOptions.RefrenceDiffrences;
        // Check if array is empty
        if (this.isArrayEmpty(MasterStringArray) == true ||
            this.isArrayEmpty(SlaveStringArray) == true) {
            return null;
        }
        //=====Calculate Proggress
        var rem10 = function (remaning) {
            var c = 0;
            remaning.forEach(function (x) {
                c = x ? x + c : c;
            });
            return c / remaning.length;
        };
        var round = function (number) {
            return parseFloat(Math.round(number * 100).toFixed(2)) / 100;
        };
        var lastPreformance; //Calculate Proggress
        var last10Remanings = []; //Calculate Proggress
        //Calculate Proggress=====
        //Initialing Return array
        var FinalResultsArray = [];
        var last20Diffrences = [];
        var SmallestPercentage = 1;
        var SmallestSkew = 1;
        var SmallestIndexes = { master: null, slave: null };
        var notfoundsCount = 0;
        var abs = function (number) {
            var num = Math.abs(number);
            num = num ? num : null;
            return num;
        };
        var countnumbers = function (arr) {
            var count = 0;
            for (var i = 0; i < arr.length; i++) {
                var n = arr[i];
                count += n;
            }
            return count;
        };
        var avrageToMedian = function (arr) {
            var length = arr.length ? arr.length : 1;
            var sum = countnumbers(arr);
            return sum / length;
        };
        var _loop_1 = function (i) {
            var medianSlaveIndex = void 0;
            // if use dynamic range then get the last average madian
            if (useDynamicRange) {
                var filteredValues = this_1.filterOutliers(last20Diffrences, outliersMagnitude);
                medianSlaveIndex = avrageToMedian(filteredValues);
            }
            //=====Calculate Proggress
            var nowperformance = perf_hooks_1.performance.now();
            var diff = nowperformance - lastPreformance;
            var CurretnremainingTime = ((MasterStringArray.length - i) * diff) / 1000;
            lastPreformance = nowperformance;
            if (last10Remanings.length > 20) {
                last10Remanings.shift();
            }
            last10Remanings.push(CurretnremainingTime);
            var remainingTime = rem10(last10Remanings);
            if (i > 0) {
                var StatusMessage = "Current Element:" + i + ", prog:" + round((i / MasterStringArray.length) * 100).toFixed(2) + "%, last Request took:" + round(diff).toFixed(2) + " Millisecond, remaining time: " + round(remainingTime).toFixed(2) + " \n                SmallestPercentage:" + SmallestPercentage + ", SmallestSkew:" + SmallestSkew + ", in Master:" + SmallestIndexes.master + ", Slave:" + SmallestIndexes.slave + "\n                \n";
                //once Every 10 times
                if (i % 100 === 0) {
                    if (useRangeOnly)
                        process.stderr.write("[" + diffrence + "]" + StatusMessage);
                    if (useDynamicRange)
                        process.stderr.write("[DynamicRange]" + StatusMessage);
                    if (!useRangeOnly && !useDynamicRange)
                        process.stderr.write("[fullMode]" + StatusMessage);
                }
            }
            else {
                process.stderr.write("Started, Current Element:" + i + ", prog:" + round((i / MasterStringArray.length) * 100).toFixed(2) + "%\n");
            }
            //Calculate Proggress=====
            var MasterCustomIndex = MasterStringArray[i].index;
            var MasterString = MasterStringArray[i].string;
            var BiggestSimilarity = {
                foundPrecentage: 0,
                sekew: 0
            };
            var MasterToSlaveStringArrayResult = {
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
            var slaveIndexs = [];
            var CloseIndexesResults = [];
            var slaveExcpected = void 0;
            var _loop_2 = function (i2) {
                var SlaveString = SlaveStringArray[i2].string; //Slave String
                var SlaveCusomIndex = SlaveStringArray[i2].index; //Slave index
                var diff_1 = abs(SlaveCusomIndex - MasterCustomIndex); //Diffrence In Range
                var inRange = false;
                // test in range in raneg only mode
                if (useRangeOnly) {
                    inRange = diff_1 != null && diff_1 <= diffrence; // is In Range
                }
                // test in range in dynamic range mode
                if (useDynamicRange) {
                    var currenctDiffrence = abs(medianSlaveIndex - SlaveCusomIndex);
                    inRange = currenctDiffrence <= diffrence;
                }
                Compare = function () {
                    var Result = _this.CompareMasterToSlaveString(MasterString, SlaveString, arabic, ignores);
                    var isZeroed = Result.foundPrecentage == 0; //is it's not found at all
                    // TODO: Set threshhold for skew and found
                    var _found = Result.foundPrecentage > PrcentageThreshHold ||
                        Result.sekew > PrcentageThreshHold;
                    // if it's a zeroed results
                    if (isZeroed) {
                        MasterToSlaveStringArrayResult.zeroedResult = true;
                    }
                    // Log the biggest Similarity
                    if (Result.foundPrecentage > BiggestSimilarity.foundPrecentage ||
                        Result.sekew > BiggestSimilarity.sekew) {
                        BiggestSimilarity = Result;
                    }
                    //If it's bigger than Threshhold log to results
                    if (_found) {
                        MasterToSlaveStringArrayResult.found = true; // result found
                        var slaveindx = {
                            index: SlaveCusomIndex,
                            similarity: Result
                        };
                        slaveIndexs.push(slaveindx);
                    }
                    //Adds all results in range to array, and Adds the biggest to result, If in range
                    if (inRange) {
                        //add all in range
                        // TODO: Set option to log close indexes
                        var closeIndexResult = {
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
                    if (inRange)
                        Compare();
                }
                // if range options are disabled
                else {
                    Compare();
                }
            };
            // ==== Compare Master Element To Array of Slave Elements === //
            for (var i2 = 0; i2 < SlaveStringArray.length; i2++) {
                _loop_2(i2);
            } //for Slave
            // ==== Save comparasion results === //
            MasterToSlaveStringArrayResult.slaveIndexs = slaveIndexs;
            // get the biggest of all slave results
            for (var i_1 = 0; i_1 < MasterToSlaveStringArrayResult.slaveIndexs.length; i_1++) {
                var element = MasterToSlaveStringArrayResult.slaveIndexs[i_1];
                if (element.similarity.foundPrecentage ==
                    BiggestSimilarity.foundPrecentage ||
                    element.similarity.sekew == BiggestSimilarity.sekew) {
                    MasterToSlaveStringArrayResult.biggestSimpleSimilarity.index =
                        element.index;
                    MasterToSlaveStringArrayResult.biggestSimpleSimilarity.similarity =
                        element.similarity;
                }
            }
            MasterToSlaveStringArrayResult.slaveCloseToIndex = CloseIndexesResults;
            // get the biffest of all close slave results
            for (var i_2 = 0; i_2 < MasterToSlaveStringArrayResult.slaveCloseToIndex.length; i_2++) {
                var x = MasterToSlaveStringArrayResult.slaveCloseToIndex[i_2];
                if (x.similarity.foundPrecentage >
                    MasterToSlaveStringArrayResult.slaveClosest.similarity
                        .foundPrecentage ||
                    x.similarity.sekew >
                        MasterToSlaveStringArrayResult.slaveClosest.similarity.sekew) {
                    MasterToSlaveStringArrayResult.slaveClosest = x;
                }
            }
            findResultByIndex = function (index, IndexAndSimilarty) {
                for (var i_3 = 0; i_3 < IndexAndSimilarty.length; i_3++) {
                    var element = IndexAndSimilarty[i_3];
                    if (element.index === index) {
                        return element;
                    }
                }
                return null;
            };
            //Add the expected index, if not the first loop
            var lastResult = FinalResultsArray[FinalResultsArray.length - 1];
            if (lastResult) {
                var index1 = lastResult.biggestSimpleSimilarity.index + 1;
                slaveExcpected = findResultByIndex(index1, MasterToSlaveStringArrayResult.slaveCloseToIndex);
            }
            //Add resutl if found
            if (MasterToSlaveStringArrayResult.found) {
                last20Diffrences.push(MasterToSlaveStringArrayResult.biggestSimpleSimilarity.index);
                if (last20Diffrences.length > RefrenceDiffrences) {
                    last20Diffrences.shift();
                }
                if (MasterToSlaveStringArrayResult.biggestSimpleSimilarity.similarity
                    .foundPrecentage < SmallestPercentage) {
                    SmallestPercentage =
                        MasterToSlaveStringArrayResult.biggestSimpleSimilarity.similarity
                            .foundPrecentage;
                    SmallestIndexes.master = MasterToSlaveStringArrayResult.masterIndex;
                    SmallestIndexes.slave =
                        MasterToSlaveStringArrayResult.biggestSimpleSimilarity.index;
                }
                if (MasterToSlaveStringArrayResult.biggestSimpleSimilarity.similarity
                    .sekew < SmallestSkew) {
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
        };
        var this_1 = this, Compare, findResultByIndex;
        // Looping through the Master Array to match every elemnt in the master
        // array with every element  slave array
        for (var i = 0; i < MasterStringArray.length; i++) {
            _loop_1(i);
        } //for Master
        return FinalResultsArray;
    }; //CompareMasterToSlaveStringArray
    Compareator.prototype.MultipleRangesComparsion = function (startRange, EndRange, step, masters, slaves, compareOptions) {
        var AllResults = [];
        for (var index = startRange; index < EndRange; index++) {
            compareOptions.diffrence = index;
            if (index % step === 0) {
                var results = this.CompareMasterToSlaveStringArray(masters, slaves, compareOptions);
                results = results.sort(function (a, b) {
                    return b.biggestSimpleSimilarity.similarity.foundPrecentage - a.biggestSimpleSimilarity.similarity.foundPrecentage;
                });
                var notFoundslength = results.filter(function (x) { return !x.found; }).length;
                process.stderr.write("Not founds in [" + index + "] Count:" + notFoundslength + "\n");
                AllResults.push(results);
            }
        }
        return AllResults;
    }; //StartComparing
    Compareator.prototype.filterOutliers = function (someArray, magnitude) {
        if (magnitude === void 0) { magnitude = 1.5; }
        // Copy the values, rather than operating on references to existing values
        var values = someArray.concat();
        // Then sort
        values.sort(function (a, b) {
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
        var filteredValues = values.filter(function (x) {
            return x <= maxValue && x >= minValue;
        });
        // Then return
        return filteredValues;
    };
    Compareator.prototype.CompareMasterToSlaveString = function (MasterString, SlaveString, arabic, ignore) {
        MasterString = MasterString ? MasterString : "";
        SlaveString = SlaveString ? SlaveString : "";
        var Matches = {
            a: this.MatchStringToWord(MasterString, arabic, ignore),
            b: this.MatchStringToWord(SlaveString, arabic, ignore)
        };
        var SimpleSimilarity;
        try {
            SimpleSimilarity = this.CompareMatches(Matches);
        }
        catch (error) {
            console.log(MasterString);
            console.log(SlaveString);
            console.log(Matches);
            throw error;
        }
        return SimpleSimilarity;
    };
    Compareator.prototype.MatchStringToWord = function (str, arabic, arr) {
        str = str ? str : "";
        var ArabicWordRegex = /[\u0620-\u064A]+/g;
        var EnglishWordRegex = /([a-z|A-Z]+)/g;
        var RegexWordsMatcher = arabic ? ArabicWordRegex : EnglishWordRegex;
        var matches = str.match(RegexWordsMatcher);
        var FixedMatches = [];
        for (var i = 0; i < matches.length; i++) {
            var m = matches[i];
            m = this.RemoveCommoneWords(m, arr);
            if (m && m.length > 1) {
                m = m.replace(/[ي|ى]/g, "ي").replace(/[أ|إ|ا]/g, "ا");
                FixedMatches.push(m);
            }
        }
        return FixedMatches;
    };
    Compareator.prototype.RemoveCommoneWords = function (word, arr) {
        return this.RemoverWordsFromString(word, arr);
        /*
            let replaced = word.replace(HadithCommoneWordregex,"");
            if (replaced.length==0) {
                return replaced
            }else{
                return word
            }
            */
    };
    Compareator.prototype.arrToRegEx = function (arrStr) {
        var re = new RegExp(arrStr.join("|"), "g");
        return re;
    };
    Compareator.prototype.RemoverWordsFromString = function (str, arr) {
        var finalStr = str;
        if (!str || this.isArrayEmpty(arr)) {
            return finalStr;
        }
        if (arr.length < 1) {
            return finalStr;
        }
        var regex = this.arrToRegEx(arr);
        return finalStr.replace(regex, "");
    };
    Compareator.prototype.CompareMatches = function (matches) {
        //a master, b slave
        var Matches = matches;
        var joinTwo = function (arr, i) {
            var first = arr[i] ? arr[i] : "";
            var second = arr[i + 1] ? arr[i + 1] : "";
            return first + second;
        };
        var aLenght = Matches.a ? Matches.a.length : 0;
        var bLenght = Matches.b ? Matches.b.length : 0;
        var compareson = {
            matchingResults: [],
            similarity: { sekew: null, foundPrecentage: null }
        };
        for (var i = 0; i < aLenght; i++) {
            var WordMatchingResult = void 0;
            var MasterWord = joinTwo(Matches.a, i);
            var SlaveWord = "";
            for (var i2 = 0; i2 < bLenght; i2++) {
                SlaveWord = joinTwo(Matches.b, i2);
                if (SlaveWord == MasterWord) {
                    WordMatchingResult = { found: true, index: i };
                    break;
                }
            }
            compareson.matchingResults.push(WordMatchingResult);
        }
        compareson.similarity = this.CalculateSimilarity(compareson.matchingResults);
        return compareson.similarity;
    };
    Compareator.prototype.CalculateSimilarity = function (matchingResults) {
        var CalculatedResult = 0;
        var foundPrecentage = 0;
        var sekew = 0;
        var RightIndex = 0;
        for (var i = 0; i < matchingResults.length; i++) {
            var i1 = matchingResults[i] ? matchingResults[i].index : null;
            var i2 = matchingResults[i + 1] ? matchingResults[i + 1].index : null;
            if (i1 + 1 == i2) {
                RightIndex++;
            }
        }
        var foundcount = 0;
        matchingResults.forEach(function (m) {
            if (m && m.found) {
                foundcount++;
            }
        });
        foundPrecentage = foundcount / matchingResults.length;
        sekew = RightIndex / matchingResults.length;
        CalculatedResult = (foundPrecentage + sekew) / 2;
        return { foundPrecentage: foundPrecentage, sekew: sekew };
    };
    Compareator.prototype.isArrayEmpty = function (arr) {
        if (!arr) {
            return true;
        }
        if (arr.length < 1) {
            return true;
        }
        return false;
    };
    return Compareator;
}()); //class
exports.Compareator = Compareator;
var CompareOptions = /** @class */ (function () {
    function CompareOptions() {
    }
    return CompareOptions;
}());
exports.CompareOptions = CompareOptions;
//# sourceMappingURL=compareator.js.map