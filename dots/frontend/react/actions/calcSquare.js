function main(field, player) {
	let all_points = getAllPoints(field, player)
	let loops = []
	let path = []
	
	let visited = setVisited(all_points.length)

	getGraphLoop(all_points, loops, visited)
	
	loops.forEach(loop => {
		fillPoints(field, loop, player)
		return
	})

	return field
}


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


function setVisited(num) {
	let visited = []
	for(;num>0; num--) {
		visited.push(WHITE)
	}
	return visited
}


function isNeighbour(point1, point2) {
	try {
		if (JSON.stringify(point1) != JSON.stringify(point2)
			&& Math.abs(point1[0] - point2[0]) < 2
			&& Math.abs(point1[1] - point2[1]) < 2
			&& Math.abs(point1[0] - point2[0]) - (Math.abs(point1[1] - point2[1])) <=2)
		{
			return true
		}
	} catch(error) {return false}
	return false
}


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


function getGraphLoop(graph, loops, visited) {
	let path =[]
	function dfs(index){
		visited[index] = GRAY
		for(let j=visited.length-1; j>=0; j--) {
			if (isNeighbour(graph[index], graph[j])) {
				if(visited[j] == WHITE) {
					path.push(graph[j])
					dfs(j)
					path.pop()
				}
			}
		}
		if(path.length > 2){
			let tmp = findLoop(path)
			if(JSON.stringify([]) != JSON.stringify(tmp)) {
				loops.push(tmp)
			}
		}
		visited[index] = BLACK
	}

	for(let i=0; i<graph.length; i++) {
		if (visited[i] == WHITE) {
			path.push(graph[i])
			dfs(i)
			path.pop()
		}
	}
}

function inArray(point, loop) {
	for(let i=0; i<loop.length; i++) {
		if (JSON.stringify(point) == JSON.stringify(loop[i])) {
			return true;
		}
	}
	return false
}

function isSurrounded(field, point, loop){
	const i = point[0];
	const j = point[1];
	let m = 0;
	let n = 0;
	let borders = 0;

	// проверяем в направлении вверх и низ
	for(let m=i; m>=0; m--){
		if (inArray([m, j], loop)) {
			borders++;
			break;
		}
	}

	for(let m=i; m<=field.length; m++){
		if (inArray([m, j], loop)) {
			borders++;
			break;
		}
	}

	// проверяем в направлении лево-право
	for(let m=j; m>=0; m--){
		if (inArray([i, m], loop)) {
			borders++;
			break;
		}
	}

	for(let m=j; m<field.length; m++){
		if (inArray([i, m], loop)) {
			borders++;
			break;
		}
	}

	
	//проверяем в направлении диагональ слева-направо сверху
	// !!!--------
	m = i
	n = j
	while(true){
		if(m == -1 || n == -1) {
			break
		}
		if (inArray([m, n], loop)) {
			borders++;
			break;
		}
		m--;
		n--;
	}
	
	// проверяем в направлении диагональ справа-налево сверху
	m = i
	n = j
	while(true){
		if(m == field.length || n == field.length) {
			break
		}
		if (inArray([m, n], loop)) {
			borders++;
			break;
		}
		m++;
		n++;
	}
	
	if(borders >= 4){ return true}
	return false
}


function fillPoints(field, loop, player){
	for(let i=0; i<field.length; i++){
		for(let j=0; j<field.length; j++)  {
			if( field[i][j]!=player && isSurrounded(field, [i, j], loop)) {
				field[i][j] = player
			}
		}
	}
}


// let visited = []
let WHITE = "white"
let GRAY = "gray"
let BLACK = "black"
let EMPTY = "empty"


// let path = []
// let loops = []
// let player = ""
// let field = [[]]
/*
let player = "red"
let field = [
	["", "", "red", "", ""],
	["", "", "red", "", ""],
	["", "red", "", "red", ""],
	["red", "", "red", "", "red"],
	["red", "red", "", "red", "red"],
]
*/

export default main