import { ChatGPTAPI } from 'chatgpt'
import dotenv from 'dotenv'
dotenv.config()

export default async function getVocab() {
	const api = new ChatGPTAPI({
		apiKey: process.env.CHATGPT_API_KEY ?? '',
	})
	const sampleContent =
		'Thông tin được ông Lương Minh Phúc, Giám đốc Ban quản lý dự án đầu tư xây dựng các công trình giao thông TP HCM (TCIP - chủ đầu tư dự án xây lắp trên địa bàn thành phố), cho biết chiều 11/5, sau khi tổ công tác vật liệu liên tỉnh tuyến Vành đai 3 cung cấp số liệu. UBND thành phố là cơ quan điều phối chung dự án.'

	let question = `From the following text, can you provide me with flashcards for important words to understand the text that contain: 1) The Vietnamese word, 2) the English translation, 3) root words : ${sampleContent}. Please give me the flashcards in an array of objects: [{vietnamese: "vietnamese word", english: "english translation", root words: "root word 1(translation), root ward 2(translation),..."},...]`

	let res = await api.sendMessage(question)
	// console.log(res.text)
	const start = res.text.indexOf('[') // find index of first '['
	const end = res.text.lastIndexOf(']') // find index of last ']'
	const arrayText = res.text.substring(start, end + 1)
	console.log(res.text)
	console.log(arrayText)
}

getVocab()
