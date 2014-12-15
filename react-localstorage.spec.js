/**
 *  @jsx React.DOM
 **/
var React = require('react');
var TestUtil = require('react/lib/ReactTestUtils');
var localstorageMixin = require('./react-localstorage');
var assert = require('assert');

var ls = global.localStorage;

describe("suite", function() {
    beforeEach(function(){
        ls.clear();
    });

    var ComponentUseDisplayName = React.createClass({
        mixins: [localstorageMixin],
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
        mixins: [localstorageMixin],
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

    var ComponentWithNoSetting = React.createClass({
        mixins: [localstorageMixin],
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
            mixins: [localstorageMixin],
            displayName: 'component',
            getInitialState: function () {
              return {
                hello: null
              }
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

        // develop add a initial state for this component
        // and then deploy the updated code.
        // from now, the structure of the saved state
        // is not the same as the new one.
        // we should not throw error in this case.
        var ComponentUpdated = React.createClass({
            mixins: [localstorageMixin],
            displayName: 'component',
            getInitialState: function () {
              return {
                hello: null,
                newprop: null
              }
            },
            render: function () {
              return <div>hello</div>;
            }
        });
        var div = document.createElement('div');
        var component = React.render(<ComponentUpdated />, div);
        expect(function(){
          component.setState({
              hello: 'neptune'
          });
        }).not.toThrow();

    });
});
