import Controller from './Controller';

import LogLines from '../collections/LogLines';

import LogView from '../views/logView';

import { createStore, compose, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import logger from 'redux-logger';
import rootReducer from '../reducers';
import LogActions from '../actions/log';
import ActiveTasks from '../actions/activeTasks';

class LogViewerController extends Controller {
  initialize({requestId, path, initialOffset, taskIds, viewMode, search}) {
    this.requestId = requestId;
    this.path = path;
    this.initialOffset = initialOffset;
    this.title(`Tail of ${_.last(this.path.split('/'))}`);

    const initialState = {
      viewMode,
      colors: ['Default', 'Light', 'Dark'],
      logRequestLength: 30000,
      activeRequest: {
        requestId: this.requestId
      }
    };

    let middlewares = [thunk];

    if (window.localStorage.enableReduxLogging) {
      middlewares.push(logger());
    }

    this.store = createStore(rootReducer, initialState, compose(applyMiddleware.apply(this, middlewares)));

    let initPromise;
    if (taskIds.length > 0) {
      initPromise = this.store.dispatch(LogActions.initialize(this.requestId, this.path, search, taskIds));
    } else {
      initPromise = this.store.dispatch(LogActions.initializeUsingActiveTasks(this.requestId, this.path, search));
    }

    initPromise.then(() => {
      return this.store.dispatch(ActiveTasks.updateActiveTasks(this.requestId));
    });

    // create log view
    this.view = new LogView(this.store);

    this.setView(this.view); // does nothing
    app.showView(this.view);
    return window.getStateJSON = () => JSON.stringify(this.store.getState());
  }
}

export default LogViewerController;
