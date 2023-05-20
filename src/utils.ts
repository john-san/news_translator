export function parseDate(date: string): string | null {
	// get date and parse it to just get the date
	// example "Thứ hai, 8/5/2023, 15:58 (GMT+7)" -> "5/8/23"
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
	return date
}
