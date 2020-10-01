/*
let field = [
	[0,0,2,2,2,0,0],
	[0,2,2,0,0,2,0],
	[2,0,0,0,0,0,2],
	[0,2,0,0,0,0,0],
	[0,0,2,0,0,0,2],
	[0,0,2,0,0,2,0],
	[0,0,2,2,2,0,0],
]




let tmp_field = []


function setEmpty(row, col) {
	let coordinates = []
	for(let i=0;i<row;i++){
		let tmp = []
		for (let j=0; j<col; j++){
			tmp.push(0)
		}
		coordinates.push(tmp)
	}
	return coordinates
}


function getBorders(tmp_field, player, coordinates) {
	for(let i=0;i<tmp_field.length; i++){
		for(let j=0;j<tmp_field.length; j++) {
			//ищем крайнюю слева
			if(tmp_field[i][j] == player) {
				coordinates[i][0] = [i, j]
				break;
			}
		}
		
		for(let j=tmp_field.length-1; j>=0; j--) {
			//ищем крайнюю справа
			if(tmp_field[i][j] == player) {
				coordinates[i][1] = [i, j]
				break;
			}
		}
	}	
	return coordinates;
}


function checkEmptyRow(tmp_field, coordinates) {
	for(let p=0; p<coordinates.length; p++) {
		coord = coordinates[p]
		row = coord[0][0]
		for(i=coord[0][1]; i<=coord[1][2]; i++) {
		let count = 0;
			for(let p=row-1; p<=row+1; p++) {
				for(let q=i-1; q<=i+1; q++) {
					if (tmp_field[p][q] == player){		
						count+=1;
					}
				}
			}

		if (count > 0) {
			return true
		}

		}
	}
	return false
}


function checkEmptyCol(tmp_field, coordinates) {
return false
}


function main(field, player) {
	tmp_field = Object.assign([], field)

	let coordinates = setEmpty(tmp_field.length, 2)

	coordinates = getBorders(tmp_field, player, coordinates)

	let emptyRow = checkEmptyRow(tmp_field, coordinates)
	let emptyCol = checkEmptyCol(tmp_field, coordinates)

	if (!emptyCol && !emptyCol) {
		console.log("LOOP")
	}
	else {
		console.log("NOT A BORDER")
	}

}

main(field, 2)







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



/*----------------------------------------------*/
/*
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
	let marked = []
	let connect_matrix = []

	for(let i=0; i<all_points.length; i++) {
		let connect_row = []
		for(let j=0; j<all_points.length; j++) {
			connect_row.push(0)			
		}
		marked.push(0)
		connect_matrix.push(connect_row)
	}

	for(let i=0; i<all_points.length; i++){
		for(let j=0; j<all_points.length; j++){
			if( Math.abs(all_points[i][0] - all_points[j][0]) < 2
				&& Math.abs(all_points[i][1] - all_points[j][1]) <2
				&& Math.abs(all_points[i][0] - all_points[j][0]) + (Math.abs(all_points[i][1] - all_points[j][1])) <=2
			) {
				if (JSON.stringify(all_points[i]) != JSON.stringify(all_points[j])) {
					// if(connect_matrix[j][i] != 1) { ориентированный граф}
					connect_matrix[i][j] = 1
				}
			}
		}
	}
	console.log(marked)
	return connect_matrix;
}


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

						//return tmp.concat([[row, i]])

					}
				}

			} else {
				//return []
			}
		}
	}
}

*/
/*
function getGraphLoop(points, parent, child, road){
	// child это ТЕКУЩАЯ точка
	console.log(parent, child)
	road.map(i => console.log(i))
	console.log("-------")

	if(road.length > 2) {
		console.log("MORE")
		for(let i=0; i<points.length; i++) {
			// найти первую соседнюю точку, которая ещё не пройдена  которая не является той же самой точкой
			if ( !inPath(points[i], road) && isEqual(points[i], child)) {
				// такую точку мы ещё не прошли
				// нужно проверить на соседство с родительской
				// а так же на возможное соседство с начальной для замыкания
				if(points[i][0] == child[1]) {
					if(points[i][1] == parent[0][0]) {
						//нашли замыкающую цикл точку
						console.log("LOOP", poins[i])
					} else {
						// точка не замыкающая
						// но всё ещё соседняя
						road.push(child)
						getGraphLoop(points, child, points[i], road)
						road.pop()
					}
				} else {
					// точка не замыкающая и не соседняя
					// приверить, не замыкает ли она соседние точки
					for(let k=0; k<road.path; k++) {
						if(road[k][1] == child[0]) {
							console.log("LOOP", poins[i])
						}
					}
				}
			} else {
				// эта точка уже в массиве, так что скажем ей прощай
			}
		}
	}

	else {
		// найти первую соседнюю точку, которая ещё не пройдена
		for(let i=0; i<points.length; i++) {
			if ( !inPath(points[i], road) && isEqual(points[i], child)) {
				// такую точку мы ещё не прошли
				// нужно проверить на соседство с родительской
				for(let j=0; j<points.length; j++) {
					if(child[1] == points[j][0]) {
						// значит это соседняя точка с ТЕКУЩЕЙ
						// нужно повторно искать её соседей
						// child теперь становится parent для новой найденной
						road.push(child)
						getGraphLoop(points, child, points[j], road)
						road.pop()
					}
				};
			}
		};
	}
}
*/

