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

# Web forms
# ------------
from wtfpeewee.orm import model_form
PurchaseForm = model_form(Purchase)

# Web app
#----------

from flask import Flask, render_template
app = Flask(__name__)

@app.route('/')
def hello_world():
    form = PurchaseForm()
    return render_template('template.html', form=form)

if __name__ == '__main__':
    app.debug = True
    app.run()
