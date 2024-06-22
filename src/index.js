"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", { value: true });
var csv_writer_1 = require("csv-writer");
var playwright_1 = require("playwright");
var fs_1 = require("fs");
var csv_parser_1 = require("csv-parser");
var util_1 = require("util");
var allMeetTypes = [];
function athleteArrayToObj(array, date, title) {
    try {
        if (array.length === 11) {
            return {
                member_id: array[0],
                first_name: array[1],
                last_name: array[2],
                state: array[3],
                birth_year: array[4],
                club: array[6],
                gender: array[7],
                division: array[8],
                weight_class: array[9],
                entry_total: array[10],
                meet_date: new Date(date).toISOString().split('T')[0],
                meet_name: title,
            };
        }
        else {
            throw new Error('unexpected length of array');
        }
    }
    catch (e) {
        console.error(e);
        return {
            member_id: 'NA',
            first_name: 'NA',
            last_name: 'NA',
            state: 'NA',
            birth_year: 'NA',
            club: 'NA',
            gender: 'NA',
            division: 'NA',
            weight_class: 'NA',
            entry_total: 'NA',
            meet_date: 'NA',
            meet_name: 'NA',
        };
    }
}
function writeResults(path, header, data) {
    return __awaiter(this, void 0, void 0, function () {
        var csvWriter;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    csvWriter = (0, csv_writer_1.createObjectCsvWriter)({
                        path: path,
                        header: header
                    });
                    return [4 /*yield*/, csvWriter.writeRecords(data)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function formatAthleteData(data) {
    return data.replaceAll(',', '').split(/\r?\n/).map(function (elem) { return elem.trim(); }).filter(function (elem) { return elem !== ''; });
}
function formatMeetTitle(data) {
    if (data) {
        return data.replace(',', '').trim().replace(' - Members', '');
    }
    else {
        throw new Error('no data');
    }
}
function getMaxResultsPerPage(page) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, page.locator('.v-select__slot .v-select__selections .v-select__selection.v-select__selection--comma').click()];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, page.waitForSelector('.v-menu__content.menuable__content__active')];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, page.locator('.v-list-item__content .v-list-item__title').locator('text=50').click()];
                case 3:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function readCsv(filePath) {
    return __awaiter(this, void 0, void 0, function () {
        var readFileAsync, stream, data, _a, stream_1, stream_1_1, row, e_1_1, error_1;
        var _b, e_1, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    readFileAsync = (0, util_1.promisify)(fs_1.default.readFile);
                    _e.label = 1;
                case 1:
                    _e.trys.push([1, 14, , 15]);
                    stream = fs_1.default.createReadStream(filePath)
                        .pipe((0, csv_parser_1.default)());
                    data = [];
                    _e.label = 2;
                case 2:
                    _e.trys.push([2, 7, 8, 13]);
                    _a = true, stream_1 = __asyncValues(stream);
                    _e.label = 3;
                case 3: return [4 /*yield*/, stream_1.next()];
                case 4:
                    if (!(stream_1_1 = _e.sent(), _b = stream_1_1.done, !_b)) return [3 /*break*/, 6];
                    _d = stream_1_1.value;
                    _a = false;
                    row = _d;
                    data.push(row);
                    _e.label = 5;
                case 5:
                    _a = true;
                    return [3 /*break*/, 3];
                case 6: return [3 /*break*/, 13];
                case 7:
                    e_1_1 = _e.sent();
                    e_1 = { error: e_1_1 };
                    return [3 /*break*/, 13];
                case 8:
                    _e.trys.push([8, , 11, 12]);
                    if (!(!_a && !_b && (_c = stream_1.return))) return [3 /*break*/, 10];
                    return [4 /*yield*/, _c.call(stream_1)];
                case 9:
                    _e.sent();
                    _e.label = 10;
                case 10: return [3 /*break*/, 12];
                case 11:
                    if (e_1) throw e_1.error;
                    return [7 /*endfinally*/];
                case 12: return [7 /*endfinally*/];
                case 13: return [2 /*return*/, data];
                case 14:
                    error_1 = _e.sent();
                    throw new Error(error_1);
                case 15: return [2 /*return*/];
            }
        });
    });
}
function deleteFile(filePath) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (resolve, reject) {
                    fs_1.default.unlink(filePath, function (err) {
                        if (err) {
                            reject(err);
                        }
                        else {
                            resolve();
                        }
                    });
                })];
        });
    });
}
function fileExists(path) {
    return __awaiter(this, void 0, void 0, function () {
        var error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    // Using fs.promises.stat() for asynchronous file existence checking
                    return [4 /*yield*/, fs_1.default.promises.stat(path)];
                case 1:
                    // Using fs.promises.stat() for asynchronous file existence checking
                    _a.sent();
                    return [2 /*return*/, true]; // File exists
                case 2:
                    error_2 = _a.sent();
                    if (error_2.code === 'ENOENT') {
                        return [2 /*return*/, false]; // File doesn't exist
                    }
                    // Re-throw other errors
                    throw error_2;
                case 3: return [2 /*return*/];
            }
        });
    });
}
function parsePagination(paginationText) {
    if (!paginationText) {
        return { end: 0, total: 0 };
    }
    // Assuming paginationText is in the format "1-20 of X"
    var _a = paginationText.split(' '), range = _a[0], total = _a[2];
    var _b = range.split('-').map(Number), start = _b[0], end = _b[1];
    return { end: end, total: Number(total) };
}
function scrapeMetaAndSpecific() {
    return __awaiter(this, void 0, void 0, function () {
        var meetsArray, meetMetaPath, meetsHeader, e_2, i, _a, path, date, url, e_3, e_4;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    meetsArray = [];
                    meetMetaPath = './data/national_meets_meta.csv';
                    return [4 /*yield*/, fileExists(meetMetaPath)];
                case 1:
                    if (!_b.sent()) return [3 /*break*/, 3];
                    console.log('meta file already exists');
                    return [4 /*yield*/, readCsv(meetMetaPath)];
                case 2:
                    meetsArray = _b.sent();
                    return [3 /*break*/, 8];
                case 3:
                    _b.trys.push([3, 6, , 8]);
                    console.log('meta file does not exists');
                    return [4 /*yield*/, scrapeUpcomingMeta()];
                case 4:
                    meetsArray = _b.sent();
                    meetsHeader = Object.keys(meetsArray[0]).map(function (el) {
                        return { id: el, title: el };
                    });
                    return [4 /*yield*/, writeResults(meetMetaPath, meetsHeader, meetsArray)];
                case 5:
                    _b.sent();
                    return [3 /*break*/, 8];
                case 6:
                    e_2 = _b.sent();
                    //error while getting data or writing
                    return [4 /*yield*/, deleteFile(meetMetaPath)];
                case 7:
                    //error while getting data or writing
                    _b.sent();
                    throw new Error();
                case 8:
                    _b.trys.push([8, 17, , 18]);
                    i = 0;
                    _b.label = 9;
                case 9:
                    if (!(i < meetsArray.length)) return [3 /*break*/, 16];
                    _a = meetsArray[i], path = _a.path, date = _a.date, url = _a.url;
                    return [4 /*yield*/, fileExists(path)];
                case 10:
                    if (!!(_b.sent())) return [3 /*break*/, 15];
                    _b.label = 11;
                case 11:
                    _b.trys.push([11, 13, , 15]);
                    return [4 /*yield*/, scrapeMeet(path, url, date)];
                case 12:
                    _b.sent();
                    return [3 /*break*/, 15];
                case 13:
                    e_3 = _b.sent();
                    return [4 /*yield*/, deleteFile(path)];
                case 14:
                    _b.sent();
                    throw new Error();
                case 15:
                    i++;
                    return [3 /*break*/, 9];
                case 16: return [3 /*break*/, 18];
                case 17:
                    e_4 = _b.sent();
                    console.log('caught me an error');
                    throw new Error();
                case 18: return [2 /*return*/, true];
            }
        });
    });
}
function run() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: 
                // await scrapeMeet('./foo.csv','https://usaweightlifting.sport80.com/public/events/12701/entries/19125?bl=locator', new Date('1/1/2023'))
                return [4 /*yield*/, retry(5, scrapeMetaAndSpecific)];
                case 1:
                    // await scrapeMeet('./foo.csv','https://usaweightlifting.sport80.com/public/events/12701/entries/19125?bl=locator', new Date('1/1/2023'))
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
// npx playwright codegen https://usaweightlifting.sport80.com/public/events/12701/entries/19125?bl=locator
function scrapeMeet(csvPath, url, date) {
    return __awaiter(this, void 0, void 0, function () {
        var browser, page, progressLocator, meetTitle, _a, resultsString, resultsCount, athleteData, end, pagination, _b, athleteLocator, currentPageAthletes, currentPageAthleteCount, i, currentAthlete, athleteObj, csvHeader, e_5;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 23, , 24]);
                    return [4 /*yield*/, playwright_1.default.chromium.launch({
                            headless: false, //setting to true will not run the ui
                        })];
                case 1:
                    browser = _c.sent();
                    return [4 /*yield*/, browser.newPage()];
                case 2:
                    page = _c.sent();
                    return [4 /*yield*/, page.goto(url)];
                case 3:
                    _c.sent();
                    progressLocator = page.getByRole("progressbar");
                    return [4 /*yield*/, progressLocator.waitFor({ state: 'detached' })];
                case 4:
                    _c.sent();
                    return [4 /*yield*/, page.waitForTimeout(3000)];
                case 5:
                    _c.sent();
                    return [4 /*yield*/, getMaxResultsPerPage(page)];
                case 6:
                    _c.sent();
                    _a = formatMeetTitle;
                    return [4 /*yield*/, page.locator('.v-card__title').first().getByRole('heading').innerText()];
                case 7:
                    meetTitle = _a.apply(void 0, [_c.sent()]);
                    console.log('scraping meet: ', meetTitle);
                    return [4 /*yield*/, page.getByRole('heading', { name: 'Records' }).innerText()];
                case 8:
                    resultsString = _c.sent();
                    resultsCount = parseInt(resultsString.trim().split(' Records')[0]);
                    console.log('total results to scrape: ', resultsCount);
                    athleteData = [];
                    end = 0;
                    _c.label = 9;
                case 9:
                    if (!(end != resultsCount)) return [3 /*break*/, 18];
                    _b = parsePagination;
                    return [4 /*yield*/, page.locator('.v-data-footer__pagination').textContent()];
                case 10:
                    pagination = _b.apply(void 0, [_c.sent()]);
                    end = pagination.end;
                    console.log(end);
                    console.log("scraping athlete ".concat(end, " of ").concat(resultsCount));
                    return [4 /*yield*/, page.waitForTimeout(2000)];
                case 11:
                    _c.sent();
                    athleteLocator = page.locator('tbody tr');
                    return [4 /*yield*/, athleteLocator.allInnerTexts()];
                case 12:
                    currentPageAthletes = _c.sent();
                    return [4 /*yield*/, athleteLocator.count()];
                case 13:
                    currentPageAthleteCount = _c.sent();
                    console.log('athletes on page: ', currentPageAthleteCount);
                    return [4 /*yield*/, page.waitForTimeout(2000)];
                case 14:
                    _c.sent();
                    for (i = 0; i < currentPageAthleteCount; i++) {
                        currentAthlete = formatAthleteData(currentPageAthletes[i]);
                        athleteObj = athleteArrayToObj(currentAthlete, date, meetTitle);
                        athleteData.push(athleteObj);
                    }
                    if (!(end === resultsCount)) return [3 /*break*/, 15];
                    return [3 /*break*/, 18];
                case 15: return [4 /*yield*/, page.locator('.mdi-chevron-right').click()];
                case 16:
                    _c.sent();
                    _c.label = 17;
                case 17: return [3 /*break*/, 9];
                case 18: return [4 /*yield*/, browser.close()];
                case 19:
                    _c.sent();
                    if (!(resultsCount === 0)) return [3 /*break*/, 20];
                    console.log('done scraping... no entries');
                    return [2 /*return*/];
                case 20:
                    csvHeader = Object.keys(athleteData[0]).map(function (el) {
                        return { 'id': el, 'title': el };
                    });
                    return [4 /*yield*/, writeResults(csvPath, csvHeader, athleteData)];
                case 21:
                    _c.sent();
                    _c.label = 22;
                case 22: return [3 /*break*/, 24];
                case 23:
                    e_5 = _c.sent();
                    console.log('error scraping', e_5);
                    throw new Error('from the scrape meet function');
                case 24:
                    console.log('done scraping');
                    return [2 /*return*/];
            }
        });
    });
}
function cleanMeetType(str) {
    if (str) {
        str = str.trim();
        if (!allMeetTypes.includes(str)) {
            allMeetTypes.push(str);
        }
        if (str.includes('Local')) {
            return 'local';
        }
        else if (str.includes('National') || str.includes('American Open')) {
            return 'national';
        }
        else {
            return 'weird';
        }
    }
    return 'weird';
}
function cleanDate(str) {
    if (str) {
        var date = str.split('-')[1];
        return new Date(date);
    }
    else {
        console.log('got null to clean the date up');
        return new Date();
    }
}
function createPath(str) {
    if (str) {
        var processedString = str.trim().replace(/[-,]/g, '').toLowerCase();
        return './data/' + processedString.replace(/\s+/g, '_') + '.csv';
    }
    return 'foo.csv';
}
function scrapeUpcomingMeta() {
    return __awaiter(this, void 0, void 0, function () {
        var nationalMeets, browser, page, done, pageNumber, meetsOnPage, i, meetPanel, meetType, _a, date, _b, page1Promise, page1, name_1, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    nationalMeets = [];
                    return [4 /*yield*/, playwright_1.default.chromium.launch({
                            headless: true,
                        })];
                case 1:
                    browser = _d.sent();
                    return [4 /*yield*/, browser.newPage()];
                case 2:
                    page = _d.sent();
                    return [4 /*yield*/, page.goto('https://usaweightlifting.sport80.com/public/events')];
                case 3:
                    _d.sent();
                    //filters to only show upcoming meets
                    return [4 /*yield*/, page.getByLabel('Show Filters').click()];
                case 4:
                    //filters to only show upcoming meets
                    _d.sent();
                    return [4 /*yield*/, page.locator('div:nth-child(4) > .s80-autocomplete > div:nth-child(2) > .v-input__control > .v-input__slot > .v-select__slot > div:nth-child(4) > .v-input__icon > .v-icon').click()];
                case 5:
                    _d.sent();
                    return [4 /*yield*/, page.getByText('Meets', { exact: true }).click()];
                case 6:
                    _d.sent();
                    return [4 /*yield*/, page.getByRole('button', { name: 'Apply' }).click()];
                case 7:
                    _d.sent();
                    //could wait for a selector but well just do this for now
                    return [4 /*yield*/, page.waitForSelector('div.v-expansion-panel')];
                case 8:
                    //could wait for a selector but well just do this for now
                    _d.sent();
                    done = false;
                    pageNumber = 0;
                    _d.label = 9;
                case 9:
                    if (!!done) return [3 /*break*/, 26];
                    pageNumber++;
                    console.log('looping page: ', pageNumber);
                    return [4 /*yield*/, page.waitForSelector('div.v-expansion-panel')];
                case 10:
                    _d.sent();
                    return [4 /*yield*/, page.locator('div.v-expansion-panel').count()];
                case 11:
                    meetsOnPage = _d.sent();
                    i = 0;
                    _d.label = 12;
                case 12:
                    if (!(i < meetsOnPage)) return [3 /*break*/, 21];
                    meetPanel = page.locator('div.v-expansion-panel').nth(i);
                    return [4 /*yield*/, meetPanel.click()];
                case 13:
                    _d.sent();
                    _a = cleanMeetType;
                    return [4 /*yield*/, meetPanel.locator('.s80-data-item').nth(2).allInnerTexts()];
                case 14:
                    meetType = _a.apply(void 0, [(_d.sent())[0]]);
                    if (!(meetType === 'national')) return [3 /*break*/, 20];
                    _b = cleanDate;
                    return [4 /*yield*/, meetPanel.locator('span.grey--text').textContent()];
                case 15:
                    date = _b.apply(void 0, [_d.sent()]);
                    page1Promise = page.waitForEvent('popup');
                    return [4 /*yield*/, meetPanel.getByText('ENTRY LIST').click()];
                case 16:
                    _d.sent();
                    return [4 /*yield*/, page1Promise];
                case 17:
                    page1 = _d.sent();
                    return [4 /*yield*/, page1.waitForSelector('.v-card__title')];
                case 18:
                    _d.sent();
                    _c = formatMeetTitle;
                    return [4 /*yield*/, page1.locator('.v-card__title h2').textContent()];
                case 19:
                    name_1 = _c.apply(void 0, [_d.sent()]);
                    nationalMeets.push({
                        url: page1.url(),
                        name: name_1 ? name_1 : 'error',
                        date: date,
                        path: createPath(name_1)
                    });
                    _d.label = 20;
                case 20:
                    i++;
                    return [3 /*break*/, 12];
                case 21: return [4 /*yield*/, page.getByLabel('Next page').isDisabled()];
                case 22:
                    if (!_d.sent()) return [3 /*break*/, 23];
                    done = true;
                    return [3 /*break*/, 25];
                case 23: return [4 /*yield*/, page.getByLabel('Next page').click()];
                case 24:
                    _d.sent();
                    _d.label = 25;
                case 25: return [3 /*break*/, 9];
                case 26: return [4 /*yield*/, browser.close()];
                case 27:
                    _d.sent();
                    return [2 /*return*/, nationalMeets];
            }
        });
    });
}
function retry(maxRetries, tryFn) {
    return __awaiter(this, void 0, void 0, function () {
        var retries, done, e_6;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    retries = 0;
                    _a.label = 1;
                case 1:
                    if (!(retries < maxRetries)) return [3 /*break*/, 6];
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    console.log('retries: ', retries);
                    return [4 /*yield*/, tryFn()];
                case 3:
                    done = _a.sent();
                    if (done)
                        return [3 /*break*/, 6];
                    return [3 /*break*/, 5];
                case 4:
                    e_6 = _a.sent();
                    console.log('there was an error. now retrying');
                    retries++;
                    return [3 /*break*/, 5];
                case 5: return [3 /*break*/, 1];
                case 6:
                    if (retries === maxRetries) {
                        console.log('exceeded max retries');
                    }
                    else {
                        console.log('successful with retries');
                    }
                    return [2 /*return*/];
            }
        });
    });
}
// run();
// scrapeMeet('meet.csv','https://usaweightlifting.sport80.com/public/events/12701/entries/19125?bl=locator',new Date('1-24-2029'))
//hardcoded meet data
//   //likely get these meets from somewhere else... via scraping or something
//   let meetsArray = [
//     {
//         path: 'foo.csv',
//         url:'https://usaweightlifting.sport80.com/public/events/12701/entries/19125?bl=locator',
//         date: new Date('June 23, 2023')
//     },
// ] 
