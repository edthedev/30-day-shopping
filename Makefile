BASEDIR=$(PWD)
VENV=$(BASEDIR)/ve
VPYTHON=$(VENV)/bin/python
VPIP=$(VENV)/bin/pip

########################################
#  Development Tasks
########################################
venv:
	virtualenv $(VENV)

requirements:
	$(VPIP) install -r $(BASEDIR)/requirements.txt

setup: venv requirements

checkin_all_the_things:
	cd $(BASEDIR); git commit -a -m "CHECKIN ALL THE THINGS!!1!"

#database: venv 
#	$(VPYTHON) $(BASEDIR)/app.py syncdb

runserver:
	$(VPYTHON) $(BASEDIR)/new.py

open: 
	open http://127.0.0.1:5000/

edit:
	vim app.py templates/template.html

angular:
	# Lodash is required by restangular
	cd static;npm install angular lodash restangular

taillog:
	tail -f shopping.log
