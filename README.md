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

# API for the game logic

## **create.py**
**get_new_field()**
- create an array that contains arrays of Point objects
- arguments
  - row - the number of rows
  - col - the number of cols
- return an array of arrays of Point objects (field)

## **main.py**
**find_loop()**
- find a loop in the set of points
- argumets
  - path - list of tuples; coordinates of path
- return list of tuples (coordinates) on empty list

**is_neighbour()**
- check if two points is a neighbors
- arguments
  - point_1 - first point, tuple
  - point_2 - second point, tuple
- return True if points is a neighbors; either False

**is_in_loop()**
- check if the point in the figure creates a loop
- arguments
  - loop - list of tuples; coordinates of the loops
  - point - tuple with coordinates of the point
- return True if the point in loop figure; either False

**captured_enemy()**
- check if the loop figure contains one or more enemy points
- arguments
  - field - an array of arrays of Point objects
  - loop - an array of tuples; coordinates of points in the loop
  - enemy_color - array of dicts {"player_id": int, "color": str}
- return True if one or more enemy points in the loop; either False

**calc_loops()**
- search loops in the game field from the last placed point
- arguments
  - point - tuple; coordinates of the latest placed point
  - field - game field; an array of arrays of Point objects
  - enemy_color - array of dicts {"player_id": int, "color": str} with only enemy colors
- return always ONE array with a minimal amount of points, which creates a loop figure and has one or more captured points or empty array  
    
**find_loops_id()**
- find all ID of the loops figure
- arguments
  - field - array of array of Point objects
- return set of ID(int) of the loops figure; or empty set
    
**set_point_as_loop()**
- set new ID for the points in the loop on the GameField
- arguments
  - field - array of Point objects
  - loop - array of points coordiantes in the field
- return updated field

**set_captured_points()**
- set points as captured in loop, except player points who captured
- arguments
  - field - array of array of Point objects
  - loop - array of tuple coordinates of loop figure
  - color - dicts {"player_id": int, "color": str}
- return new field

**is_surrounded()**
- check if the free point is in the loop, which has no enemy points, if true, call functions to capture this point
- arguments
  - point - latest coordinates of the created point
  - field - the game field with Point objects
  - colors - array of dicts {"player_id": int, "color": str}
- return updated field

**process()**
- call other functions to update the game field
- arguments
  - point - new point, clicked by the player
  - field - old game field
  - player_color - the color of the player, who set this point
  - colors - array of dicts {"player_id": int, "color": str}
- return updated field