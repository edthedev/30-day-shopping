''' Shop slowly - add items to this web app.
See if you still want them 30 days later.

Also meant to serve as a light weight example using Python and NodeJS.

- Sqlalchemy describes and creates the database.
- Flask serves web pages and a couple APIs: api is stock REST, api2 is custom.
    (api2 is just a way to make the JavaScript .GET calls much simpler.)
- JQuery updates and fetches data from the API.
- React.js displays data fetched from the API.

-----------------------------------
License:

Copyright 2015 Edward Delaporte

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
DB_CONN = 'sqlite:///shopping.db'
app.config['SQLALCHEMY_DATABASE_URI'] = DB_CONN
db = flask.ext.sqlalchemy.SQLAlchemy(app)

class Purchase(db.Model):
    __tablename__ = 'purchase'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(255))
    price = db.Column(db.Float(precision=2))
    bought = db.Column(db.Boolean)
    done = db.Column(db.DateTime)
    expected = db.Column(db.DateTime)

#    class Meta:
#        database = db

    #def __repr__(self):
    #    _data = self.__dict__['_data']
    #    return "{expected} - {name} ${price}".format(**_data)

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
manager.create_api(Purchase,
        methods=['GET', 'PUT', 'POST', 'DELETE'],
        allow_functions=True,
        )

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
engine = create_engine(DB_CONN)
Session = sessionmaker(bind=engine)

# -----------------------------------
# Other pages
# -----------------------------------
from flask import send_from_directory
@app.route('/', methods=['GET'])
def index():
    _LOGGER.error('Index?')
    return send_from_directory(
        os.path.join(APP_ROOT), 'index.html')


from flask import jsonify
@app.route('/api2/planned', methods=['GET'])
def planned():
    session = Session()
    # TODO: Make me more discriminate again...
    # data = session.query(Purchase).filter(Purchase.bought != True).all()
    data = session.query(Purchase).all()
    # Remove ORM cruft:
    _ =  [d.__dict__.pop('_sa_instance_state') for d in data]
    result = [d.__dict__ for d in data]
    _LOGGER.debug("api2/planned: %s", result)
    return jsonify(objects=result)

@app.route('/static/<path:thepath>')
def athingisdone(thepath):
    _LOGGER.error('Got a request for %s', thepath)
    return send_from_directory( os.path.join(APP_ROOT, 'static'), thepath)

# -----------------------------------
# Start the app
# -----------------------------------
_LOGGER.debug('about to start')
if __name__ == '__main__':
    app.run(debug=True)
