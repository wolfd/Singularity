TaskGroups = require '../../app/reducers/taskGroups'
TaskGroupsHelper = require '../../app/reducers/helpers/taskGroupsHelper'

chai = require 'chai'

chai.should()


describe 'Line Splitting with Timestamps', () ->
  it 'should split lines correctly', () ->
    TaskGroupsHelper.splitStringIntoTimestampedLines(
      10,
      0,
      "[1970-01-01 00:00:00,000] [whatisthis-1234 - POST /thing/api/woah/] INFO  fake.package.what.cache.Stuff - bumping lol:what:is:this"
    ).should.equal(
      {
        timestamp: 0
        data: "[1970-01-01 00:00:00,000] [whatisthis-1234 - POST /thing/api/woah/] INFO  fake.package.what.cache.Stuff - bumping lol:what:is:this"
        offset: 0
        taskId: 10
      }
    )

