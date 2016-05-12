class Utils

    # Constants
    @TERMINAL_TASK_STATES: ['TASK_KILLED', 'TASK_LOST', 'TASK_FAILED', 'TASK_FINISHED']
    @DECOMMISION_STATES: ['DECOMMISSIONING', 'DECOMMISSIONED', 'STARTING_DECOMMISSION', 'DECOMISSIONING', 'DECOMISSIONED', 'STARTING_DECOMISSION']

    @pathToBreadcrumbs: (path="") ->
        pathComponents = path.split '/'
        # [a, b, c] => [a, a/b, a/b/c]
        results = _.map pathComponents, (crumb, index) =>
            path = _.first pathComponents, index
            path.push crumb
            return { name: crumb, path: path.join '/' }
        results.unshift { name: "root", path: "" }
        results

    @humanizeText: (text) ->
        return '' if not text
        text = text.replace /_/g, ' '
        text = text.toLowerCase()
        text = text[0].toUpperCase() + text.substr 1
        return text

    @humanizeFileSize: (bytes) ->
        k = 1024
        sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

        return '0 B' if bytes is 0
        i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), sizes.length-1)
        return +(bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i]

    @substituteTaskId: (value, taskId) ->
        value.replace('$TASK_ID', taskId)

    @getLabelClassFromTaskState: (state) ->
        switch state
            when 'TASK_STARTING', 'TASK_CLEANING'
                'warning'
            when 'TASK_STAGING', 'TASK_LAUNCHED', 'TASK_RUNNING'
                'info'
            when 'TASK_FINISHED'
                'success'
            when 'TASK_LOST', 'TASK_FAILED', 'TASK_LOST_WHILE_DOWN'
                'danger'
            when 'TASK_KILLED'
                'default'
            else
                'default'

    @fileName: (filePath) ->
        filePath.substring(filePath.lastIndexOf('/') + 1)

    @fuzzyAdjustScore: (filter, fuzzyObject) ->
        if fuzzyObject.original.id.toLowerCase().startsWith(filter.toLowerCase())
            fuzzyObject.score * 10
        else if fuzzyObject.original.id.toLowerCase().indexOf(filter.toLowerCase()) > -1
            fuzzyObject.score * 5
        else
            fuzzyObject.score

    @getTaskDataFromTaskId: (taskId) ->
        splits = taskId.split('-')
        {
            id: taskId
            rackId: splits[splits.length - 1]
            host: splits[splits.length - 2]
            instanceNo: splits[splits.length - 3]
            startedAt: splits[splits.length - 4]
            deployId: splits[splits.length - 5]
            requestId: splits[0..splits.length - 6].join '-'
        }

module.exports = Utils
