# Dots game
  
Game "Dots" is a game for two players.

# Requirements
* Python 3.x
* NodeJs 6.x  
* PostgreSQL 9.x/10.x/11.x

Also, don't forget about ***.env*** file in *dots/* . See *.env.example* and create your own ***.env***.

# Install dependencies  
Install pipenv for python:
```
pip install pipenv
```
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