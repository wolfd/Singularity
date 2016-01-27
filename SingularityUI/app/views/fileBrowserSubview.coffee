View = require './view'

class FileBrowserSubview extends View

    path = ''

    template: require '../templates/taskDetail/taskFileBrowser'

    sortUpIcon: 'ui-icon-triangle-1-n'
    sortDnIcon: 'ui-icon-triangle-1-s'

    events: ->
        'click [data-directory-path]':  'navigate'
        'click th': 'headerClick'

    initialize: ({ @scrollWhenReady }) ->
        @listenTo @collection, 'sync',  @render
        @listenTo @collection, 'error', @catchAjaxError
        @listenTo @model, 'sync', @render
        @listenTo @collection, 'sort', @updateTable
        @task = @model

        @scrollAfterRender = Backbone.history.fragment.indexOf('/files') isnt -1


    render: ->
        # Ensure we have enough space to scroll
        offset = @$el.offset().top

        breadcrumbs = utils.pathToBreadcrumbs @collection.currentDirectory

        emptySandboxMessage = 'No files exist in task directory.'

        if @task.get('taskUpdates') and @task.get('taskUpdates').length > 0
            switch _.last(@task.get('taskUpdates')).taskState
                when 'TASK_LAUNCHED', 'TASK_STAGING', 'TASK_STARTING' then emptySandboxMessage = 'Could not browse files. The task is still starting up.'
                when 'TASK_KILLED', 'TASK_FAILED', 'TASK_LOST', 'TASK_FINISHED' then emptySandboxMessage = 'No files exist in task directory. It may have been cleaned up.'

        @$el.html @template
            synced:                 @collection.synced and @task.synced
            files:                  _.pluck @collection.models, 'attributes'
            path:                   @collection.path
            breadcrumbs:            breadcrumbs
            task:                   @task.toJSON()
            emptySandboxMessage:    emptySandboxMessage

        # make sure body is large enough so we can fit the browser
        minHeight = @$el.offset().top + $(window).height()
        $('body').css 'min-height', "#{ minHeight }px"

        scroll = => $(window).scrollTop @$el.offset().top - 20
        if @scrollAfterRender
            @scrollAfterRender = false

            scroll()
            setTimeout scroll, 100

        @$('.actions-column a[title]').tooltip()

        @$('th div').append($('<span>')).closest('thead').find('span').addClass('ui-icon icon-none').end().find('[column="'+this.collection.sortAttribute+'"] span').removeClass('icon-none').addClass(this.sortUpIcon);

        @updateTable

    # headerClick and updateTable are from Ben Olsen's example here: 
    # http://www.benknowscode.com/2013/01/creating-sortable-tables-with-backbone_8752.html
    headerClick: (event) ->
        $el = $(e.currentTarget)
        newSortBy = $el.attr('column')
        currentSortBy = @collection.sortBy
        if newSortBy == currentSortBy
            @collection.sortDirection *= -1
        else
            @collection.sortDirection = 1

        $el.closest('thead').find('span').attr('class', 'ui-icon icon-none')

        if (@collection.sortDirection == 1)
            $el.find('span').removeClass('icon-none').addClass(this.sortUpIcon)
        else
            $el.find('span').removeClass('icon-none').addClass(this.sortDnIcon)

        @collection.sortCollection(newSortBy)

    updateTable: ->
        ref = @collection
        #@todo: Implement the rest of this function
        ###
            From the blog:
        updateTable: function () {
 
            var ref = this.collection,
                $table;
 
             _.invoke(this._movieRowViews, 'remove');
 
            $table = this.$('tbody');
 
            this._movieRowViews = this.collection.map(
                function ( obj ) {
                  var v = new MovieRow({  model: ref.get(obj) });
 
                  $table.append(v.render().$el);
 
                  return v;
            });
        }
        ###

    catchAjaxError: ->
        app.caughtError()
        @render()

    navigate: (event) ->
        event.preventDefault()

        $table = @$ 'table'
        # Get table height for later
        if $table.length
            tableHeight = $table.height()

        path = $(event.currentTarget).data 'directory-path'
        @collection.path = "#{ path }"

        app.router.navigate "#task/#{ @collection.taskId }/files/#{ @collection.path }"

        @collection.fetch reset: true

        @render()

        @scrollWhenReady = true
        $loaderContainer = @$ '.page-loader-container'
        if tableHeight?
            $loaderContainer.css 'height', "#{ tableHeight }px"

module.exports = FileBrowserSubview
