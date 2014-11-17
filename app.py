
# DATABASE
#-----------
from datetime import datetime, timedelta
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

# Web forms
# ------------
from wtfpeewee.orm import model_form
PurchaseForm = model_form(Purchase, exclude=('added', 'expected', 'bought'))
PurchaseForm.csrf = True

# Web app
#----------

from flask import Flask, render_template, request
app = Flask(__name__)

@app.route('/', methods=['GET', 'POST'])
@app.route('/edit/<int:item_id>', methods=['GET', 'POST'])
def index(item_id=None):
    kwargs = {}
    form = PurchaseForm()
    kwargs['debug'] = 'Monkey!'

    purchase = Purchase()

    # Maybe edit an item
    if item_id:
        kwargs['debug'] = 'Editing item {}'.format(item_id)
        purchase = Purchase.get(Purchase.id==item_id)
        kwargs['edit_item'] = purchase

    # Make a form from our object.
    form = PurchaseForm(request.form, obj=purchase)

    # Maybe add an item.
    if request.method == 'POST':
        if form.validate():
            form.populate_obj(purchase)
            purchase.save()
            kwargs['debug'] = 'Saved'
        else:
            kwargs['debug'] = 'Invalid POST'

    # Show add form and previously added items.
    kwargs['form'] = form
    kwargs['items'] = Purchase.select().order_by(Purchase.expected)
    return render_template('template.html', **kwargs)

import logging
_LOGGER = logging.getLogger(__name__)

if __name__ == '__main__':
    try:
        db.create_tables([Purchase])
    except OperationalError:
        _LOGGER.info('Skipping table creation...')
    app.debug = True
    application = app
    application.run()
