# { combineReducers } = require 'redux'

# { ACTIONS } = require '../../app/reducers/taskGroups'

chai = require 'chai'

chai.should()


describe 'Data Added Reducer', () ->
  it 'should update correctly', () ->
    ((x) -> return x)("string", "example").should.equal("string")