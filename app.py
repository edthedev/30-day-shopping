# DATABASE
#-----------
from peewee import Model, SqliteDatabase
from peewee import CharField, DateField, BooleanField, DecimalField
from peewee import OperationalError

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
PurchaseForm.csrf = True

# Web app
#----------

from flask import Flask, render_template, request
app = Flask(__name__)

@app.route('/')
def hello_world():
    kwargs = {}
    form = PurchaseForm()

    # Maybe add an item.
    if request.method == 'POST':
        purchase = Purchase()
        form = PurchaseForm(request.form, obj=purchase)
        if form.validate():
            form.populate_obj(purchase)
            purchase.save()

    # Show add form and previously added items.
    kwargs['form'] = form
    kwargs['purchases'] = Purchase.select()
    return render_template('template.html', **kwargs)

if __name__ == '__main__':
    try:
        db.create_tables([Purchase])
    except OperationalError:
        print "Skipping table creation..."
    app.debug = True
    app.run()
