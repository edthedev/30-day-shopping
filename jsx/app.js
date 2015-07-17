var Action = React.createClass({
  updateAction: function(updates) {
	id = this.props.id;
	ref_method = this.props.ref_method;
	api.one('action', id).get().then( function(response) {
		var item = response.body();
		var data = item.data();
		console.log('got item');
	for(var prop in updates)
	{
		data[prop] = updates[prop];
	}
	console.log('updated');
	console.log('updated item');
	console.log(data);
		item.save().then( function () { 
			ref_method();
		} );
		console.log('saved item');
		console.log(item);
	  });

  },
  redoAction: function() {
	this.updateAction({'complete':null, 'when': today.toISOString()});
  },
  doneAction: function() {
	console.log('clicked done');
	this.updateAction({'complete':today.toISOString()});
  },
  laterAction: function() {
	console.log('clicked later');
	this.updateAction({'when':null});
  },
  tomorrowAction: function() {
	this.updateAction({'when':tomorrow});
  },
  in2days: function() {
	var when = today.clone();
	when.add(2, 'days');
	this.updateAction({'when':when});
  },
  in3days: function() {
	var when = today.clone();
	when.add(3, 'days');
	this.updateAction({'when':when});
  },
  render: function() {
		var buttons = <span><button className='btn btn-done' onClick={this.doneAction}>Done</button> <button className='btn btn-danger' onClick={this.laterAction}>Later</button> <button className='btn' onClick={this.tomorrowAction}>Tomorrow</button> <button className='btn' onClick={this.in2days}>+2 Days</button> <button className='btn' onClick={this.in3days}>+3 Days</button></span>;

		console.log('props.done?');
		console.log(this.props);
		if(this.props.done)
		{
			buttons = <button className='btn' onClick={this.redoAction}>Redo</button>;
		}

		return (
			<li> {this.props.name} {buttons}
			</li>
		);
  }
});
