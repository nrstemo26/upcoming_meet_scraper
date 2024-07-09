import { createObjectCsvWriter } from 'csv-writer';
import playwright from 'playwright';
import fs from 'fs';
import csv from 'csv-parser';
import { promisify } from 'util';

let allMeetTypes:string[] = [];

export interface UpcomingMeet{
    path: string,
    url: string,
    name: string,
    date: Date,
}

export interface AthleteEntry{
    member_id: number|string,
    first_name: string,
    last_name: string,
    state: string,
    birth_year: number|string,
    club: string,
    gender: string,
    division: string,
    weight_class: number|string,
    entry_total: number|string,
    meet_date: Date|string,
    meet_name: string,
}


function athleteArrayToObj(array:string[], date:Date, title:string): AthleteEntry{
    try{
        if(array.length === 11){
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
            }
        }else{
            throw new Error('unexpected length of array')
        }
    }catch(e){
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
            meet_name:'NA',
        }
    }
}

async function writeResults(path:string, header:{id:string, title:string}[], data:AthleteEntry[]|UpcomingMeet[]){
    const csvWriter = createObjectCsvWriter({
        path: path,
        header:header
    })
    await csvWriter.writeRecords(data)
}

function formatAthleteData(data: string):string[]{
    return data.replaceAll(',','').split(/\r?\n/).map(elem => elem.trim()).filter(elem => elem !== '');
}

function formatMeetTitle(data:string|null):string{
    if(data){
        return data.replace(',', '').trim().replace(' - Members', '')
    }
    else{
        throw new Error('no data')
    }
}

async function getMaxResultsPerPage(page: playwright.Page, ) {
    await page.locator('.v-select__slot .v-select__selections .v-select__selection.v-select__selection--comma').click();
    await page.waitForSelector('.v-menu__content.menuable__content__active');
    await page.locator('.v-list-item__content .v-list-item__title').locator('text=50').click(); 
}


async function readCsv(filePath:string):Promise<UpcomingMeet[]> {
    const readFileAsync = promisify(fs.readFile);

    try {
        // Read the CSV file as a stream
        const stream = fs.createReadStream(filePath)
            .pipe(csv());

        const data = [];

        // Wait for 'data' event to collect each row
        for await (const row of stream) {
            data.push(row);
        }

        return data;
    } catch (error:any) {
        throw new Error(error);
    }
}

