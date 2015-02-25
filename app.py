''' Shop slowly - add items to this web app.
See if you still want them 30 days later.

Also meant to serve as a light weight example using Python and NodeJS.

- Sqlalchemy describes and creates the database.
- Flask-Restless provides the API
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
# Flask App
# -----------------------------------
import flask
import flask.ext.sqlalchemy
import flask.ext.restless

app = flask.Flask(__name__)
app.config['DEBUG'] = True

# -----------------------------------
# Database models.
# -----------------------------------
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:////tmp/test.db'
db = flask.ext.sqlalchemy.SQLAlchemy(app)

class Purchase(db.Model):
    __tablename__ = 'purchase'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(255))
    price = db.Column(db.Float(precision=2))
    expected = db.Column(db.DateTime)
    bought = db.Column(db.DateTime)
    resolved = db.Column(db.DateTime)

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

# Base.metadata.create_all(engine)
# Purchase.metadata.create_all(engine)
_LOGGER.debug('finished creating db')


# Create the database tables.
db.create_all()

# -----------------------------------
# All about the app.
# This is a Flask app and an Eve app.
# (Eve app is a subclass of Flask app)
# -----------------------------------
# -----------------------------------
# API
# -----------------------------------

# Create the Flask-Restless API manager.
manager = flask.ext.restless.APIManager(app, flask_sqlalchemy_db=db)

# Create API endpoints, which will be available at /api/<tablename> by
# default. Allowed HTTP methods can be specified as well.
manager.create_api(Purchase, methods=['GET', 'POST', 'DELETE'])



# -----------------------------------
# Other pages
# -----------------------------------
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

# -----------------------------------
# Start the app
# -----------------------------------
_LOGGER.debug('about to start')
app.run(debug=True)
