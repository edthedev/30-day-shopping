
function unpack($obj){
//    console.log($obj);
    return $obj['objects'];
}
var today = moment().startOf('day');

var Purchase = React.createClass({
  update: function(updates) {
	id = this.props.obj.id;
    data = this.props.obj;
	for(var prop in updates)
	{
		data[prop] = updates[prop];
	}
	data['done'] = today.toISOString();
	console.log('data to PUT');
	console.log(data);
	$.ajax({
		url: 'api/purchase/' + id,
		type: 'PUT',
		data: JSON.stringify(data),
		contentType: 'application/json',
		success: function(result) {
			console.log('PUT! SUCCESS!');
		}
	});
  },
  add: function() {
	this.update({'name':'test1', 'price':5});
  },
  buy: function() {
	this.update({'bought':true});
  },
  render: function() {
		var buttons = <span><button className='btn btn-done' onClick={this.buy}>Bought</button><button className='btn' onClick={this.add}>Add</button></span>;

		if(this.props.done)
		{
			buttons = <button className='btn' onClick={this.redoAction}>Redo</button>;
		}

		return (
			<li> ${this.props.obj.price} - {this.props.obj.name} {buttons}
			</li>
		);
  }
});

var Planned = React.createClass({
  getInitialState: function() {
    return {data: []};
  }, 
  add: function() {
	data = {
		'name':'test',
	    'price':5
	}
	$.ajax({
		url: 'api/purchase',
		type: 'POST',
		data: JSON.stringify(data),
		contentType: 'application/json',
		success: function(result) {
			console.log('POST test record SUCCESS!');
		}
	});
  },

  ref_me: function() {
	console.log('called refreshed!');
	$.get('api2/planned', function(response)
		{
			data = unpack(response);
			console.log(data);
			if(this.isMounted()){
				this.setState({data: data});
			}
		}.bind(this));
  },
  componentDidMount: function() {
	console.log('called compdidmount!');
	this.ref_me();
  },
	render: function(){
		console.log('called render!');
		console.log('state:');
		console.log(this.state);
		var rows = this.state.data.map(function (item) {
				return (<Purchase key={item.id} name={item.name} obj={item}/>);
			});
		return (
			<div>
			<h3>Plan to Buy</h3>
			<ul>
			{rows}
			</ul>
			<button onClick={this.add}>Add Test Record</button>
			</div>
		);
	}
});

React.render(
  <div>
  <Planned />
  </div>,
  document.getElementById('content')
);