function getAllPoints(field, player) {
	let all_points = []

	for(let i=0; i<field.length; i++) {
		for(let j=0; j<field.length; j++) {
			if (field[i][j] == player) {
				all_points.push([i, j])
			}
		}
	}
	return all_points

}

function getConnectMatrix(all_points) {
	let marked = []
	let connect_matrix = []

	for(let i=0; i<all_points.length; i++) {
		let connect_row = []
		for(let j=0; j<all_points.length; j++) {
			connect_row.push(0)			
		}
		marked.push(0)
		connect_matrix.push(connect_row)
	}

	for(let i=0; i<all_points.length; i++){
		for(let j=0; j<all_points.length; j++){
			if( Math.abs(all_points[i][0] - all_points[j][0]) < 2
				&& Math.abs(all_points[i][1] - all_points[j][1]) <2
				&& Math.abs(all_points[i][0] - all_points[j][0]) + (Math.abs(all_points[i][1] - all_points[j][1])) <=2
			) {
				if (JSON.stringify(all_points[i]) != JSON.stringify(all_points[j])) {
					// if(connect_matrix[j][i] != 1) { ориентированный граф}
					connect_matrix[i][j] = 1
				}
			}
		}
	}
	return connect_matrix;
}


function inPath(elem, array) {
	for(let i=0; i<array.length; i++)
	{
		if(JSON.stringify(array[i]) == JSON.stringify(elem)) {
			return true
		}
	}
	return false
}

function isEqual(el1, el2) {
	if(JSON.stringify(el1) == JSON.stringify(el2)) {
		return true
	}
	return false
}

function getStrartPoint(field, player) {
	for(let i=0; i<field.length; i++) {
		for(let j=0; j<field.length; j++) {
			if (field[i][j] == player) {
				return [i,j]
			}
		}
	}
}

function getFirstChild(field, player, parent, path){
	for(let i=parent[0]-1; i<=parent[0]+1; i++) {
		for(let j=parent[1]-1; j<=parent[1]+1; j++) {
			try {
				if (field[i][j] == player && !inPath([i,j], path)) {
					// если это дочерняя точка и она не была пройдена
					return [i,j]
				}	
			}catch(error) {
			}
			
		}
	}
	return false
}

function isNeighbour(point1, point2) {
	if (JSON.stringify(point1) != JSON.stringify(point2)
		&& Math.abs(point1[0] - point2[0]) < 2
		&& Math.abs(point1[1] - point2[1]) <2
		&& Math.abs(point1[0] - point2[0]) - (Math.abs(point1[1] - point2[1])) <=2)
	{
		return true
	}
	return false
}

function isChildOfParent(child, parent) {
	if(child[1] == parent[0]){
		return true
	}
	return false
}


function getGraphLoop(field, player, parent, road){ 
	road.push(parent)
	//console.log(parent, ">>", road)

	let child = getFirstChild(field, player, parent, road)

	if(!child) {
		// это крайняя точка, которая не может образовать цикл
		return
	}

	if(road.length > 2) {
		for(let i=0; i<road.length; i++) {
			for(let j=road.length-1; j>=0; j--) {
				if(!isEqual(road[i], road[j])){
					if (isNeighbour(road[i], road[j]) && !isChildOfParent(road[i], road[j]))
					{
						console.log("FIND LOOP")
						console.log(road[i], road[j])
						return
					} else {
						getGraphLoop(field, player, child, road)
					}
				}
			}
		}
	} else {
		getGraphLoop(field, player, child, road)
	}


	//console.log(child)
}






function main(field, player) {
	let all_points = getAllPoints(field, player)
	let connect_matrix = getConnectMatrix(all_points)
	let connect_points = getAllPoints(connect_matrix, 1)
	let start_point = getStrartPoint(field, player)
	
	let result =  getGraphLoop(field, player, start_point, []) // road

	return result
}




let field = [
	["","red","","","","",""],
	["red","","","","","",""],
	["red","red","","","","",""],
	["","","","","","",""],
	["","","","","","",""],
	["","","","","","",""],
	["","","","","","",""]
]


let player = "red"

let result = main(field, player)
console.log(result)
