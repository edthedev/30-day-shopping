BASEDIR=$(PWD)
VENV=$(BASEDIR)/ve
VPYTHON=$(VENV)/bin/python
VPIP=$(VENV)/bin/pip

########################################
#  Development Tasks
########################################

requirements:
	$(VPIP) install -r $(BASEDIR)/requirements.txt

checkin_all_the_things:
	cd $(BASEDIR); git commit -a -m "CHECKIN ALL THE THINGS!!1!"

#database: venv 
#	$(VPYTHON) $(BASEDIR)/app.py syncdb

runserver:
	$(VPYTHON) $(BASEDIR)/app.py

open: 
	open http://127.0.0.1:5000/
