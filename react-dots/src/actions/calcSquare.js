function main(field, player1, player2) {
	let player_points = getAllPoints(field, player1)
	let enemy_points = getAllPoints(field, player2)
	let player_loops = []
	/* OK */
	let player_visited = setVisited(player_points.length)

	getGraphLoop(player_points, player_loops, player_visited)

	// проверяем, не появился ли цикл, окружение и домик
	player_loops.forEach(loop => {
		if(hasCapturedPoint(loop, enemy_points)) {
			// это окружение, так что его не нужно высчитывать
			// нужно просто залить все точки что принадлежат ему
			field = fillCircleSquare(field, loop, player1)
		}
	})

	return field
}

/* OK */
function fillCircleSquare(field, loop, player) {
	for(let i=0;i<field.length; i++) {
		for (let j=0; j<field.length; j++) {
			if(isInLoop(loop, [i, j])) {
				// если эта точка находится в цикле
				if(field[i][j][1] !== "l"){
					// если эта точка ещё не окружена
					// и не принадлежит игроку
					// и если точка не освобождена
					if(field[i][j][0] !== player && field[i][j][1] !== "f"){
						field[i][j] = field[i][j][0]+"l"
					}
				} else {
					// точка окружена и принадлежит игроку
					// тогда она освобождается
					if(field[i][j][0] === player) {
						field[i][j] = field[i][j][0]+"f"
					}

					// точка окружена и НЕ принадлежит игроку 
					// к примеру, точка взята в ДВА и более несвязных между собой цикла
					// тогда ничего не стоит делать

				}
			}
		}
	}

	return field
}

/* OK */
function hasCapturedPoint(loop, points) {
	for(let i=0; i<points.length; i++){
		if(isInLoop(loop, points[i])) {
			return true
		}
	}
	
	return false
}

/* OK */
function isInLoop(loop, point){
	let x = point[0]
	let y = point[1]
	let left = 0
	let right = 0
	let top = 0
	let bottom = 0
	// ищем окружение сразу в 4х направлениях
	loop.forEach(item => {
		if(item[0] === x && item[1] < y && left === 0) {
			left++;
		} else if(item[0] === x && item[1] > y && right === 0) {
			right++;
		} 
		else if(item[1] === y && item[0] < x && top === 0) {
			top++;
		} else if(item[1] === y && item[0] > x && bottom === 0) {
			bottom++;
		}
	})

	if(left+right+top+bottom === 4) {
		return true
	}
	return false
}

/* OK */
function getAllPoints(field, player) {
	let all_points = []

	for(let i=0; i<field.length; i++) {
		for(let j=0; j<field.length; j++) {
			if (field[i][j] === player) {
				all_points.push([i, j])
			}
		}
	}
	return all_points
}

/* DEPRECATED */
function setVisited(num) {
	let visited = []
	for(;num>0; num--) {
		visited.push(WHITE)
	}
	return visited
}

/* OK */
function isNeighbour(point1, point2) {
	try {
		if (JSON.stringify(point1) !== JSON.stringify(point2)
			&& Math.abs(point1[0] - point2[0]) < 2
			&& Math.abs(point1[1] - point2[1]) < 2
			&& Math.abs(point1[0] - point2[0]) - (Math.abs(point1[1] - point2[1])) <= 2)
		{
			return true
		}
	} catch(error) {return false}
	return false
}

/* OK */
function findLoop(path) {
	for (let q=path.length-1; q>=2; q--){
		for(let p=0; p<path.length; p++) {
			if (isNeighbour(path[p], path[q])) {
				let tmp = []
				for(let i=p; i<=q; i++){
					tmp.push(path[i])
				}
				if(tmp.length > 3){
					return tmp
				}
				return []
			}
		}
	}
}

/* OK */
function getGraphLoop(graph, loops, visited) {
	let path =[]
	/* OK */
	function dfs(index){
		visited[index] = GRAY
		for(let j=visited.length-1; j>=0; j--) {
			if (isNeighbour(graph[index], graph[j])) {
				if(visited[j] === WHITE) {
					path.push(graph[j])
					dfs(j)
					path.pop()
				}
			}
		}
        /* OK */
		if(path.length > 2){
			let tmp = findLoop(path)
			if(JSON.stringify([]) !== JSON.stringify(tmp)) {
				loops.push(tmp)
			}
		}
		visited[index] = BLACK
	}
    /* OK */
	for(let i=0; i<graph.length; i++) {
		if (visited[i] === WHITE) {
			path.push(graph[i])
			dfs(i)
			path.pop()
		}
	}
}


/* OK */
let WHITE = 'white';
let GRAY = 'gray';
let BLACK = 'black'



export default main