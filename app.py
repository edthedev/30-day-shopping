''' Shop slowly - add items to this web app.
See if you still want them 30 days later.

Also meant to serve as a light weight example using Python and NodeJS.

- Sqlalchemy describes and creates the database.
- Eve provides the API, based on the Sqlalchemy model, 
and (in local development mode) serves the main index.html file.
- AngularJS provides the user experience, and sends data updates to the Eve API.

-----------------------------------
License:

Copyright 2014 Edward Delaporte

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
-----------------------------------

'''
__author__ = 'Edward Delaporte edthedev@gmail.com'

# -----------------------------------
# Imports
# -----------------------------------

# Python native imports
import os
import logging
from datetime import timedelta

# 3rd party imports
# Eve provides the app and API
from eve import Eve
from eve_sqlalchemy import SQL
from eve_sqlalchemy.validation import ValidatorSQL
# Sqlalchemy handles the database
#   and describes the data model for Eve.
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import func
from sqlalchemy import (
    Column,
    String,
    Integer,
    Float,
    DateTime)
from sqlalchemy import create_engine


# -----------------------------------
# Constants
# -----------------------------------
APP_ROOT = os.path.dirname(__file__)
_APP_NAME = 'shopping'

# -----------------------------------
# Logging
# -----------------------------------
_LOG_FILE = os.path.join(APP_ROOT, _APP_NAME + '.log')
logging.basicConfig(filename=_LOG_FILE, level=logging.DEBUG)
_LOGGER = logging.getLogger(__name__)
stream_handler = logging.StreamHandler()
stream_handler.setLevel(logging.DEBUG)
_LOGGER.addHandler(stream_handler)
_LOGGER.error('start')

# -----------------------------------
# Database models.
# -----------------------------------
Base = declarative_base()

class CommonColumns(Base):
    ''' Every table deserves created and updated datetime fields. '''
    __abstract__ = True
    _created = Column(DateTime, default=func.now())
    _updated = Column(DateTime, default=func.now(), onupdate=func.now())

class Purchase(CommonColumns):
    __tablename__ = 'purchase'
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(255))
    price = Column(Float(precision=2))
    expected = Column(DateTime)
    bought = Column(DateTime)
    resolved = Column(DateTime)

#    class Meta:
#        database = db

    def __repr__(self):
        _data = self.__dict__['_data']
        return "{expected} - {name} ${price}".format(**_data)

    def save(self):
        ''' Add default behavior for expected purchase date. '''
        if not self.expected:
            if self.price:
                # Wait one day per dollar of cost.
                self.expected = self.added + timedelta(days=int(self.price))
            else:
                # Or 30 days if price is unknown.
                self.expected = self.added + timedelta(days=30)
        super(Purchase, self).save()

engine = create_engine('sqlite:///shopping2.db')
Base.metadata.create_all(engine, checkfirst=True)
# Base.metadata.create_all(engine)
# Purchase.metadata.create_all(engine)
_LOGGER.debug('finished creating db')


# -----------------------------------
# All about the app.
# This is a Flask app and an Eve app.
# (Eve app is a subclass of Flask app)
# -----------------------------------
# -----------------------------------
# API
# -----------------------------------

from eve_sqlalchemy.decorators import registerSchema

registerSchema('purchase')(Purchase)
# The default schema is generated by the decorator
DOMAIN = {
    'purchase': Purchase._eve_schema['purchase'],
}

SETTINGS = {
    'DOMAIN': DOMAIN,
    'URL_PREFIX':'api',
}

app = Eve(settings=SETTINGS,
        validator=ValidatorSQL, data=SQL, static_url_path='/')

# Bind API to Database
db = app.data.driver
Base.metadata.bind = db.engine
db.Model = Base
# db.create_all(engine)


_LOGGER.debug('built eve app')
# Serve index for local testing...

from flask import send_from_directory
@app.route('/', methods=['GET'])
def index():
    _LOGGER.error('Index?')
    return send_from_directory(
        os.path.join(APP_ROOT), 'index.html')

@app.route('/static/<path:thepath>')
def athingisdone(thepath):
    _LOGGER.error('Got a request for %s', thepath)
    return send_from_directory( os.path.join(APP_ROOT, 'static'), thepath)


# bind SQLAlchemy
db = app.data.driver
Base.metadata.bind = db.engine
db.Model = Base
_LOGGER.debug('about to start')
app.run(debug=True)
