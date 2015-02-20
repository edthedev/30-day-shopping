import os
import logging
from datetime import timedelta

APP_ROOT = os.path.dirname(__file__)
_APP_NAME = 'shopping'

# -----------------------------------
# Logging
# -----------------------------------
_LOG_FILE = os.path.join(APP_ROOT, _APP_NAME + '.log')
logging.basicConfig(filename=_LOG_FILE, level=logging.DEBUG)
_LOGGER = logging.getLogger(__name__)

# -----------------------------------
# Database
# -----------------------------------
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import func
from sqlalchemy import (
    Column,
    String,
    Integer,
    Float,
    DateTime)
from sqlalchemy import create_engine


Base = declarative_base()

class CommonColumns(Base):
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
}

from eve import Eve
from eve_sqlalchemy import SQL
from eve_sqlalchemy.validation import ValidatorSQL

app = Eve(settings=SETTINGS, validator=ValidatorSQL, data=SQL)

# Serve index for local testing...

from flask import send_from_directory
@app.route('/index', methods=['GET'])
def index():
    return send_from_directory(
        os.path.join(APP_ROOT), 'index.html')

@app.route('/static/<path:path>', methods=['GET'])
def send_static(path):
    return send_from_directory(
        os.path.join(APP_ROOT), 'index.html')

    #return send_from_directory(
    #    os.path.join(APP_ROOT, 'static'), path)

# bind SQLAlchemy
db = app.data.driver
Base.metadata.bind = db.engine
db.Model = Base
app.run(debug=True)
