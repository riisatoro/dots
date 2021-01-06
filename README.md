# Dots game
  
Game "Dots" is a game for two players.

# Requirements
* Python 3.8
* NodeJs 7.0.4  
* PostgreSQL 13.1

Also, don't forget about ***.env*** file in *dots/* . See *.env.example* and create your own ***.env***.

# Install dependencies  
Install virtualenv for Windows:
```
pip install virtualenv
```
or for Unix:
```
pip3 install virtualenv
```

Then install all required packages:
```
pip install -r requirements.txt
```

# Troubles with psycopg2
To use postgres you should install psycopg2. It installs form venv, however, there can be some issues. To fix that, try:
```
pip install psycopg2-binary
```

# Migrations
To apply migrations from django to database, run:
```
python3 manage.py makemigrations
python3 manage.py migrate
```
***Don't forget*** to fill ***.env*** file with database name, user & password.

# Run
Now you can run django server, that includes compiled ***React.js*** app.  
```
cd dots
pipenv run python manage.py runserver
```
Open in your browser this URL: 127.0.01:8000/  

# Frontend  
Install node dependencies:
```
npm install 
```
Now you can change react app in *dots/frontend/react/* .
To compile the react app, use:
```
npm run dev
```
Make changes and reload the web page.

# Package dependencies  
For ***Python*** see ***Pipfile***  
For ***Node*** see ***package.json***
---
# API for the game core


## Field()
A class with methods for creating and updating the GameField  

`create_field(height: int, width: int)`  
Create a new empty game

`change_owner(field: GameField, point: namedtuple, owner: int)`  
Update FieldPoint in the GameField, changed it player owner

`is_full_field(field: GameField)`  
Check if GameField has no empty points

`add_loop(field: GameField, loop: Point)`  
Addind a new loop into the GameField

`add_empty_loop(field: GameField, loop: Point)`  
Adding a new loop without points in it  

`add_player(field: GameField, player: int) -> GameField`  
Adding new player in the field  


## GameCore()
A class with main logic of the game  

`find_all_new_loops(field: GameField, point: Point, owner: int)`  
Find all new loops in the GameField starting from the point  

`has_enemy_points(field: GameField, loop: [Point, ...])`  
Check if loop contains enemy points  

`player_set_point(field: GameField, point: Point, owner: int)`  
Main function that call other, to calculate updates, when player set point  

`is_point_in_empty_loop(field: GameField, point: Point, enemy: int)`  
Check if player set point in the empty loop  

`calc_score(field: GameField)`  
Calculate new score for all players  

`set_captured_points(field: GameField, loop: [Point, ...], owner: id)`  
Update points to captured points in loop  

`is_allowed_to_set_point(field: GameField, point: Point)`  
Check if player allowed to set point in the cell  

`is_loop_already_found(field: GameField, loop: [Point, ...])`  
Check if loop alreay in list of loops  


## GameField()
A class with attributes, contains information about points, loops, empty loops, etc.

`self.owners = [1, 2, ...]`  
Array of id of all players  

`self.field = [[GamePoint, ...], ...]`  
Containt all game points in the field  

`self.loops = {0: [Point, ...], 1: [Point, ...], ...}`  
Contains all calculated loops, as _key_ required ID of the loop  

`self.empty_loops = {0: [Point, ...], 1: [Point, ...], ...}`  
Containt all loops without point in it  

`self.score = {0: 10, 1: 20, ... }`  
Containt amount of captured points for all players  


## Point()  
A namedtuple with x and y coordinates of point in the GameField  

`Point.x`  
An index of the row in the `GameField.field`  

`Point.y`  
An index of the element in row in the `GameField.field`  


## GamePoint()  
A class with attributes, contains information about owner and captured player  

`self.owner = 1`  
An id of the owner(player) of this point. `None` by default  

`self.captured = [1, 2, ...]`  
An list of IDs of the players, who captured this point. `None` by default. The last element is the latest player, who captured it.  

---