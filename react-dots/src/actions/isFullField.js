export const isFullField = (field) => {
	for(let i=0; i<field.length; i++) {
		for(let j=0; j<field.length; j++) {
			if (field[i][j] === "E") {
				return false
			}
		}
	}
	return true
}