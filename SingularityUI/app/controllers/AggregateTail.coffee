Controller = require './Controller'

LogLines = require '../collections/LogLines'
RequestTasks = require '../collections/RequestTasks'
TaskHistory = require '../models/TaskHistory'
AjaxError = require '../models/AjaxError'

AggregateTailView = require '../views/aggregateTail'

class AggregateTailController extends Controller

    initialize: ({@requestId, @path, @offset}) ->
        @title 'Aggregate Tail of ' + @path

        @models.ajaxError = new AjaxError

        @collections.activeTasks = new RequestTasks [],
            requestId: @requestId
            state:    'active'

        @tails = []

        @setView new AggregateTailView _.extend {@requestId, @path, @offset},
            collection: @tails
            ajaxError: @models.ajaxError

        app.showView @view

        @refresh()

        if @offset?
            $.when.apply($, @tails.map((t) ->
                        t.logLines.fetchOffset(@offset)
                    ).concat(@tails.map((t) ->
                        t.taskHistory.fetch()
                    ))
            ).then => @view.afterInitialOffsetData()
        else
            $.when.apply($, @tails.map((t) ->
                        console.log t
                        t.logLines.fetchInitialData()
                    ).concat(@tails.map((t) ->
                        t.taskHistory.fetch()
                    ))
            ).then => @view.afterInitialData()

    refresh: =>
        promise = @collections.activeTasks.fetch()
        promise.success =>
            @tails = []
            @tails = @collections.activeTasks.toJSON().map (task) =>
                logLines: new LogLines [], {taskId: task.taskId.id, @path, ajaxError: @models.ajaxError}
                taskHistory: new TaskHistory {taskId: task.taskId.id}
        return promise


module.exports = AggregateTailController
