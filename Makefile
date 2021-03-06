BASEDIR=$(PWD)
VENV=$(BASEDIR)/ve
VPYTHON=$(VENV)/bin/python
VPIP=$(VENV)/bin/pip

########################################
#  Development Tasks
########################################
.PHONY: static

static:
	jsx -w jsx/ static/

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
	vim app.py index.html jsx/app.js

static_files:
	# Lodash is required by restangular
	cd static; npm install angular lodash restangular jquery bootstrap jquery-ui

taillog: 
	tail -f shopping.log

explore_db:
	echo "Hint: .tables .schema"
	sqlite3 shopping.db

dump_schema:
	sqlite3 shopping.db ".schema"

dump_data:
	sqlite3 shopping.db "select * from purchase"

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

########################################
# Deploy Tasks
########################################

upload:
	cd ~/projects/server-configs/www; make update APP=shopping
