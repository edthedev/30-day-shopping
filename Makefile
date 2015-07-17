BASEDIR=$(PWD)
VENV=$(BASEDIR)/ve
VPYTHON=$(VENV)/bin/python
VPIP=$(VENV)/bin/pip

########################################
#  Development Tasks
########################################
bower_reqs:
	bower install

venv:
	virtualenv $(VENV)

requirements:
	$(VPIP) install -r $(BASEDIR)/requirements.txt

setup: venv requirements bower_rews

checkin_all_the_things:
	cd $(BASEDIR); git commit -a -m "CHECKIN ALL THE THINGS!!1!"

#database: venv 
#	$(VPYTHON) $(BASEDIR)/app.py syncdb

runserver:
	$(VPYTHON) $(BASEDIR)/app.py

open: 
	open http://127.0.0.1:5000/

edit:
	vim app.py index.html static/controller.js

static_files:
	# Lodash is required by restangular
	cd static; npm install angular lodash restangular jquery bootstrap jquery-ui

taillog: 
	tail -f shopping.log

explore_db:
	sqlite3 shopping2.db
	# Hint: .tables .schema

postman:
	open chrome://apps/

########################################
#  Data tasks
########################################
HOSTNAME=ansible-chicago-apps
APP=shopping

# alter_table:
	# sqlite3 goals.db "alter table action add 'done' boolean default false;"

backup_database:
	ansible $(HOSTNAME) -m fetch -a "flat=yes dest=./$(APP).db src=/var/www/$(APP)/$(APP).db"

upload_database:
	ansible $(HOSTNAME) -m copy -a "backup=True src=./$(APP).db dest=/var/www/$(APP)/$(APP).db"


