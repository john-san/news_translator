// for VN Express
import puppeteer from 'puppeteer'
import getVocab from './getVocab'
import getEasySentences from './getEasySentences'
import { parseDate } from './utils'
import writeToCsv from './writeToCsv'

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
			let title = document.querySelector('.title-detail')?.textContent?.trim()
			let content = document.querySelector('.fck_detail')?.textContent?.trim()
			let date = document.querySelector('.date')?.textContent
			// remove newlines and tabs from content
			content = content?.replace(/\n|\t/g, '')

			return {
				url,
				title,
				content,
				date,
			}
		})
		browser.close()

		return result
	} catch (error) {
		console.log(error)
	}
}

async function scrapeAndProcess() {
	const result = await scrape()
	result.date = parseDate(result?.date)

	console.log(result)

	result.vocab = await getVocab(result.content)
	console.log(result.vocab)

	result.sentences = await getEasySentences(result.content)
	console.log(result.sentences)

	await writeToCsv(result)
}

/* TODO:
- find way to automatically import files to anki
- fix issue with npm start
*/

scrapeAndProcess()
