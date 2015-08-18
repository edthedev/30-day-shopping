
var today = moment().startOf('day');

var Purchase = React.createClass({displayName: "Purchase",
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
  render: function() {
		var buttons = React.createElement("span", null, React.createElement("button", {className: "btn btn-done", onClick: this.buy}, "Bought"));

		if(this.props.obj.bought)
		{
			buttons = '';
		}

		return (
			React.createElement("li", null, " $", this.props.obj.price, " - ", this.props.obj.name, " ", buttons
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

var PurchaseList = React.createClass({displayName: "PurchaseList",
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
				return (React.createElement(Purchase, {key: item.id, name: item.name, obj: item, ref_method: ref_method}));
			});
		return (
			React.createElement("ul", null, 
			rows
			)
		);
	}
});

var Saved = React.createClass({displayName: "Saved",
  getInitialState: function() {
    return {data: [], saved: 0};
  }, 
  ref_me: function() {
	$.get('api2/nobuy', function(response)
		{
			if(this.isMounted()){
				this.setState(response);
			}
		}.bind(this));
  },
  componentDidMount: function() {
	this.ref_me();
  },
	render: function(){
		var rows = this.state.data.map(function (item) {
				return (React.createElement(Purchase, {key: item.id, name: item.name, obj: item}));
			});
		return (
			React.createElement("div", null, 
			React.createElement("h3", null, "Will not buy."), 
			React.createElement("p", null, "$", this.state.saved, " saved!"), 
			React.createElement("ul", null, 
			rows, 
			(rows.length==0)&&(React.createElement("li", null, "Nothing skipped yet."))
			)
			)
		);
	}
});

React.render(
  React.createElement("div", null, 
  React.createElement("h2", null, "Plan to Buy"), 
  React.createElement(PurchaseList, {api_url: "api2/planned"}), 
  React.createElement("h2", null, "Plan Another Purchase"), 
  React.createElement(PurchaseForm, {onPurchaseSubmit: this.add}), 
  React.createElement("h2", null, "Bought"), 
  React.createElement(PurchaseList, {api_url: "api2/recent"}), 
  React.createElement("h2", null, "Did Not Buy"), 
  React.createElement(PurchaseList, {api_url: "api2/nobuy"})
  ),
  document.getElementById('content')
);
