moment = require 'moment'

class TaskGroupsHelper
  @TIMESTAMP_REGEX = [
    [/^(\d{2}:\d{2}:\d{2}\.\d{3})/, 'HH:mm:ss.SSS']
    [/^[A-Z \[]+(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2},\d{3})/, 'YYYY-MM-DD HH:mm:ss,SSS']
    [/^\[(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2},\d{3})/, 'YYYY-MM-DD HH:mm:ss,SSS']
  ]

  @parseLineTimestamp = (line) ->
    for group in @TIMESTAMP_REGEX
      match = line.match(group[0])
      if match
        return moment(match, group[1]).valueOf()
    return null

  @buildEmptyBuffer = (taskId, offset) -> 
    { taskId, offset, begin: '', end: '' }

  @splitStringIntoTimestampedLines = (taskId, offset, data) ->
    # split task data into separate lines, attempt to parse timestamp
    currentOffset = offset
    lines = _.initial(data.match /[^\n]*(\n|$)/g).map (data) ->
      currentOffset += data.length

      timestamp = @parseLineTimestamp(data)

      if timestamp
        detectedTimestamp = true

      # carriage return screws stuff up
      {timestamp, data: data.replace('\r', ''), offset: currentOffset - data.length, taskId}

module.exports = TaskGroupsHelper
