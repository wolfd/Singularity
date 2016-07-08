import React from 'react';
import { connect } from 'react-redux';

import { SetLoading } from './actions/ui/rootComponent';

function mapStateToProps(state) {
  return {
    loading: state.ui.rootComponent.loading
  };
}

function mapDispatchToProps(dispatch) {
  return {
    setLoading: (loading) => dispatch(SetLoading(loading))
  };
}

// eslint-disable-next-line no-unused-vars react/no-multi-comp
const rootComponent = (Wrapped, title, refresh = _.noop) => connect(mapStateToProps, mapDispatchToProps)(class extends React.Component {

  static propTypes = {
    setLoading: React.PropTypes.func,
    loading: React.PropTypes.bool
  }

  constructor(props) {
    super(props);
    _.bindAll(this, 'handleBlur', 'handleFocus');
    props.setLoading(refresh !== _.noop);
  }

  componentDidMount() {
    document.title = `${title} - ${config.title}`;

    const promise = refresh(this.props);
    if (promise) {
      promise.then(() => {
        this.props.setLoading(false);
      });
    }

    this.startRefreshInterval();
    window.addEventListener('blur', this.handleBlur);
    window.addEventListener('focus', this.handleFocus);
  }

  componentWillUnmount() {
    this.stopRefreshInterval();
    window.removeEventListener('blur', this.handleBlur);
    window.removeEventListener('focus', this.handleFocus);
  }

  handleBlur() {
    this.stopRefreshInterval();
  }

  handleFocus() {
    refresh(this.props);
    this.startRefreshInterval();
  }

  startRefreshInterval() {
    this.refreshInterval = setInterval(() => refresh(this.props), config.globalRefreshInterval);
  }

  stopRefreshInterval() {
    clearInterval(this.refreshInterval);
  }


  render() {
    const loader = this.props.loading && <div className="page-loader fixed" />;
    const page = !this.props.loading && <Wrapped {...this.props} />;
    return (
      <div>
        {loader}
        {page}
      </div>
    );
  }
});

export default rootComponent;
