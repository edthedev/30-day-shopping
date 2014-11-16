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
from wtforms import Form, validators, StringField
class MyForm(Form):
    first_name = StringField(u'First Name', validators=[validators.input_required()])
    last_name  = StringField(u'Last Name', validators=[validators.optional()])

# Web app
#----------

from flask import Flask, render_template
app = Flask(__name__)

@app.route('/')
def hello_world():
    form = MyForm()
    return render_template('template.html', form=form)

if __name__ == '__main__':
    app.debug = True
    app.run()
