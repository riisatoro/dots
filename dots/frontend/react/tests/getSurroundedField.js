export const getSurrounded = () => {
	let user = {auth: true, token: ""}
	let components = {auth: false, showSettings: false, showField: true}
	let players = [{name: "WhoAmI", color: "R", index: 2}, {name: "IAmGrut", color: "B", index: 0}]
	let field_size = 10

	let field = [
		["E", "R", "R", "R", "R", "E", "E", "E", "E", "E"],
		["R", "E", "E", "E", "E", "R", "E", "E", "E", "E"],
		["R", "E", "E", "E", "E", "E", "R", "E", "E", "E"],
		["R", "E", "E", "R", "R", "E", "R", "E", "E", "E"],
		["R", "E", "R", "E", "E", "R", "R", "E", "E", "E"],
		["E", "R", "E", "E", "E", "R", "R", "E", "E", "E"],
		["E", "E", "E", "E", "E", "E", "E", "E", "E", "E"],
		["E", "E", "E", "E", "E", "E", "E", "E", "E", "E"],
		["E", "E", "E", "E", "E", "E", "E", "E", "E", "E"],
		["E", "E", "E", "E", "E", "E", "E", "E", "E", "E"]
	]

	
    return {
    	user: user,
		components: components,
		players: players,
		field: field, 
		game_end: false,
		turn: 0,
		field_size: field_size
	}
}