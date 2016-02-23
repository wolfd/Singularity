Table = require './Table'
PaginableCollection = require '../../collections/PaginableCollection'

#Searches by making a new API call for each page
CollapsableSearchTable = React.createClass

    defaultNumberOfPagesAroundCurrentPage: 2

    defaultNumberPerPage: 4

    defaultSortDirectionChoices: ['Ascending', 'Descending']

    increasePageNumber: ->
        if @props.increasePageNumber
            @props.increasePageNumber() 
        else
            @setState {currentPage: @state.currentPage + 1}

    decreasePageNumber: ->
        if @props.decreasePageNumber()
            @props.decreasePageNumber()
        else
            @setState {currentPage: @state.currentPage - 1} unless @state.currentPage <= 1

    setPageNumber: (page) ->
        if @props.setPageNumber
            # The server will handle pagination
            @props.setPageNumber(page)
        else
            @setState {currentPage: page} unless page < 1

    getNumberOfPages: ->
        return false if @props.dontKnowNumberOfPages
        if @props.numberOfPages 
            @props.numberOfPages 
        else
            Math.ceil (@props.collection.models.length / @getNumberPerPage()) # Round up

    getNumberOfPagesAroundCurrentPage: ->
        if @props.numberOfPagesAroundCurrentPage 
            @props.numberOfPagesAroundCurrentPage
        else if @props.dontKnowNumberOfPages
            0 # Don't show pages that may or may not exist
        else
            @defaultNumberOfPagesAroundCurrentPage

    getNumberPerPage: ->
        if @props.numberPerPage then @props.numberPerPage else @state.numberPerPage

    setNumberPerPage: (number) ->
        if @props.setNumberPerPage
            @props.setNumberPerPage number
        else
            @setState
                numberPerPage: number

    getSortDirection: ->
        if @props.sortDirection
            @props.sortDirection
        else
            @state.sortDirection

    setSortDirection: (direction) ->
        if @props.setSortDirection
            @props.setSortDirection direction
        else
            @setState
                sortDirection: direction

    getSortDirectionChoices: ->
        if @props.sortDirectionChoices
            @props.sortDirectionChoices
        else
            @defaultSortDirectionChoices

    renderNavBar: ->
        <TableNavigationBar
            currentPage = @getCurrentPage()
            increasePageNumber = @increasePageNumber
            decreasePageNumber = @decreasePageNumber
            setPageNumber = @setPageNumber
            showJumpToPage = @props.showJumpToPage
            numberOfPages = {@getNumberOfPages() unless dontKnowNumberOfPages}
            numberOfPagesAroundCurrentPage = @getNumberOfPagesAroundCurrentPage()
            numberPerPage = {@getNumberPerPage() unless @props.cantChangeNumberPerPage}
            objectsBeingDisplayed = @props.objectsBeingDisplayed
            numberPerPageChoices = @props.numberPerPageChoices
            setNumberPerPage = @setNumberPerPage
            sortDirection = {@getSortDirection() unless @props.cantChangeSortDirection}
            sortDirectionChoices = @getSortDirectionChoices
            setSortDirection = @setSortDirection />

    renderTable: ->
        <Table
            columnNames = @props.columnNames
            tableRows = @props.tableRows />
        # Nice as this would be, we pass in the collection so this shouldn't be necessary


    ###
    Props:
        TABLE NAVBAR PROPS (sorting and paging)
            - displayNavBar boolean (true if you want a navbar to be displayed)
            - increasePageNumber function (Optional - provide if you will handle your own paging)
            - decreasePageNumber function (Optional - provide if you will handle your own paging)
            - setPageNumber function (number) (Optional - provide if you will handle your own paging and showJumpToPage is true)
            - showJumpToPage boolean
            - dontKnowNumberOfPages boolean (Optional - true when the server paginates but doesn't tell us how many pages)
            - numberOfPages Number (Optional - provide if you will handle your own paging and know how many pages you have)
            - numberOfPagesAroundCurentPage Number (Optional - provide if you care)
            - cantChangeNumberPerPage boolean (Optional - true if you don't want anyone setting the number of elements per page)
            - numberPerPage Number (Optional - provide unless both you handle your own paging and you don't want it changable)
            - objectsBeingDisplayed String (Optional - provide unless cantChangeNumberPerPage is true)
            - numberPerPageChoices Array/Enum object (Optional - provide unless cantChangeNumberPerPage is true)
            - setNumberPerPage function (number) (Optional - provide unless cantChangeNumberPerPage is true)
            - cantChangeSortDirection boolean (Optional - true if you don't want anyone changing the default sort order)
            - sortDirection Asc/Desc (Optional - provide if you will handle sort direction AND resorting)
            - sortDirectionChoices Array/Enum object (Optional - provide if you are handling your own sort direction and have a way you want it represented)
            - setSortDirection function (Array/Enum object) (Optional - provide if you are handling sort direction AND resorting)

        TABLE PROPS (data)
            - columnNames Array (String or Object or a combination)
            - collection Collection (Pass in as many elements as you want rendered if you are doing your own paging, otherwise pass in everything)
    ###
    render: ->
        <div>
            {@renderNavBar()}
            {@renderTable()}
        </div>

module.exports = CollapsableSearchTable
