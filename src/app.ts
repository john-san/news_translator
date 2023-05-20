// for VN Express
import puppeteer from 'puppeteer'
// import getVocab from './getVocab'
import { sentences } from 'sbd'
import { parseDate } from './utils'

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
			// remove newlines
			content = content?.replace(/\n/g, ' ')

			let date = document.querySelector('.date')?.textContent

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
	// tokenize content

	let parseOptions = {
		sanitize: true,
		preserve_whitespace: false,
	}
	const content = sentences(result.content, parseOptions)
	console.log(content)
}

scrapeAndProcess()

/* 
	  TODOS
		1) Tokenize content into sentences
		2) Translate each sentence
		3) Write sentences and words to 2 CSVs
	*/
