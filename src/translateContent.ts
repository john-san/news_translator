const translate = require('@iamtraction/google-translate')

export async function translateSentences(
	contentArray: string[]
): Promise<string[]> {
	// translate contentArray to english and store in array
	let translatedContentArray: string[] = []
	for (let i = 0; i < contentArray.length; i++) {
		const text = contentArray[i]
		if (text !== null) {
			const translatedText = await translate(text, {
				from: 'vi',
				to: 'en',
			})
			translatedContentArray.push(translatedText.text)
		}
	}

	return translatedContentArray
}

export async function translateString(s: string): Promise<string> {
	const translation = await translate(s, {
		from: 'vi',
		to: 'en',
	})

	return translation.text
}
