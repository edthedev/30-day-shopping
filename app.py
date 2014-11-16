# DATABASE
#-----------
from peewee import Model, SqliteDatabase
from peewee import CharField, DateField, BooleanField, DecimalField

db = SqliteDatabase('shopping.db')

class Purchase(Model):
    added = DateField()
    name = CharField()
    price = DecimalField()
    expected = DateField()
    bought = BooleanField()

    class Meta:
        database = db 

# Web app
#----------

from flask import Flask
app = Flask(__name__)

@app.route('/')
def hello_world():
    return 'Hello World!'

if __name__ == '__main__':
    app.run()
