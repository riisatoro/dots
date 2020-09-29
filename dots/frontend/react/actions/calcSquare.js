let field = [
	[0,0,0,0,0,],
	[0,2,2,0,0,],
	[0,2,0,2,0,],
	[0,2,0,2,0,],
	[0,0,2,0,0,],
]

let all_points = []
let connect_matrix = []


function getAllPoints(field, player) {
	let points = []


	for(let i=0; i<field.length; i++) {
		for(let j=0; j<field.length; j++) {
			if (field[i][j] == player) {
				points.push([i, j])
			}
		}
	}
	return points
}


function getConnectMatrix(all_points) {
	for(let i=0; i<all_points.length; i++) {
		let connect_row = []
		for(let j=0; j<all_points.length; j++) {
			connect_row.push(0)			
		}
		connect_matrix.push(connect_row)
	}

	for(let i=0; i<all_points.length; i++){
		for(let j=0; j<all_points.length; j++){
			if( Math.abs(all_points[i][0] - all_points[j][0]) < 2
				&& Math.abs(all_points[i][1] - all_points[j][1]) <2
				&& Math.abs(all_points[i][0] - all_points[j][0]) + (Math.abs(all_points[i][1] - all_points[j][1])) <=2
			) {
				if (JSON.stringify(all_points[i]) != JSON.stringify(all_points[j])) {
					connect_matrix[i][j] = 1
				}
			}
		}
	}
	return connect_matrix;
}


function getFirstPoint(connect_matrix) {
	for(let i=0; i<connect_matrix.length; i++){
		for(let j=0; j<connect_matrix.length; j++){
			if(connect_matrix[i][j]==1){
				return [i, j]
			}
		}
	}

	return []
}

let full_result = []

function getMaxPath(connect_matrix, endpoint, thispoint, frompoint) {
	//console.log("this point", thispoint)
	// track = Object.assign([], track)
	let row = thispoint[1]
	for (let i=0; i<connect_matrix.length; i++) {
		if (connect_matrix[row][i] == 1) {
			// мы нашли новую точку
			// console.log("find new point", [row, i], "?", frompoint)
			// проверить, не пришли ли мы из неё
			
			if(JSON.stringify([thispoint[1], thispoint[0]]) != JSON.stringify(frompoint)) {
				// console.log("get back but no")
				// return []	

				if(JSON.stringify([i, row]) != JSON.stringify(frompoint)) {
					// console.log(frompoint, "not from ", [row, i])
					// проверить, не конечная ли это
					// console.log([row, i], endpoint,)
					if(i == endpoint[0]) {
						//console.log("this point", thispoint)
						//console.log("ENDPOINT", [row, i])
						//console.log("----------")
						return [[row, i]]
					} 
					else {
						// мы нашли конечную точку! возвращаемся
						let tmp = getMaxPath(connect_matrix, endpoint, [row, i], thispoint)

						return tmp.concat([row, i])

					}
				}

			}
		}
	}
}


function buildGraph(field, player, entry_point) {
	let x = entry_point[0]
	let y = entry_point[1]

	for(let i=x-1; i<=x+1; i++) {
		for(let j=y-1; j<=y+1; j++) {
		}
	}
	
	let full_graph = []
	return full_graph
}


function expandField(field, size) {
	let part = []
	for(let i=0; i<size-2; i++){ part.push(0) }

	field.push(part)
	field.unshift(part)

	for(let i=0; i<field.length; i++) {field[i].unshift(0); field[i].push(0)}
	return field
}


function getBorderPoint(field, point) {
	for(let i=0; i<field.length; i++) {
		for(let j=0;j<field.length; j++){
			if (field[i][j] == point) {
				return [i, j]
			}
		}
	}
}


function isSingle(field, point, player) {
	let count = 0;
	for(let i=point[0]-1; i<=point[0]+1; i++) {
		for(let j=point[1]-1; j<=point[1]+1; j++) {
			// console.log(i, j)
			if (field[i][j] == player){
				// console.log(field[i][j])
				count+=1;
			}
		}
	}
	if (count > 1){
		return false
	}
	return true
}


function setBorderField(field, entry_point, player, latest_point) {
	let direction = "RIGHT"

	switch(direction) {
		case "RIGHT":
			break;
		case "RIGHT-UP":
			break;
		case "UP":
			break;
		case "UP-LEFT":
			break;
		case "LEFT":
			break;
		case "LEFT-DOWN":
			break;
		case "DOWN":
			break;
		case "DOWN-RIGHT":
			break;
	}
}

function dropPoints(max_path) {
	let dropped = []
	let counter = 0

	for(let i=0; i<max_path.length; i++) {
		for(let j=0; j<max_path.lenth; j++) {
			console.log(max_path[i], max_path[j])
			if (JSON.stringify(max_path[i]) == JSON.stringify(max_path[j])) {
				counter++;
			}
		}
		if (counter == 1)
		{
			dropped.push(max_path[i])
		}
		counter = 0;
	}
	return dropped;
}



function calsSquare(field, player) {
	field = expandField(field, field.length)
	
	entry_point = getBorderPoint(field, player)
	
	all_points = getAllPoints(field, player)

	connect_matrix = getConnectMatrix(all_points)

	let position = getFirstPoint(connect_matrix)

	let max_path = getMaxPath(connect_matrix, position, position, position)

}

console.log("end = ", calsSquare(field, 2))


/*
function getMaxPath(connect_matrix, endpoint, thispoint, frompoint) {
	//console.log("this point", thispoint)
	// track = Object.assign([], track)
	let row = thispoint[1]
	for (let i=0; i<connect_matrix.length; i++) {
		if (connect_matrix[row][i] == 1) {
			// мы нашли новую точку
			// console.log("find new point", [row, i], "?", frompoint)
			// проверить, не пришли ли мы из неё
			
			if(JSON.stringify([thispoint[1], thispoint[0]]) != JSON.stringify(frompoint)) {
				// console.log("get back but no")
				// return []	

				if(JSON.stringify([i, row]) != JSON.stringify(frompoint)) {
					// console.log(frompoint, "not from ", [row, i])
					// проверить, не конечная ли это
					// console.log([row, i], endpoint,)
					if(i == endpoint[0]) {
						//console.log("this point", thispoint)
						//console.log("ENDPOINT", [row, i])
						//console.log("----------")
						return [[row, i]]
					} 
					else {
						// мы нашли конечную точку! возвращаемся
						let tmp = getMaxPath(connect_matrix, endpoint, [row, i], thispoint)

						return tmp.concat([row, i])

					}
				}

			}
		}
	}
}
*/