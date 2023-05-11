import { ChatGPTAPI } from 'chatgpt'
import dotenv from 'dotenv'
dotenv.config()

async function getVocab() {
	const api = new ChatGPTAPI({
		apiKey: process.env.CHATGPT_API_KEY ?? '',
	})
	const sampleContent =
		'Thông tin được ông Lương Minh Phúc, Giám đốc Ban quản lý dự án đầu tư xây dựng các công trình giao thông TP HCM (TCIP - chủ đầu tư dự án xây lắp trên địa bàn thành phố), cho biết chiều 11/5, sau khi tổ công tác vật liệu liên tỉnh tuyến Vành đai 3 cung cấp số liệu. UBND thành phố là cơ quan điều phối chung dự án.'

	let question = `From the following text, can you provide me with 20 vocabulary flashcards for uncommon words that contain: 1) The Vietnamese word, 2) the English translation, 3) the sentence it was used in and 4) an example sentence of the vietnamese word used in a different context? : ${sampleContent}`

	let res = await api.sendMessage(question)
	console.log(res.text)
}

getVocab()
