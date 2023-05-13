import { ChatGPTAPI } from 'chatgpt'
import dotenv from 'dotenv'
dotenv.config()

export default async function getVocab(content: string): Promise<Vocab[]> {
	const api = new ChatGPTAPI({
		apiKey: process.env.CHATGPT_API_KEY ?? '',
	})
	//const sampleContent =
	// 'Thông tin được ông Lương Minh Phúc, Giám đốc Ban quản lý dự án đầu tư xây dựng các công trình giao thông TP HCM (TCIP - chủ đầu tư dự án xây lắp trên địa bàn thành phố), cho biết chiều 11/5, sau khi tổ công tác vật liệu liên tỉnh tuyến Vành đai 3 cung cấp số liệu. UBND thành phố là cơ quan điều phối chung dự án.'

	let question = `From the following text, can you provide me with flashcards for important words to understand the text that contain: 1) The Vietnamese word, 2) the English translation, 3) root words : ${content}. Please give me the flashcards in an array of objects: [{VN: "vietnamese word", EN: "english translation", rootWords: "root word 1(translation), root ward 2(translation),..."},...]`

	let res = await api.sendMessage(question)
	let vocabArray = parseVocabArray(res.text)

	// if vocabArray is empty, ask again
	let counter = 1
	while (vocabArray.length == 0 && counter < 6) {
		console.log(
			`Didn't get array of vocab. asking again. Re-attempt ${counter}`
		)
		// follow up question
		question = `I didn't get any vocab. Please try again. Please give me flashcards for key terms from the previous Vietnamese text in an array of objects: [{VN: "vietnamese word", EN: "english translation", rootWords: "root word 1(translation), root ward 2(translation),..."},...]`
		res = await api.sendMessage(question, {
			parentMessageId: res.id,
		})
		vocabArray = parseVocabArray(res.text)
		counter++
	}

	return vocabArray
}

type Vocab = {
	vietnamese: string
	english: string
	rootWords: string
}

function parseVocabArray(text: string): Vocab[] {
	const start = text.indexOf('[') // find index of first '['
	const end = text.lastIndexOf(']') // find index of last ']'

	console.log('text:', text)
	console.log('start:', start)
	console.log('end:', end)

	let json = text.substring(start, end + 1)
	// trim json to remove any extra whitespace
	json = json.trim()
	try {
		const parsedJson: Vocab[] = JSON.parse(json)
		console.log('parsedJson:', parsedJson)
		return parsedJson
	} catch (error) {
		console.error('Error parsing JSON:', error)
		return []
	}
}