async function deleteFile(filePath:string):Promise<void> {
    return new Promise((resolve, reject) => {
        fs.unlink(filePath, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

async function fileExists(path:string): Promise<Boolean>{
    try {
        // Using fs.promises.stat() for asynchronous file existence checking
        await fs.promises.stat(path);
        return true; // File exists
    } catch (error: any) {
        if (error.code === 'ENOENT') {
            return false; // File doesn't exist
        }
        // Re-throw other errors
        throw error;
    }
}

function parsePagination(paginationText: string | null): {end: number, total: number} {
    if (!paginationText) {
        return { end: 0, total: 0 };
    }
    // Assuming paginationText is in the format "1-20 of X"
    const [range, , total] = paginationText.split(' ');
    const [start, end] = range.split('-').map(Number);
    return { end, total: Number(total) };
}



export async function scrapeMetaAndSpecific(path: string = './data/'){
    let meetsArray:UpcomingMeet[] = [];

    // let meetMetaPath:string = path + 'national_meets_meta.csv'; 
    let meetMetaPath:string = './7-9-upcoming_entries/national_meets_meta.csv'; 

    if(await fileExists(meetMetaPath)){
        console.log('meta file already exists')
        meetsArray = await readCsv(meetMetaPath);
        // console.log(meetsArray);
    }else{
        try{
            console.log('meta file does not exists')
            meetsArray = await scrapeUpcomingMeta(path+'data/');
    
            let meetsHeader = Object.keys(meetsArray[0]).map(el=>{
                return {id: el, title: el}
            })
    

            await writeResults(meetMetaPath, meetsHeader, meetsArray);
        }catch(e){
            //error while getting data or writing
            await deleteFile(meetMetaPath)
            throw new Error();
        }
    }    

    try{
        for(let i = 0; i< meetsArray.length; i++){
            let {path, date, url} = meetsArray[i];
            
            if(!(await fileExists(path))){
                try{
                    await scrapeMeet(path, url, date);
                }catch(e){
                    await deleteFile(path)
                    throw new Error();
                }
            }
        }
    }catch(e){
        console.log('caught me an error')
        throw new Error()
    }
    

    return true;
}

export async function run(retries: number, path:string){
    // await scrapeMeet('./foo.csv','https://usaweightlifting.sport80.com/public/events/12701/entries/19125?bl=locator', new Date('1/1/2023'))
    await fs.promises.mkdir(path, { recursive: true });
    await fs.promises.mkdir(path+ 'data/', { recursive: true })
    await retry(retries,scrapeMetaAndSpecific, path);
}


// npx playwright codegen https://usaweightlifting.sport80.com/public/events/12701/entries/19125?bl=locator
export async function scrapeMeet(csvPath:string, url:string, date:Date){
    try{
    const browser = await playwright.chromium.launch({
        headless: true,//setting to true will not run the ui
    })
    const page = await browser.newPage();
    await page.goto(url);
    
    let progressLocator = page.getByRole("progressbar")
    await progressLocator.waitFor({state:'detached'})
    
    await page.waitForTimeout(5000)
    await page.locator('.v-select__slot .v-select__selections .v-select__selection.v-select__selection--comma').click();
    await page.waitForSelector('.v-menu__content.menuable__content__active');
    await page.locator('.v-list-item__content .v-list-item__title').locator('text=50').click(); 
    await page.waitForTimeout(5000)



    let meetTitle = formatMeetTitle(await page.locator('.v-card__title').first().getByRole('heading').innerText());

    console.log('scraping meet: ', meetTitle)


    let resultsString = await page.getByRole('heading', { name: 'Records' }).innerText()
    let resultsCount = parseInt(resultsString.trim().split(' Records')[0])
    // console.log('total results to scrape: ', resultsCount)

    let athleteData: AthleteEntry[] = [];

    let end = 0;

    while(end != resultsCount){
       
        let pagination = parsePagination(await page.locator('.v-data-footer__pagination').textContent());
        end = pagination.end;
        // console.log(end)
        
        // console.log(`scraping athlete ${end} of ${resultsCount}`)
        
        await page.waitForTimeout(2000)
        let athleteLocator = page.locator('tbody tr')
        let currentPageAthletes = await athleteLocator.allInnerTexts();
        let currentPageAthleteCount = await athleteLocator.count();
        // console.log('athletes on page: ', currentPageAthleteCount)
        await page.waitForTimeout(2000)

        for(let i=0; i< currentPageAthleteCount; i++){
            let currentAthlete = formatAthleteData(currentPageAthletes[i])
            let athleteObj: AthleteEntry = athleteArrayToObj(currentAthlete, date, meetTitle);
            athleteData.push(athleteObj)
        }


        if(end === resultsCount){
            break;
        }else{
            await page.locator('.mdi-chevron-right').click();
            await page.waitForTimeout(2000)
        }
    }

        await browser.close();
        // console.log(athleteData.length)
        if(resultsCount === 0 ){
            console.log('done scraping... no entries')
            return;
        }else{
            const csvHeader = Object.keys(athleteData[0]).map(el=>{
                return {'id': el, 'title': el}
            })
            await writeResults(csvPath, csvHeader, athleteData)
        }    
    
    }catch(e){
        console.log('error scraping', e)   
        throw new Error('from the scrape meet function');
       
    }

    console.log('done scraping')
    
}


function cleanMeetType(str:string|null): string{
    if(str){
        str = str.trim();
        if(!allMeetTypes.includes(str)){
            allMeetTypes.push(str)
        }
        if(str.includes('Local')){
            return 'local'
        }
        else if(str.includes('National') || str.includes('American Open')){
            return 'national'
        }else{
            return 'weird'
        }
    }
    return 'weird'

}

function cleanDate(str:string|null): Date{
    if(str){
        let date = str.split('-')[1]
        return new Date(date)
    }else{
        console.log('got null to clean the date up')
        return new Date();
    }
}

 function createPath(str:string|null,path:string):string{
    if(str){
        let processedString = str.trim().replace(/[-,]/g, '').toLowerCase();
        return path + processedString.replace(/\s+/g, '_') + '.csv'
    }
    return 'foo.csv'
}

export async function scrapeUpcomingMeta(path:string): Promise<UpcomingMeet[]>{
    let nationalMeets:UpcomingMeet[] = [];
    const browser = await playwright.chromium.launch({
        headless: true,
    })

    const page = await browser.newPage();
    await page.goto('https://usaweightlifting.sport80.com/public/events');

    //filters to only show upcoming meets
    await page.getByLabel('Show Filters').click();
    await page.locator('div:nth-child(4) > .s80-autocomplete > div:nth-child(2) > .v-input__control > .v-input__slot > .v-select__slot > div:nth-child(4) > .v-input__icon > .v-icon').click();
    await page.getByText('Meets', { exact: true }).click();
    await page.getByRole('button', { name: 'Apply' }).click();

    //could wait for a selector but well just do this for now
    await page.waitForSelector('div.v-expansion-panel');

    let done = false;
    let pageNumber = 0;
    while(!done){
        pageNumber++
        console.log('looping page: ', pageNumber);        
        await page.waitForSelector('div.v-expansion-panel')

        let meetsOnPage = await page.locator('div.v-expansion-panel').count();
        for(let i=0; i< meetsOnPage; i++){
            let meetPanel = page.locator('div.v-expansion-panel').nth(i)
            await meetPanel.click();
            let meetType = cleanMeetType((await meetPanel.locator('.s80-data-item').nth(2).allInnerTexts())[0]);
    
            if(meetType === 'national'){
                let date = cleanDate(await meetPanel.locator('span.grey--text').textContent());

                const page1Promise = page.waitForEvent('popup');
                await meetPanel.getByText('ENTRY LIST').click();
                const page1 = await page1Promise;
                await page1.waitForSelector('.v-card__title')
                
                let name = formatMeetTitle(await page1.locator('.v-card__title h2').textContent());
                
                nationalMeets.push({
                    url: page1.url(),
                    name: name? name: 'error',
                    date,
                    path: createPath(name, path)
                })
               
            }      
        }

        if(await page.getByLabel('Next page').isDisabled()){
            done = true;
        }else{
            await page.getByLabel('Next page').click();
        }
    }
      
    await browser.close()
    return nationalMeets;
}


export async function retry(maxRetries: number, tryFn:any, path:string) { 
    let retries:number = 0;
    while(retries < maxRetries){
        try{
            console.log('retries: ', retries)
            let done = await tryFn(path);
            if(done) break;
        }catch(e){
            console.log('there was an error. now retrying')
            retries++
        }
    }
    if(retries === maxRetries){
        console.log('exceeded max retries')
    }else{
        console.log('successful with retries');
    }
}   


//  run(5, './7-9-upcoming_entries/');



