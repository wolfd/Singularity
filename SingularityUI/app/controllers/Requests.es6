import Controller from './Controller';

import Requests from '../collections/Requests';

import RequestsView from '../views/requests';

class RequestsController extends Controller {

    initialize({state, subFilter, searchFilter}) {
        this.state = state;
        this.subFilter = subFilter;
        this.searchFilter = searchFilter;
        this.title('Requests');

        // We want the view to handle the page loader for this one
        this.collections.requests = new Requests([], {state: this.state});

        this.setView(new RequestsView(_.extend({state: this.state, subFilter: this.subFilter, searchFilter: this.searchFilter},
            {collection: this.collections.requests})));

        this.collections.requests.fetch();

        return app.showView(this.view);
    }

    refresh() {
        // Don't refresh if user is scrolled down, viewing the table (arbitrary value)
        if ($(window).scrollTop() > 200) { return; }
        // Don't refresh if the table is sorted
        if (this.view.isSorted) { return; }

        return this.collections.requests.fetch({reset: true});
    }
}

export default RequestsController;
