import fs from 'fs'
import { createObjectCsvWriter } from 'csv-writer';
import playwright from 'playwright';

function athleteArrayToObj(array:string[]){
    let athleteObj = {}
    try{
        if(array.length ===11){
            athleteObj = {
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
            return athleteObj;
        }else{
            throw new Error('unexpected length of array')
        }
    }catch(e){
        console.error(e);
        return {};
    }

    

    
}
async function writeResults(path:string, header, data){
    const csvWriter = createObjectCsvWriter({
        path: path,
        header:header
    })

    await csvWriter.writeRecords(data)
        // .then(()=>{
        //     console.log('file written successfully')
        // })
        // .catch((e)=>{
        //     console.error('error writing csv file: ', e)
        // })
}

async function run(){
    const browser = await playwright.chromium.launch({
        // headless: false,//setting to true will not run the ui
        headless: true,//setting to true will not run the ui
    })

    const page = await browser.newPage();
    await page.goto('https://usaweightlifting.sport80.com/public/events/12701/entries/19125?bl=locator');
    await page.waitForTimeout(5000) //wait 5sec.
    await page.waitForSelector('table')//wait for table to appear
  
    let headers = await page.getByRole('columnheader').allTextContents()

    // let athletes = await page.locator('tbody tr td div').allInnerTexts();
    // console.log(totalAthleteCount)

    
    //I think this is easier to work with
    let athleteLocator = page.locator('tbody tr')
    let athletes = await athleteLocator.allInnerTexts() 
    let totalAthleteCount = await athleteLocator.count() 
    // let athletes = await page.locator('tbody tr').allInnerTexts() 
    // let totalAthleteCount = await page.locator('tbody tr').count()

    let athleteData = [];

    for(let i=0; i< totalAthleteCount; i++){
        let currentAthlete = athletes[i].split(/\r?\n/).map(elem => elem.trim()).filter(elem => elem !== '');
        let athleteObj = athleteArrayToObj(currentAthlete);
        athleteData.push(athleteObj)
    }
    await browser.close();
    
    const csvHeader = Object.keys(athleteData[0]).map(el=>{
        return {id: el, title: el}
    })
    console.log(csvHeader)

    await writeResults('./output.csv', csvHeader, athleteData)
   
}


// npx playwright codegen https://usaweightlifting.sport80.com/public/events/12701/entries/19125?bl=locator
async function scrapeMeet(url:string){

}

run();