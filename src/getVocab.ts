import { ChatGPTAPI } from 'chatgpt'
import dotenv from 'dotenv'
dotenv.config()

export default async function getVocab(
	content: string,
	num: number = 20
): Promise<Vocab[]> {
	const api = new ChatGPTAPI({
		apiKey: process.env.CHATGPT_API_KEY ?? '',
	})
	// if num is greater than 20, ask for 20 at a time until num is less than 20
	let result: Vocab[] = []
	let tempArray: Vocab[] = []

	let CHUNK_SIZE = 20
	let remaining = num
	let parentMessageId: string | undefined = ''

	while (remaining > 0) {
		let numToAskFor = remaining >= CHUNK_SIZE ? CHUNK_SIZE : remaining
		console.log(`Asking ChatGPT for ${remaining == num ? '' : 'more '}vocab.`)
		let question = `From the following text, can you provide me with ${numToAskFor} ${
			remaining == num ? '' : 'NEW(not given previously)'
		} flashcards for important words to understand the text that contain: 1) The Vietnamese word, 2) the English translation, 3) root words : ${content}. Please give me the flashcards in an array of objects in valid JSON format: [{"VN": "vietnamese word", "EN": "english translation", rootWords: "VN root word 1(EN translation), VN root word 2(EN translation),..."},...]`

		let res = await api.sendMessage(question, { parentMessageId })
		tempArray = parseVocabArray(res.text)

		// if tempArray is empty, ask again
		let counter = 1
		while (tempArray.length == 0 && counter < 6) {
			console.log(
				`Didn't get array of vocab. Will ask again after 10 second cooldown. Retries left: ${
					6 - counter
				}`
			)
			await sleep(10)
			// follow up question
			question = `I didn't get an array of objects in valid JSON format. Please try again. Please give me ${numToAskFor} ${
				remaining == num ? '' : 'NEW(not given previously)'
			} flashcards for key terms from the previous Vietnamese text in an array of objects in valid JSON format: [{"VN": "vietnamese word", "EN": "english translation", "rootWords": "VN root word 1(EN translation), VN root word 2(EN translation),..."},...]`
			res = await api.sendMessage(question, {
				parentMessageId: res.id,
			})

			// set parentMessageId to the id of the last message for next iteration
			parentMessageId = res.parentMessageId

			tempArray = parseVocabArray(res.text)
			counter++
		}

		console.log('Successfully retrieved vocab for this iteration.')

		// merge tempArray with result
		result = result.concat(tempArray)
		// decrement remaining by CHUNK_SIZE. If remaining is less than CHUNK_SIZE, it is on the last iteration, so set remaining to 0
		remaining = remaining >= CHUNK_SIZE ? remaining - CHUNK_SIZE : 0
	}
	console.log('result.length: ', result.length)
	return result
}

type Vocab = {
	vietnamese: string
	english?: string
	rootWords?: string
	example?: string
	original?: string
}

function parseVocabArray(text: string): Vocab[] {
	// strip text of all newlines to make parsing easier and viewable in console
	text = text.replace(/\n/g, '')
	let start = text.indexOf('[') // find index of first '['
	let end = text.lastIndexOf(']') // find index of last ']'

	console.log('text:', text)
	// console.log('start:', start)
	// console.log('end:', end)

	// if both '[' and ']' exist, parse json
	if (start != -1 && end != -1) {
		let json = text.substring(start, end + 1)
		// remove trailing comma from json string
		json = removeTrailingComma(json)
		// console.log('json:', json)
		try {
			const parsedJson: Vocab[] = JSON.parse(json)
			// console.log('parsedJson:', parsedJson)
			return parsedJson
		} catch (error) {
			console.error('Error parsing JSON:', error)
		}
	}
	return []
}

// async pause function that accepts seconds
async function sleep(seconds: number): Promise<void> {
	return new Promise(resolve => setTimeout(resolve, seconds * 1000))
}

// remove trailing comma from json string
function removeTrailingComma(jsonString: string): string {
	const regex = /,\s*]/g
	return jsonString.replace(regex, ']')
}
