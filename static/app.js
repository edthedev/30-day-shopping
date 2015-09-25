var DISPLAY_DATE = "YYYY-MM-DD";
var today = moment().startOf('day');
var balance = 0;

var Purchase = React.createClass({displayName: "Purchase",
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
			"name": $("#name" + this.props.id).val()
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
	var edit_form = React.createElement("span", null, React.createElement("input", {id: "name" + this.props.id, onChange: this.update_from_form, defaultValue: this.props.obj.name}));
	var buy_button = React.createElement("button", {className: "btn btn-done", onClick: this.buy}, "Bought");
	var wont_buy = React.createElement("button", {className: "btn", onClick: this.nobuy}, "Will Not Buy");
	var buttons = React.createElement("span", {className: "btn-group"}, buy_button, wont_buy);

	var expected = " - " + this.expected();
	var unbuy_button = "";
	var display_unbuy = "";
	if(this.props.obj.done)
	{
		buttons = '';
		expected = '';
		unbuy_button = React.createElement("button", {className: "btn", onClick: this.unbuy}, "Rebuy");
	}
	var display = React.createElement("span", null, " $", this.props.obj.price, " - ", this.props.obj.name, " ");
	if(this.state.focus)
	{
		display = edit_form;
		display_unbuy = unbuy_button;
	}

	return (
		React.createElement("li", {onFocus: this.focus, onBlur: this.blur, onClick: this.focus}, 
		this.props.obj.bought, " ", display, " ", expected, " ", this.props.progress, 
		buttons, " ", display_unbuy
		)
	);
  }
});

var PurchaseForm = React.createClass({displayName: "PurchaseForm",
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
      React.createElement("form", {className: "purchaseForm", onSubmit: this.handleSubmit}, 
        React.createElement("input", {type: "price", placeholder: "Item name", ref: "name"}), 
        "$", React.createElement("input", {type: "price", placeholder: "20", ref: "price"}), 
        React.createElement("input", {type: "submit", value: "Post"})
      )
    );
  }
});


function daysBetween(one, another) {
	  return Math.round(Math.abs(one - another)/8.64e7);
}

// TODO: Wrap everything up in a Big component that refreshes all child lists each time there is a change.
var PurchaseList = React.createClass({displayName: "PurchaseList",
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
				var progress = (item.price / totalCost) * this.state.cashOnHand;
				return (React.createElement(Purchase, {id: item.id, key: item.id, name: item.name, obj: item, ref_method: ref_method, progress: progress}));
			}.bind(this));
		var add_form = "";
		if(this.props.api_url == "api2/planned")
		{
			add_form = (React.createElement("div", null, React.createElement("h2", null, "Plan Another Purchase"), " ", React.createElement(PurchaseForm, {onPurchaseSubmit: this.add})));
		}
		return (
			React.createElement("div", null, 
			React.createElement("p", null, "Total Days: ", totalDays), 
			React.createElement("p", null, "Total Cost: $", totalCost), 
			React.createElement("p", null, "Cash on Hand: $", this.state.cashOnHand), 
			React.createElement("p", null, "Cash on Hand: ", React.createElement("input", {id: "cashOnHand", onChange: this.updateCashOnHand})), 
			React.createElement("ul", null, 
			rows, 
			add_form
			)
			)
		);
	}
});

React.render(
  React.createElement("div", null, 
  React.createElement("h2", null, "Plan to Buy"), 
  React.createElement(PurchaseList, {api_url: "api2/planned"}), 
  React.createElement("h2", null, "Bought"), 
  React.createElement(PurchaseList, {api_url: "api2/recent"}), 
  React.createElement("h2", null, "Did Not Buy"), 
  React.createElement(PurchaseList, {api_url: "api2/nobuy"})
  ),
  document.getElementById('content')
);
