const path = require('path')
const fs = require('fs')
const createCsvWriter = require('csv-writer').createObjectCsvWriter
const dataPath = path.resolve(__dirname, './data/')

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
