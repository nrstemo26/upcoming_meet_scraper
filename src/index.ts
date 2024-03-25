import playwright from 'playwright';

function athleteArrayToObj(array:string[]){
    let athleteObj = {}
    console.log(array.length);
    if(array.length ===11){
        // map headers to this array
        //i could manually do it or i could
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

    }else{
        console.log('unexpected length of athlete array');
    }
    return athleteObj;
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
    // const table_header = await page.$eval('.v-data-table__wrapper table thead', headerEl => {
    //     const data = [];
    //     const headerEls = headerEl.innerHTML
    //     // const listElms = headerElm.getElementsByTagName('li');

    //     return headerEls;
    // });
    //.v-data-table.v-data-table--has-top theme-light
    //.v-data-table__wrapper table thead to get the header
    //.v-data-table__wrapper table tbody tr ....get info from there

    // console.log(table_header)
    let headers = await page.getByRole('columnheader').allTextContents()

    // let athletes = await page.locator('tbody tr td div').allInnerTexts();
    let totalAthleteCount = await page.locator('tbody tr').count()
    // console.log(totalAthleteCount)

    
    //I think this is easier to work with
    let athletes = await page.locator('tbody tr').allInnerTexts() 

    let athleteData = [];
    for(let i=0; i< totalAthleteCount; i++){
        let currentAthlete = athletes[i].split(/\r?\n/).map(elem => elem.trim()).filter(elem => elem !== '');
        let athleteObj = athleteArrayToObj(currentAthlete);
        console.log(athleteObj)
        athleteData.push(athleteObj)
        
    }

    // let athletes = await page.locator('tbody tr td div').evaluate(()=>{

    // });


    // let athleteData = await page.locator('tbody tr').evaluate((el)=>{
    //     let row = Array.from(el.querySelectorAll('td div'))
        
    //     return row
    // });
    // console.log(athleteData)
    //i could just split this every athlete or i could find a wait to chain the locators
    //so that I can easily group into separate sub arrays or objects to write easier

    // console.log(athletes)
    // console.log(headers)
    await browser.close();
}


// npx playwright codegen https://usaweightlifting.sport80.com/public/events/12701/entries/19125?bl=locator
async function scrapeMeet(url:string){

}

run();