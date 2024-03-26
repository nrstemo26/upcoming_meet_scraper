import { createObjectCsvWriter } from 'csv-writer';
import playwright from 'playwright';

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
    entry_total: number|string
  }

function athleteArrayToObj(array:string[]): AthleteEntry{
    try{
        if(array.length ===11){
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

async function run(){
  
  //likely get these meets from somewhere else... via scraping or something
  let meetsArray = [
    {
        path: 'foo.csv',
        url:'https://usaweightlifting.sport80.com/public/events/12701/entries/19125?bl=locator'
    },
    // {
    //     path: 'output2.csv',
    //     url:'https://usaweightlifting.sport80.com/public/events/12701/entries/19125?bl=locator'
    // },
] 
  for(let i=0; i< meetsArray.length; i++){
      await scrapeMeet(meetsArray[i].path,meetsArray[i].url);
  }
}


// npx playwright codegen https://usaweightlifting.sport80.com/public/events/12701/entries/19125?bl=locator
async function scrapeMeet(csvPath:string, url:string){
    const browser = await playwright.chromium.launch({
        headless: true,//setting to true will not run the ui
    })

    const page = await browser.newPage();
    await page.goto(url);
    await page.waitForSelector('table')//wait for table to appear
  
    // let headers = await page.getByRole('columnheader').allTextContents()
 
    let athleteLocator = page.locator('tbody tr')
    let athletes = await athleteLocator.allInnerTexts() 
    let totalAthleteCount = await athleteLocator.count() 

    let athleteData: AthleteEntry[] = [];

    for(let i=0; i< totalAthleteCount; i++){
        let currentAthlete = athletes[i].split(/\r?\n/).map(elem => elem.trim()).filter(elem => elem !== '');
        let athleteObj: AthleteEntry = athleteArrayToObj(currentAthlete);
        athleteData.push(athleteObj)
    }
    await browser.close();
    
    const csvHeader = Object.keys(athleteData[0]).map(el=>{
        return {'id': el, 'title': el}
    })

    await writeResults(csvPath, csvHeader, athleteData)
   
}

run();