var DISPLAY_DATE = "YYYY-MM-DD";
var today = moment().startOf('day');
var balance = 0;

var Purchase = React.createClass({
  getInitialState: function() {
    return {focus: false};
  }, 
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
  update_from_form: function()
	{
		var updates = {
			"name": $("#name" + this.props.id).val(),
			"price": $("#price" + this.props.id).val()
		};
		console.log("updates", updates);
		console.log("props", this.props);
		this.update(updates);
	},
  add: function() {
	this.update({'name':'test1', 'price':5});
  },
  nobuy: function() {
	this.update({'bought':false, 'done':moment().format()});
  },
  buy: function() {
	this.update({'bought':true, 'done':moment().format()});
  },
  unbuy: function() {
	this.update({'bought':false, 'done':""});
  },
  expected: function()
  {
	  var result = moment(this.props.obj.added);
	  // assume $1 per day accrual
	  // console.log("price...", this.props.obj.price);
	  result.add(this.props.obj.price, "days");
	  // console.log("exp", result);
	  return result.format(DISPLAY_DATE);
  },
  focus: function() {
	  this.setState({focus:true});
  },
  blur: function() {
	  this.setState({focus:false});
  },
  render: function() {
	var edit_form = <span> <input id={"price" + this.props.id} onChange={this.update_from_form} defaultValue={this.props.obj.price} />
		<input id={"name" + this.props.id} onChange={this.update_from_form} defaultValue={this.props.obj.name} /> </span>;
	var buy_button = <button className='btn btn-done' onClick={this.buy}>Bought</button>;
	var wont_buy = <button className='btn' onClick={this.nobuy}>Will Not Buy</button>;
	var buttons = <span className="btn-group">{buy_button}{wont_buy}</span>;

	var expected = " - " + this.expected();
	var unbuy_button = "";
	var display_unbuy = "";
	console.log("done", this.props.obj.done);
	if(this.props.obj.done != "None")
	{
		buttons = '';
		expected = '';
		unbuy_button = <button className='btn' onClick={this.unbuy}>Rebuy</button>;
	}
	var display = <span> ${this.props.obj.price} - {this.props.obj.name} </span>;
	if(this.state.focus)
	{
		display = edit_form;
		display_unbuy = unbuy_button;
	}

	return (
			<li>
		<p onFocus={this.focus} onBlur={this.blur} onClick={this.focus}>
		{this.props.obj.bought} {display} {expected} 
		</p>
		<p>Recommended amount to apply: ${this.props.progress.toFixed(2)}</p>
		{buttons} {display_unbuy}
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


function daysBetween(one, another) {
	  return Math.round(Math.abs(one - another)/8.64e7);
}

// TODO: Wrap everything up in a Big component that refreshes all child lists each time there is a change.
var PurchaseList = React.createClass({
  getInitialState: function() {
    return {data: [], cashOnHand: 30};
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
  updateCashOnHand: function() {
	  var cash = $("#cashOnHand").val();
	  this.setState({cashOnHand: cash});
  },
	render: function(){

		var totalCost = 0;
		var totalDays = 0;
		for(item of this.state.data)
		{
			totalCost+=item.price;
			// var diff = daysBetween(Date(), Date(item.added));
			var oneDay = 24*60*60*1000; // hours*minutes*seconds*milliseconds
			var firstDate = new Date();
			var secondDate = new Date(item.added);
			var diffDays = Math.round(Math.abs((firstDate.getTime() - secondDate.getTime())/(oneDay)));
			console.log("diffDays", diffDays);
			totalDays+=diffDays;
		}

		console.log('called render!');
		console.log('state:');
		console.log(this.state);
		var ref_method = this.ref_me;
		var rows = this.state.data.map(function (item) {
				var firstDate = new Date();
				var secondDate = new Date(item.added);
				var diffDays = Math.round(Math.abs((firstDate.getTime() - secondDate.getTime())/(oneDay)));
				var pct = diffDays / totalDays;
				var progress = pct * this.state.cashOnHand;
				return (<Purchase id={item.id} key={item.id} name={item.name} obj={item} ref_method={ref_method} progress={progress} />);
			}.bind(this));
		var add_form = "";
		if(this.props.api_url == "api2/planned")
		{
			add_form = (<div><h2>Plan Another Purchase</h2> <PurchaseForm onPurchaseSubmit={this.add}/></div>);
		}
		return (
			<div>
			<p>Total Days: {totalDays}</p>
			<p>Total Cost: ${totalCost}</p>
			<p>Cash on Hand: ${this.state.cashOnHand}</p>
			<p>Cash on Hand: <input id="cashOnHand" onChange={this.updateCashOnHand} /></p>
			<ul>
			{rows}
			{add_form}
			</ul>
			</div>
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
