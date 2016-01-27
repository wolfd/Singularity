Model = require '../models/model'

# Base collection extended by the others
class Collection extends Backbone.Collection

    model: Model

    # Tracks if the collection has synced
    synced: false

    constructor: ->
        super
        @on 'sync',  =>
            @synced = true
            @each (model) => model.synced = true
        @on 'reset', => @synced = false

    # Call this to sort things. For sortOrder, 
    # 1 means ascending and -1 means descending.
    # a and b are the things to compare.
    attributeComparator: (attr, sortOrder, a, b) ->
        if a.get(attr) > b.get(attr)
            return sortOrder
        else if a.get(attr) < b.get(attr)
            return sortOrder * -1
        else
            return 0

module.exports = Collection
