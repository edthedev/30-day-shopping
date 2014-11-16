BASEDIR=$(PWD)
VENV=$(BASEDIR)/ve
VPYTHON=$(VENV)/bin/python

########################################
#  Development Tasks
########################################

#database: venv 
#	$(VPYTHON) $(BASEDIR)/app.py syncdb

runserver:
	$(VPYTHON) $(BASEDIR)/app.py &

open: runserver
	open http://127.0.0.1:5000/
