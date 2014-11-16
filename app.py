# DATABASE
#-----------
from datetime import datetime
from peewee import Model, SqliteDatabase
from peewee import CharField, DateField, BooleanField, DecimalField
from peewee import OperationalError

db = SqliteDatabase('shopping.db')

class Purchase(Model):
    added = DateField(default=datetime.now)
    name = CharField()
    price = DecimalField(null=True)
    expected = DateField(null=True)
    bought = BooleanField(null=True)

    class Meta:
        database = db

    def __repr__(self):
        _data = self.__dict__['_data']
        return "{name} {price} {expected}".format(**_data)

# Web forms
# ------------
from wtfpeewee.orm import model_form
PurchaseForm = model_form(Purchase)
PurchaseForm.csrf = True

# Web app
#----------

from flask import Flask, render_template, request
app = Flask(__name__)

@app.route('/', methods = ['GET', 'POST'])
def hello_world():
    kwargs = {}
    form = PurchaseForm()
    kwargs['debug'] = 'Monkey!'

    # Maybe add an item.
    if request.method == 'POST':
        purchase = Purchase()
        form = PurchaseForm(request.form, obj=purchase)
        if form.validate():
            form.populate_obj(purchase)
            purchase.save()
            kwargs['debug'] = 'Saved'
        else:
            kwargs['debug'] = 'Invalid POST'

    # Show add form and previously added items.
    kwargs['form'] = form
    kwargs['items'] = Purchase.select()
    return render_template('template.html', **kwargs)

if __name__ == '__main__':
    try:
        db.create_tables([Purchase])
    except OperationalError:
        print "Skipping table creation..."
    app.debug = True
    app.run()
