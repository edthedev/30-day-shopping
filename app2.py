''' Shop slowly - add items to this web app.
See if you still want them 30 days later.
-----------------------------------
License:

Copyright 2016 Edward Delaporte

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

app = flask.Flask(__name__)
app.config['DEBUG'] = True

# -----------------------------------
# Database - No ORM this time.
# -----------------------------------
_DATABASE_FILE = "shopping.db"

import sqlite3
conn = sqlite3.connect(_DATABASE_FILE)

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
        # query = select(x for x in Purchase if x.bought != True).order_by(Purchase.added)

        sql = "select * from Purchase where bought = 0 and done is null order by added;"
        query = Purchase.select_by_sql(sql)

        results = [item.to_json() for item in query]
        _LOGGER.debug(results)
        return results

class Recent(Resource):
    @db_session
    def get(self):
        # session = Session()
        #user = session['twitter_user']
        # query = select(x for x in Purchase if x.bought == True).order_by(Purchase.done)
        sql = "select * from Purchase where bought = 1 and done is not null;"
        query = Purchase.select_by_sql(sql)
        results = [item.to_json() for item in query][:10]
        return results

class NoBuy(Resource):
    @db_session
    def get(self):
        #session = Session()
        #user = session['twitter_user']
        # query = select(x for x in Purchase if x.bought == False and x.done is not None ).order_by(Purchase.done)
        sql = "select * from Purchase where bought = 0 and done is not null;"
        query = Purchase.select_by_sql(sql)
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

def fix_date(data):
    if("done" in data):
        if(data["done"] != ""):
            data["done"] = dateutil.parser.parse(request.json["done"])
        else:
            data["done"] = None
    return data

import dateutil
class PurchaseAPI(Resource):
    @db_session
    def get(self):
        query = select(x for x in Purchase).order_by(Purchase.done)
        return [item.to_dict() for item in query][:10]

    @db_session
    def put(self, item_id):
        data = request.json
        data = fix_date(data)
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
        data = fix_date(data)
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
