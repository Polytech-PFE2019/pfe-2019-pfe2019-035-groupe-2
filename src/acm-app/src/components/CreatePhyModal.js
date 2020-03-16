import React, { Component } from 'react';
import { Modal, Button, Input, Form } from 'antd';

export default class CreatePhyModal extends Component {
	constructor(props) {
		super(props);

		this.state = {
			parent: this.props.parent
		};

		this.onNameChange = this.onNameChange.bind(this);
	}

	onNameChange(e) {
		this.state.parent.setState({ phyProcName: e.target.value });
	}

	render() {
		return (
			<Modal
				title="Create new physical process"
				footer={[
					<Button key="phycancel" onClick={this.state.parent.closeCreatePhyProcModal}>Cancel</Button>,
					<Button key="physelect" onClick={this.state.parent.saveCreatePhyProc}>Go!</Button>
				]}
				visible={this.state.parent.state.createPhyProcModalOpen}
				onCancel={this.state.parent.closeCreatePhyProcModal}
			>
				<Form>
					<Form.Item label="Name">
						<Input onChange={this.onNameChange} value={this.state.parent.state.phyProcName} autoFocus />
					</Form.Item>
				</Form>
			</Modal>
		);
	}
} 