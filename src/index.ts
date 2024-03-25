import { error } from 'console';
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
        console.log(athleteObj)
        athleteData.push(athleteObj)
    }

    //athleteData should be an array of objects 
    //write objects to csv


    await browser.close();
}


// npx playwright codegen https://usaweightlifting.sport80.com/public/events/12701/entries/19125?bl=locator
async function scrapeMeet(url:string){

}

run();