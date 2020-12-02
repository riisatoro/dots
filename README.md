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

Readme