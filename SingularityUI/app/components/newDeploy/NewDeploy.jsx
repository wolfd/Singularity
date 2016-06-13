import React from 'react';
import { connect } from 'react-redux';

class NewDeploy extends React.Component {

  render() {
    let r = this.props.request
    console.log(this.props);
    return (
      <div>
        <h2>New deploy for <a href={`${config.appRoot}/request/${r.request.id}`}>{r.request.id}</a></h2>
      </div>
    );
  }
}

function mapStateToProps(state) {
    return {
        request: state.api.request.data
    }
}

export default connect(mapStateToProps)(NewDeploy);
