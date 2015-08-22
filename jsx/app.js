var DISPLAY_DATE = "YYYY-MM-DD";
var today = moment().startOf('day');
var balance = 0;

var Purchase = React.createClass({
  update: function(updates) {
	updates["id"] = this.props.obj.id;
	var ref_method = this.props.ref_method;
	console.log('ref_method', ref_method);
	$.ajax({
		url: 'api/purchase/' + this.props.obj.id,
		type: 'PUT',
		data: JSON.stringify(updates),
		contentType: 'application/json',
		success: function(result) {
			console.log('PUT! SUCCESS!');
			ref_method();
		}.bind(this)
	});
  },
  add: function() {
	this.update({'name':'test1', 'price':5});
  },
  buy: function() {
	this.update({'bought':true});
  },
  expected: function()
  {
	  var result = moment(this.props.obj.added);
	  // assume $1 per day accrual
	  console.log("price...", this.props.obj.price);
	  result.add(this.props.obj.price, "days");
	  console.log("exp", result);
	  return result.format(DISPLAY_DATE);
  },
  render: function() {
		var buttons = <span> - {this.expected()} <button className='btn btn-done' onClick={this.buy}>Bought</button></span>;

		if(this.props.obj.bought)
		{
			buttons = '';
		}

		return (
			<li> {this.props.obj.bought} ${this.props.obj.price} - {this.props.obj.name} {buttons}
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


// TODO: Wrap everything up in a Big component that refreshes all child lists each time there is a change.
var PurchaseList = React.createClass({
  getInitialState: function() {
    return {data: []};
  }, 
  ref_me: function() {
	console.log('called refreshed!');
	$.get(this.props.api_url, function(response)
		{
			data = response;
			console.log(data);
			if(this.isMounted()){
				this.setState({data: data});
			}
		}.bind(this));
  },
  add: function(data) {
	$.ajax({
		url: 'api/purchase',
		type: 'POST',
		data: JSON.stringify(data),
		contentType: 'application/json',
		success: function(result) {
			console.log('POST test record SUCCESS!');
			this.ref_me();
		}.bind(this)
	});
  },
  componentDidMount: function() {
	console.log('called compdidmount!');
	this.ref_me();
  },
	render: function(){
		console.log('called render!');
		console.log('state:');
		console.log(this.state);
		var ref_method = this.ref_me;
		var rows = this.state.data.map(function (item) {
				return (<Purchase key={item.id} name={item.name} obj={item} ref_method={ref_method}/>);
			});
		var add_form = "";
		if(this.props.api_url == "api2/planned")
		{
			add_form = (<div><h2>Plan Another Purchase</h2> <PurchaseForm onPurchaseSubmit={this.add}/></div>);
		}
		return (
			<ul>
			{rows}
			{add_form}
			</ul>
		);
	}
});

React.render(
  <div>
  <h2>Plan to Buy</h2>
  <PurchaseList api_url="api2/planned" />
  <h2>Bought</h2>
  <PurchaseList api_url="api2/recent" />
  <h2>Did Not Buy</h2>
  <PurchaseList api_url="api2/nobuy" />
  </div>,
  document.getElementById('content')
);
