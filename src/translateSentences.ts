import translate from '@iamtraction/google-translate'

export async function translateSentences(
	sentences: string[]
): Promise<string[]> {
	// translate sentences to english and store in array
	let translations: string[] = []
	for (let i = 0; i < sentences.length; i++) {
		const text = sentences[i]
		if (text !== null) {
			const translatedText = await translate(text, {
				from: 'vi',
				to: 'en',
			})
			translations.push(translatedText.text)
		}
	}

	return translations
}

export async function translateString(s: string): Promise<string> {
	const translation = await translate(s, {
		from: 'vi',
		to: 'en',
	})

	return translation.text
}
