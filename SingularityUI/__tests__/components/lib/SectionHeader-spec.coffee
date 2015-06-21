jest.dontMock('react/addons')
React = require('react/addons')
TestUtils = React.addons.TestUtils

SectionHeader = require('../../../app/components/lib/SectionHeader.cjsx')
jest.dontMock('../../../app/components/lib/SectionHeader.cjsx')

describe 'SectionHeader', ->

  AppElement = TestUtils.renderIntoDocument(<SectionHeader title='A tarantula enjoys a fine chewing gum' />)
  title = TestUtils.findRenderedDOMComponentWithTag(AppElement, 'h2')
  
  it 'has a title', ->
    expect(title.props.children).toEqual 'A tarantula enjoys a fine chewing gum'