
function unpack($obj){
//    console.log($obj);
    return $obj['objects'];
}

var Purchase = React.createClass({
  update: function(updates) {
	id = this.props.id;
	ref_method = this.props.ref_method;
	api.one('purchase', id).get().then( function(response) {
		var item = response.body();
		var data = item.data();
		for(var prop in updates)
		{
			data[prop] = updates[prop];
		}
		item.save().then( function () { 
			ref_method();
		} );
	  });

  },
  laterAction: function() {
	console.log('clicked later');
	this.updateAction({'when':null});
  },
  render: function() {
		var buttons = <span><button className='btn btn-done' onClick={this.doneAction}>Done</button> <button className='btn btn-danger' onClick={this.laterAction}>Later</button> <button className='btn' onClick={this.tomorrowAction}>Tomorrow</button> <button className='btn' onClick={this.in2days}>+2 Days</button> <button className='btn' onClick={this.in3days}>+3 Days</button></span>;

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

var Planned = React.createClass({
  getInitialState: function() {
    return {data: []};
  }, 
  ref_me: function() {
	console.log('called refreshed!');
	$.get('api/purchase', function(response)
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
				return (<Purchase id='1' name='Ralph' />);
			});
		return (
			<ul>
			What happen? We get signal. 
			{rows}
			</ul>
		);
	}
});

React.render(
  <div>
  <Planned />
  </div>,
  document.getElementById('content')
);
