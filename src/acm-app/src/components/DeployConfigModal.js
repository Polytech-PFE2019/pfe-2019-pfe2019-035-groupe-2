import React, { Component } from 'react';
import { Modal, Input } from 'antd';
const InputGroup = Input.Group;

export default class DeployConfigModal extends Component {
	constructor(props) {
		super(props);

		this.state = {
            parent: this.props.parent,
            path: null
        };

        this.processWithDeployment = this.processWithDeployment.bind(this);
        this.onPathChange = this.onPathChange.bind(this);
        this.closeDeployConfigModal = this.closeDeployConfigModal.bind(this);
	}

    processWithDeployment() {
        window.modelData.path = this.state.path;
        this.state.parent.deployOnline();
        this.setState({ path: null });
    }

    closeDeployConfigModal() {
        this.state.parent.closeDeployConfigModal();
        this.setState({ path: null });
    }

    onPathChange(e) {
        this.setState({ path: e.target.value });
    }

    componentDidUpdate() {
        if (this.state.path === null && this.state.parent.state.deployConfigModalOpened) {
            // modal opened path unset get path from modelData
            this.setState({ path: window.modelData.path });
        }
    }

    render() {
		return (
			<Modal
                title="Deployment parameters"
                visible={this.state.parent.state.deployConfigModalOpened}
                onCancel={this.closeDeployConfigModal}
                onOk={this.processWithDeployment}
			>
				<InputGroup compact>
                    <Input addonBefore="Path" onChange={this.onPathChange} value={this.state.path}/>
				</InputGroup>
			</Modal>
		);
	}
} 