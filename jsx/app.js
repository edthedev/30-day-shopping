
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

var PurchaseForm = React.createClass({
  handleSubmit: function(e) {
    e.preventDefault();
    var name = React.findDOMNode(this.refs.name).value.trim();
    var price = React.findDOMNode(this.refs.price).value.trim();
    if (!price || !name) {
      return;
    }
    this.props.onPurchaseSubmit({name: name, price: price});
    React.findDOMNode(this.refs.name).value = '';
    React.findDOMNode(this.refs.price).value = '';
  },
  render: function() {
    return (
      <form className="purchaseForm" onSubmit={this.handleSubmit}>
        <input type="price" placeholder="Item name" ref="name" />
        $<input type="price" placeholder="20" ref="price" />
        <input type="submit" value="Post" />
      </form>
    );
  }
});

var Planned = React.createClass({
  getInitialState: function() {
    return {data: []};
  }, 
  add: function(data) {
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
			<h2>Plan Another Purchase</h2>
			<PurchaseForm onPurchaseSubmit={this.add}/>
			</div>
		);
	}
});

var Recent = React.createClass({
  getInitialState: function() {
    return {data: []};
  }, 
  ref_me: function() {
	console.log('called refreshed!');
	$.get('api2/recent', function(response)
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
			<h3>Recently Bought</h3>
			<ul>
			{rows}
			</ul>
			</div>
		);
	}
});


React.render(
  <div>
  <Planned />
  <Recent />
  </div>,
  document.getElementById('content')
);
