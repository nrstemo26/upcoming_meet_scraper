import { table } from 'console';
import playwright from 'playwright';

async function run(){
    const browser = await playwright.chromium.launch({
        // headless: false,//setting to true will not run the ui
        headless: true,//setting to true will not run the ui
    })

    const page = await browser.newPage();
    await page.goto('https://usaweightlifting.sport80.com/public/events/12701/entries/19125?bl=locator');
    // await page.waitForTimeout(5000) //wait 5sec.
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
    let athletes = page.locator('tbody tr td div').evaluate(()=>{
        
    });
    //i could just split this every athlete or i could find a wait to chain the locators
    //so that I can easily group into separate sub arrays or objects to write easier

    console.log(athletes)
    // console.log(headers)
    await browser.close();
}

async function scrapeMeet(url:string){

}

run();