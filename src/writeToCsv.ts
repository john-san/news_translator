import { fileURLToPath } from 'url'
import { dirname } from 'path'
import fs from 'fs'
import { createObjectCsvWriter as createCsvWriter } from 'csv-writer'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const dataPath = `${__dirname}\\data\\`

type writeToCsvProps = {
	url: string
	title: string
	content: string
	date: string
	vocab: {
		VN: string
		EN: string
		roots: string
	}[]
	sentences: {
		VN: string
		EN: string
	}[]
}

function writeToCsv({
	url,
	title,
	date,
	vocab,
	sentences,
}: writeToCsvProps): void {
	// create folder if it doesn't exist
	if (!fs.existsSync(dataPath)) {
		fs.mkdirSync(dataPath)
	}

	// If you don't want to write a header line, don't give title to header elements and just give field IDs as a string.
	// removing titles for now
	let csvWriter = createCsvWriter({
		path: `${dataPath}/vnexpress_${date}_vocab.csv`,
		header: ['VN_word', 'EN_word', 'roots', 'title', 'date', 'url'],
	})

	const baseData = {
		title,
		date,
		url,
	}

	const vocabData = vocab.map((word) => {
		return {
			VN_word: word.VN,
			EN_word: word.EN,
			roots: word.roots,
			...baseData,
		}
	})

	csvWriter
		.writeRecords(vocabData)
		.then(() => console.log('The vocab CSV file was written successfully'))
		.catch((err: Error) => console.log(err))

	csvWriter = createCsvWriter({
		path: `${dataPath}/vnexpress_${date}_sentences.csv`,
		header: ['VN_sentence', 'EN_sentence', 'title', 'date', 'url'],
	})

	const sentencesData = sentences.map((sentence) => {
		return {
			VN_sentence: sentence.VN,
			EN_sentence: sentence.EN,
			...baseData,
		}
	})

	csvWriter
		.writeRecords(sentencesData)
		.then(() => console.log('The sentences CSV file was written successfully'))
		.catch((err: Error) => console.log(err))
}

export default writeToCsv
