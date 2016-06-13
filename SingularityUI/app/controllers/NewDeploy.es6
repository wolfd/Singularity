import Controller from './Controller';

import NewDeployView from 'views/newDeploy';

import { FetchAction } from '../actions/api/request';

class NewDeployController extends Controller {

  initialize({store, requestId}) {
      app.showPageLoader()
      this.title('New Deploy');
      this.store = store;

      let initPromise = this.store.dispatch(FetchAction.trigger(requestId));
      initPromise.then(() => {
        this.setView(new NewDeployView(store));
        app.showView(this.view);
      });
  }
}

export default NewDeployController;
