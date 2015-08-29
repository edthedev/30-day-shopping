''' Shop slowly - add items to this web app.
See if you still want them 30 days later.

Also meant to serve as a light weight example using Python and React.js.

- PonyORM describes and creates the database.
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
# from datetime import timedelta



# Libraries

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
_DATABASE_FILE = "shopping.db"

from pony.orm import Database, Required, PrimaryKey, sql_debug, select, db_session, Optional
sql_debug(True)
db = Database('sqlite', _DATABASE_FILE, create_db=True)
from datetime import datetime
# Models

class Purchase(db.Entity):
    id = PrimaryKey(int, auto=True)
    name = Required(str)
    added = Required(datetime, default=datetime.now())
    price = Optional(float)
    bought = Required(bool, default=False)
    done = Optional(datetime)

    def to_json(self):
        view = self.to_dict()
        view['added'] = str(self.added)
        view['done'] = str(self.done)
        return view

db.generate_mapping(create_tables=True) 

    #def expected(self):
    #    return self.added + datetime.timedelta(days=self.price)

    #def save(self):
    #    ''' Add default behavior for expected Purchase date. '''
    #    if not self.expected:
#            if self.price:
#                # Wait one day per dollar of cost.
#                self.expected = self.added + timedelta(days=int(self.price))
#            else:
#                # Or 30 days if price is unknown.
#                self.expected = self.added + timedelta(days=30)
#        super(Purchase, self).save()

# ----------------------------------------
# Twitter Auth
# ----------------------------------------
from flask_oauthlib.client import OAuth
from six.moves.configparser import ConfigParser

CONF_FILE = os.path.join(APP_ROOT, _APP_NAME + '.conf')
_LOGGER.debug('Using Config file %s', CONF_FILE)

CONFIG = ConfigParser()
CONFIG.read(CONF_FILE)
app.secret_key = CONFIG.get('app', 'secret')

oauth = OAuth()
twitter = oauth.remote_app('twitter',
    base_url='https://api.twitter.com/1/',
    request_token_url='https://api.twitter.com/oauth/request_token',
    access_token_url='https://api.twitter.com/oauth/access_token',
    authorize_url='https://api.twitter.com/oauth/authenticate',
    consumer_key=CONFIG.get('twitter','key'),
    consumer_secret=CONFIG.get('twitter', 'secret'),
)

from flask import send_from_directory, url_for, request, session, redirect
@app.route('/login')
def login():
    return twitter.authorize(
        callback=url_for(
            'oauth_authorized', 
            next=request.args.get('next') or request.referrer or None))

@app.route('/logout')
def logout():
    session.pop('twitter_token', None)
    session.pop('twitter_user', None)
    return redirect(url_for('index'))

# ----------------------------------------------------
# API (with flask-restful, rather than flask-restless)
#   Why change? SQLAlchemy isn't fun. Pony ORM is.
#   flask-restless with SQLAlchemy
#     - Violates the Zen of Python by having way
#         more than one way to do things.
#     - Does things we don't need.
#     - Is a bit of a diva.
#   flask-restful with PonyORM
#     - Is fun.
#     - Looks and feels like LINQ, 
#         which we can all benefit from knowing anyway.
#     - Gets the job done with minimal fuss.
# ----------------------------------------------------

from flask_restful import Api, Resource

api = Api(app)

# -----------------------------------
# Custom API calls - Interesting stuff.
# -----------------------------------
from flask import send_from_directory, request
@app.route('/', methods=['GET'])
def index():
    _LOGGER.error('Index?')
    return send_from_directory(
        os.path.join(APP_ROOT), 'index.html')

class Planned(Resource):
    @db_session
    def get(self):
        #session = Session()
        #user = session['twitter_user']
        query = select(x for x in Purchase if x.bought != True).order_by(Purchase.added)
        results = [item.to_json() for item in query]
        _LOGGER.debug(results)
        return results

class Recent(Resource):
    @db_session
    def get(self):
        # session = Session()
        #user = session['twitter_user']
        query = select(x for x in Purchase if x.bought == True).order_by(Purchase.done)
        results = [item.to_json() for item in query][:10]
        return results

class NoBuy(Resource):
    @db_session
    def get(self):
        #session = Session()
        #user = session['twitter_user']
        query = select(x for x in Purchase if x.bought == False and x.done is not None ).order_by(Purchase.done)
        return [item.to_json() for item in query][:10]

from flask import jsonify

#    bs_saved = session.query(func.sum(Purchase.price).label('saved')).all()[0]
#    # _LOGGER.debug("WTF? %s", type(bs_saved))
#    # _LOGGER.debug("WTF2? %s", bs_saved.__dict__)
#    saved = bs_saved.__dict__['saved']
#    data = _uncrap(data)
#    return jsonify(data=data, saved=saved)

api.add_resource(Planned, '/api2/planned')
api.add_resource(Recent, '/api2/recent')
api.add_resource(NoBuy, '/api2/nobuy')

@app.route('/static/<path:thepath>')
def athingisdone(thepath):
    _LOGGER.error('Got a request for %s', thepath)
    return send_from_directory( os.path.join(APP_ROOT, 'static'), thepath)

# -------------------------------------
#  Let's just API
# -------------------------------------
class PurchaseAPI(Resource):
    @db_session
    def get(self):
        query = select(x for x in Purchase).order_by(Purchase.done)
        return [item.to_dict() for item in query][:10]

    @db_session
    def put(self, item_id):
        data = request.json
        Purchase[item_id].set(**data)
        return jsonify(Purchase[item_id].to_dict())


    @db_session
    def delete(self, item_id):
        item = Purchase[item_id]
        item.delete()
        return '', 204

class PurchaseListAPI(Resource):
    @db_session
    def post(self):
        data = request.json
        item = Purchase(**data)
        return jsonify(item.to_dict())


api.add_resource(PurchaseListAPI, '/api/purchase')
api.add_resource(PurchaseAPI, '/api/purchase/<string:item_id>')

# -----------------------------------
# Start the app
# -----------------------------------
_LOGGER.debug('about to start')
if __name__ == '__main__':
    app.run(debug=True)
