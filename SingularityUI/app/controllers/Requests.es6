import Controller from './Controller';

import RequestsView from '../views/requests';

import { FetchAction } from '../actions/api/requests';

class RequestsController extends Controller {

  initialize({store}) {
    this.store = store;
    this.title('Requests');

    this.store.dispatch(FetchAction.trigger());

    this.view = new RequestsView(this.store);

    this.setView(this.view);
    return app.showView(this.view);
  }
}

export default RequestsController;
