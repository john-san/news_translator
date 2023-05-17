// for VN Express
import puppeteer from 'puppeteer'
import getVocab from './getVocab'
const url = 'https://vnexpress.net/topic/tp-ho-chi-minh-26483'
// click the the div with class name: article-topstory
// get the url of the article
// get the h1 tag with class name: title-detail
// get the article tag with class name: fck_detail
// look for span tag with class name: date
// save the contents to a csv file

const scrape = async (): Promise<any> => {
	try {
		const browser = await puppeteer.launch({ headless: 'new' })
		const page = await browser.newPage()
		await page.goto(url)
		await page.waitForSelector('.article-topstory')
		await page.click('.article-topstory')
		await page.waitForSelector('.title-detail')
		await page.waitForSelector('.fck_detail')
		await page.waitForSelector('.date')
		const result = await page.evaluate(() => {
			let url = document.location.href
			let title = document.querySelector('.title-detail')?.textContent
			let content = document.querySelector('.fck_detail')?.textContent
			let contentArray: string[] = []
			// remove /n from content and then split on end of sentence, storing in array
			if (content !== null) {
				content = content!.replace(/\n/g, '')
				contentArray = content.split('.')
			}
			// get date and parse it to just get the date
			// example "Thứ hai, 8/5/2023, 15:58 (GMT+7)" -> "5/8/23"
			let date = document.querySelector('.date')?.textContent
			if (date !== null) {
				// split by comma and strip whitespace
				date = date!.split(',')[1].trim()
				// format date to mm/dd/yy
				const dateArray = date.split('/')
				// pad 0 to single digit days and months
				if (dateArray[0].length === 1) {
					dateArray[0] = '0' + dateArray[0]
				}
				if (dateArray[1].length === 1) {
					dateArray[1] = '0' + dateArray[1]
				}
				// remove first two digits from year
				dateArray[2] = dateArray[2].slice(2)
				date = `${dateArray[1]}/${dateArray[0]}/${dateArray[2]}`
			}

			return {
				url,
				title,
				content,
				contentArray,
				date,
			}
		})
		browser.close()

		return result
	} catch (error) {
		console.log(error)
	}
}

scrape().then(value => {
	console.log(value)
	getVocab(value?.content, 30).then(value => console.log(value))
})
