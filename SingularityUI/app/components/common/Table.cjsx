Utils = require '../../utils'

Table = React.createClass

    renderTableHeader: ->
        @props.columnNames.map (columnName, key) =>
            if typeof columnName is 'object' # For now there's no functionality for extra options here. Feel free to add
                <th key={key}>{columnName.name}</th>
            else
                <th key={key}>{columnName}</th>

    renderTableRow: (elements) ->
        elements.map (element, key) =>
            ComponentClass = element.component
            return <td key={key}>
                <ComponentClass
                    prop=element.prop
                />
            </td>

    renderTableData: ->
        @props.tableRows.map (tableRow, key) =>
            <tr key={key}>{@renderTableRow tableRow}</tr>


    # Note: Use @props.tableClassOpts to declare things like striped or bordered
    getClassName: ->
        return "table #{@props.tableClassOpts}"

    ###
    Props:
        - columnNames Array (String or Object)
        - tableRows Object
    ###
    render: ->
        <table className={@getClassName()}>
            <thead>
                <tr>
                    {@renderTableHeader()}
                </tr>
            </thead>
            <tbody>
                {@renderTableData()}
            </tbody>
        </table>

module.exports = Table
