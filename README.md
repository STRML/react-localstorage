React-LocalStorage
==================

Simply synchronize a component's state with `localStorage`, when available.

Usage
-----

A simple component:

```javascript
var React = require('react');
var LocalStorageMixin = require('react-localstorage');

var TestComponent = module.exports = React.createClass({
  displayName: 'TestComponent',
  // This is all you need to do
  mixins: [LocalStorageMixin],

  getInitialState: function() {
    return {counter: 0};
  },

  onClick: function() {
    this.setState({counter: this.state.counter + 1});
  },

  render: function() {
    return (
      <span onClick={this.onClick}>{this.state.counter}</span>
    );
  }
});
```

Options
-------

The key that state is serialized to under `localStorage` is chosen with the following code:

```javascript
key = (component.getLocalStorageKey && component.getLocalStorageKey()) 
  || component.props.localStorageKey || component.displayName || 'react-localstorage';
```

If you are synchronizing multiple components with the same `displayName` to localStorage,
you must set a unique `localStorageKey` prop on the component.

Alternatively, you may define the method `getLocalStorageKey` on the component's prototype.
This gives you the freedom to choose keys depending on the component's props or state.

Server Rendering
----------------

`LocalStorageMixin` will call `setState` on `componentDidMount`, so it will not break server rendering
checksums. This is new as of `0.2.0`.


Tests
------

We use `karma` as the test runner. To run the test, simply `npm install` all the dependencies and run:

```bash
./node_modules/karma/bin/karma start
```

