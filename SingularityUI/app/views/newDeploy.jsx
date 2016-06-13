import View from './view';
import NewDeploy from '../components/newDeploy/NewDeploy';

import React from 'react';
import ReactDOM from 'react-dom';

import { Provider } from 'react-redux';

class NewDeployView extends View {

    initialize(store) {
        this.store = store;
    }

    render() {
        ReactDOM.render(<Provider store={this.store}><NewDeploy/></Provider>, this.el);
    }
}

export default NewDeployView;
