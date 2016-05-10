'use strict';
/**
 *  @jsx React.DOM
 **/
var React = require('react');
var TestUtil = require('react/lib/ReactTestUtils');
var LocalStorageMixin = require('./react-localstorage');
var assert = require('assert');

var ls = global.localStorage;
/*global describe, it, beforeEach, afterEach, before, after, expect */
describe("suite", function() {
  beforeEach(function(){
    ls.clear();
    // Cheap way to make the warn function throw so we can catch it easily
    console.warn = function() { throw new Error([].slice.call(arguments).join(' ')); };
  });

  var ComponentUseDisplayName = React.createClass({
    mixins: [LocalStorageMixin],
    displayName: 'component1',
    render: function () {
      return <div>hello</div>;
    }
  });

  it("should use displayName to store into localstorage", function() {
    var component = TestUtil.renderIntoDocument(<ComponentUseDisplayName />);
    component.setState({
      a: 'world'
    });
    assert.equal(
      JSON.stringify({a: 'world'}),
      ls.getItem('component1')
    );
  });

  var ComponentUseStorageKey = React.createClass({
    mixins: [LocalStorageMixin],
    displayName: 'component2',
    getDefaultProps: function () {
      return {
        'localStorageKey': 'component-key'
      };
    },
    render: function () {
      return <div>hello</div>;
    }
  });

  it("should use this.props.localStorageKey to store into localstorage", function() {
    var component = TestUtil.renderIntoDocument(<ComponentUseStorageKey />);
    component.setState({
      hello: 'moon'
    });
    assert.equal(
      JSON.stringify({hello: 'moon'}),
      ls.getItem('component-key')
    );
  });

  var ComponentUseMethod = React.createClass({
    mixins: [LocalStorageMixin],
    getLocalStorageKey: function() {
      return this.constructor.displayName + 'DynamicSuffix';
    },
    render: function () {
      return <div>hello</div>;
    }
  });

  it("should use this.getLocalStorageKey() to store into localstorage", function() {
    var component = TestUtil.renderIntoDocument(<ComponentUseMethod />);
    component.setState({
      rubber: 'ducky'
    });
    assert.equal(
      JSON.stringify({rubber: 'ducky'}),
      ls.getItem('ComponentUseMethodDynamicSuffix')
    );
  });

  var ComponentWithNoSetting = React.createClass({
    mixins: [LocalStorageMixin],
    render: function () {
      return <div>hello</div>;
    }
  });

  it("should use ComponentWithNoSetting to store into localstorage", function() {
    var component = TestUtil.renderIntoDocument(<ComponentWithNoSetting />);
    component.setState({
      hello: 'star'
    });
    assert.equal(
      JSON.stringify({hello: 'star'}),
      ls.getItem('ComponentWithNoSetting') //NOTICE: not `react-localstorage` because of JSX transform
    );
  });

  it('should throw error when state accidentally modified', function () {
    var component = TestUtil.renderIntoDocument(<ComponentWithNoSetting />);
    component.setState({
      hello: 'star'
    });
    component.state.fly = 'sky';
    expect(function(){
      component.setState({
        hello: 'jupiter'
      });
    }).toThrow();
  });

  it('should throw error when state accidentally modified by 2 components shared the same storage key', function () {
    var component1 = TestUtil.renderIntoDocument(<ComponentWithNoSetting />);
    var component2 = TestUtil.renderIntoDocument(<ComponentWithNoSetting />);
    component1.setState({
      hello: 'mercury'
    });

    expect(function(){
      component2.setState({
        hello: 'saturn'
      });
    }).toThrow();
  });

  it('should not throw error if we has update the component', function() {
    var Component = React.createClass({
      mixins: [LocalStorageMixin],
      displayName: 'component',
      getInitialState: function () {
        return {
        hello: null
        };
      },
      render: function () {
        return <div>hello</div>;
      }
    });
    var div = document.createElement('div');
    var component = React.render(<Component />, div);
    component.setState({
      hello: 'venus'
    });
    React.unmountComponentAtNode(div);

    // developer add a initial state for this component
    // and then deploy the updated code.
    // from now, the structure of the saved state
    // is not the same as the new one.
    // we should not throw error in this case.
    var ComponentUpdated = React.createClass({
      mixins: [LocalStorageMixin],
      displayName: 'component',
      getInitialState: function () {
        return {
          hello: null,
          newprop: null
        };
      },
      render: function () {
        return <div>hello</div>;
      }
    });
    div = document.createElement('div');
    component = React.render(<ComponentUpdated />, div);
    expect(function(){
      component.setState({
        hello: 'neptune'
      });
    }).not.toThrow();
  });

  var ComponentUseStateFilter = React.createClass({
    mixins: [LocalStorageMixin],
    displayName: 'componentStateFilter',
    getDefaultProps: function() {
      return {
        stateFilterKeys: ['a', 'b']
      };
    },
    render: function () {
      return <div>hello</div>;
    }
  });

  it("should only use state keys that match filter", function() {
    var component = TestUtil.renderIntoDocument(<ComponentUseStateFilter />);
    component.setState({
      a: 'world',
      b: 'bar',
      c: 'shouldNotSync'
    });
    assert.equal(
      JSON.stringify({a: 'world', 'b': 'bar'}),
      ls.getItem('componentStateFilter')
    );
  });

  var ComponentUseStateFilterFunc = React.createClass({
    mixins: [LocalStorageMixin],
    displayName: 'componentStateFilterFunc',
    getStateFilterKeys: function() {
      return ['a', 'b'];
    },
    render: function () {
      return <div>hello</div>;
    }
  });

  it("should only use state keys that match filter function", function() {
    var component = TestUtil.renderIntoDocument(<ComponentUseStateFilterFunc />);
    component.setState({
      a: 'world',
      b: 'bar',
      c: 'shouldNotSync'
    });
    assert.equal(
      JSON.stringify({a: 'world', 'b': 'bar'}),
      ls.getItem('componentStateFilterFunc')
    );
  });

  it("should shut off LS syncing with localStorageKey=false", function() {
    var component = TestUtil.renderIntoDocument(<ComponentUseDisplayName />);
    component.setState({
      a: 'world',
    });
    assert.equal(
      JSON.stringify({a: 'world'}),
      ls.getItem('component1')
    );

    var component2 = TestUtil.renderIntoDocument(<ComponentUseDisplayName localStorageKey={false} />);
    component2.setState({
      a: 'hello',
    });
    assert.equal(
      JSON.stringify({a: 'world'}),
      ls.getItem('component1')
    );
  });

  it("should support function as LS key", function() {
    var component = TestUtil.renderIntoDocument(
      <ComponentUseDisplayName localStorageKey={function() { return this.props.otherKey; }} otherKey="jenkees" />
    );
    component.setState({
      a: 'world',
    });
    assert.equal(
      JSON.stringify({a: 'world'}),
      ls.getItem('jenkees')
    );

    // Check returning false
    var component2 = TestUtil.renderIntoDocument(<ComponentUseDisplayName localStorageKey={() => false} />);
    component2.setState({
      a: 'hello',
    });
    assert.equal(
      JSON.stringify({a: 'world'}),
      ls.getItem('jenkees')
    );
  });
});
