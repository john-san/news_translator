// for VN Express
const puppeteer = require('puppeteer')
const translate = require('@iamtraction/google-translate')
const fs = require('fs')
const path = require('path')
const createCsvWriter = require('csv-writer').createObjectCsvWriter

const dataPath = path.resolve(__dirname, './data/')

const url = 'https://vnexpress.net/topic/tp-ho-chi-minh-26483'
// click the the div with class name: article-topstory
// get the url of the article
// get the h1 tag with class name: title-detail
// get the article tag with class name: fck_detail
// look for span tag with class name: date
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

		// translate title
		const translatedTitle = await translate(result.title, {
			from: 'vi',
			to: 'en',
		})

		// translate contentArray to english and store in array
		let translatedContentArray: string[] = []
		for (let i = 0; i < result.contentArray.length; i++) {
			const text = result.contentArray[i]
			if (text !== null) {
				const translatedText = await translate(text, {
					from: 'vi',
					to: 'en',
				})
				translatedContentArray.push(translatedText.text)
			}
		}

		result.translation = {
			title: translatedTitle.text,
			contentArray: translatedContentArray,
		}

		return result
	} catch (error) {
		console.log(error)
	}
}

scrape().then(value => {
	console.log(value)
	writeToCsv(value)
})

type writeToCsvProps = {
	url: string
	title: string
	content: string
	contentArray: string[]
	date: string
	translation: {
		title: string
		contentArray: string[]
	}
}

function writeToCsv(jsData: writeToCsvProps): void {
	// create folder if it doesn't exist
	if (!fs.existsSync(dataPath)) {
		fs.mkdirSync(dataPath)
	}

	const safeDate = jsData.date.replace(/\//g, '-')

	// If you don't want to write a header line, don't give title to header elements and just give field IDs as a string.
	// removing titles for now
	const csvWriter = createCsvWriter({
		path: `${dataPath}/vnexpress_${safeDate}.csv`,
		header: [
			'content',
			'translation',
			'title',
			'translated_title',
			'date',
			'url',
		],
	})

	const baseData = {
		title: jsData.title,
		translated_title: jsData.translation.title,
		date: jsData.date,
		url: jsData.url,
	}

	// map through contentArray and translation.contentArray
	const data = jsData.contentArray.map((content: string, index: number) => {
		return {
			content: content,
			translation: jsData.translation.contentArray[index],
			...baseData,
		}
	})

	// write to csv
	csvWriter
		.writeRecords(data)
		.then(() => console.log('The CSV file was written successfully'))
		.catch((err: Error) => console.log(err))
}
