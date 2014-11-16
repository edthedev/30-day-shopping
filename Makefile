BASEDIR=$(PWD)
VENV=$(BASEDIR)/ve
VPYTHON=$(VENV)/bin/python

########################################
#  Development Tasks
########################################

#database: venv 
#	$(VPYTHON) $(BASEDIR)/app.py syncdb

runserver:
	$(VPYTHON) $(BASEDIR)/app.py
