import { createObjectCsvWriter } from 'csv-writer';
import playwright from 'playwright';

let allMeetTypes:string[] = [];

interface UpcomingMeet{
    path: string,
    url: string,
    date: Date,
}

interface AthleteEntry{
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
                meet_date: date.toISOString().split('T')[0],
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


async function writeResults(path:string, header:{id:string, title:string}[], data:AthleteEntry[]){
    const csvWriter = createObjectCsvWriter({
        path: path,
        header:header
    })
    await csvWriter.writeRecords(data)
}

function formatAthleteData(data: string):string[]{
    return data.replaceAll(',','').split(/\r?\n/).map(elem => elem.trim()).filter(elem => elem !== '');
}
function formatMeetTitle(data:string):string{
    return data.replace(',', '').trim().replace(' - Members', '')
}

async function run(){
    await scrapeAllUpcoming();
  
  //likely get these meets from somewhere else... via scraping or something
  let meetsArray = [
    {
        path: 'foo.csv',
        url:'https://usaweightlifting.sport80.com/public/events/12701/entries/19125?bl=locator',
        date: new Date('June 23, 2023')
    },
    // {
    //     path: 'output2.csv',
    //     url:'https://usaweightlifting.sport80.com/public/events/12701/entries/19125?bl=locator'
    // },
] 
//   for(let i=0; i< meetsArray.length; i++){
//       await scrapeMeet(meetsArray[i].path, meetsArray[i].url, meetsArray[i].date);
//   }
}


// npx playwright codegen https://usaweightlifting.sport80.com/public/events/12701/entries/19125?bl=locator
async function scrapeMeet(csvPath:string, url:string, date:Date){
    const browser = await playwright.chromium.launch({
        headless: true,//setting to true will not run the ui
    })

    const page = await browser.newPage();
    await page.goto(url);
    await page.waitForSelector('table')//wait for table to appear
    
    // let meetTitle = await page.getByRole('heading').filter().allTextContents();
    let meetTitle = formatMeetTitle(await page.locator('.v-card__title').first().getByRole('heading').innerText());

  ;
    console.log(meetTitle)

    // let headers = await page.getByRole('columnheader').allTextContents()
 
    let athleteLocator = page.locator('tbody tr')
    let athletes = await athleteLocator.allInnerTexts() 
    let totalAthleteCount = await athleteLocator.count() 


    let athleteData: AthleteEntry[] = [];

    for(let i=0; i< totalAthleteCount; i++){
        let currentAthlete = formatAthleteData(athletes[i])
        let athleteObj: AthleteEntry = athleteArrayToObj(currentAthlete, date, meetTitle);
        athleteData.push(athleteObj)
    }
    await browser.close();
    
    const csvHeader = Object.keys(athleteData[0]).map(el=>{
        return {'id': el, 'title': el}
    })

    await writeResults(csvPath, csvHeader, athleteData)
   
}

function cleanMeetType(str:string): string{
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
    return str

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

async function scrapeAllUpcoming(): Promise<UpcomingMeet[]>{
    let nationalMeets:{name:string|null, url:string, date:Date}[] = [];
    const browser = await playwright.chromium.launch({
        headless: true,//setting to true will not run the ui
        // headless: false,//setting to true will not run the ui
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
    while(!done){
        console.log('looping');        
        await page.waitForSelector('div.v-expansion-panel')

        let meetsOnPage = await page.locator('div.v-expansion-panel').count();
        for(let i=0; i< meetsOnPage; i++){
            let meetPanel = page.locator('div.v-expansion-panel').nth(i)
            await meetPanel.click();
            let meetType = (await meetPanel.locator('.s80-data-item').nth(2).allInnerTexts())[0];
    
            let cleanedMeetType = cleanMeetType(meetType)
    
            if(cleanedMeetType === 'national'){
                //get date of the meet
                let date = cleanDate(await meetPanel.locator('span.grey--text').textContent());
                console.log(date)

                const page1Promise = page.waitForEvent('popup');
                await meetPanel.getByText('ENTRY LIST').click();
                const page1 = await page1Promise;
                await page1.waitForSelector('.v-card__title')
                
                let name = await page1.locator('.v-card__title h2').textContent();
                let url = page1.url()
                console.log('url: ', url)
                console.log('meet name: ', name)
                
                nationalMeets.push({
                    url,
                    name,
                    date
                })
               
            }      
        }

        if(await page.getByLabel('Next page').isDisabled()){
            done = true;
        }else{
            await page.getByLabel('Next page').click();
        }
    }
   
    
   
    console.log(allMeetTypes);
    
   

    // while were not at the last page of the pagination
        // click each down arrow and look if its a national meet
        // if it is we do store info in array
        // if we get to the last element on a page we click the next page button



        // s80-expansion-panel
      
    // browser.close()
    return [{
        path: 'foo.csv',
        url:'https://usaweightlifting.sport80.com/public/events/12701/entries/19125?bl=locator',
        date: new Date('June 23, 2023')
    }]
}


run();