export const calcSquare = (field, player1, player2) => {
	let p1 = 0;
	let p2 = 0

	for(let i=0; i<field.length; i++){
		for(let j=0; j<field.length; j++){
			if(field[i][j][0] == player1 && field[i][j][1] == "l"){
				p1++;
			}else if(field[i][j][0] == player2 && field[i][j][1] == "l") {
				p2++
			}else {

			}
		}
	}

	return [p1, p2]

}