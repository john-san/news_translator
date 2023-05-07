// for VN Express
const puppeteer = require('puppeteer')
const translate = require('google-translate-api')

const url = 'https://vnexpress.net/topic/tp-ho-chi-minh-26483'
// click the the div with class name: article-topstory
// get the url of the article
// get the h1 tag with class name: title-detail
// get the article tag with class name: fck_detail
// get each p tag inside the article tag with class name: Normal
// save the contents to a csv file

const scrape = async () => {
	try {
		const browser = await puppeteer.launch({ headless: 'new' })
		const page = await browser.newPage()
		await page.goto(url)
		await page.waitForSelector('.article-topstory')
		await page.click('.article-topstory')
		await page.waitForSelector('.title-detail')
		await page.waitForSelector('.fck_detail')
		await page.waitForSelector('.Normal')
		const result = await page.evaluate(() => {
			let url = document.location.href
			let title = document.querySelector('.title-detail')?.textContent
			let content = document.querySelector('.fck_detail')?.textContent
			let contentArray = document.querySelectorAll('.Normal')
			let contentArrayText: string[] = []
			for (let i = 0; i < contentArray.length; i++) {
				const text = contentArray[i].textContent
				if (text !== null) {
					contentArrayText.push(text)
				}
			}

			return {
				url,
				title,
				content,
				contentArrayText,
			}
		})
		browser.close()

		// translate the content contentArrayText to english and store in array
		let translatedContentArrayText: string[] = []
		for (let i = 0; i < result.contentArrayText.length; i++) {
			const text = result.contentArrayText[i]
			if (text !== null) {
				const translatedText = await translate(text, {
					from: 'vi',
					to: 'en',
				})
				translatedContentArrayText.push(translatedText.text)
			}
		}
		result.translatedContentArrayText = translatedContentArrayText

		return result
	} catch (error) {
		console.log(error)
	}
}

scrape().then(value => {
	console.log(value)
})
