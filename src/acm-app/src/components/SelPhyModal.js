import React, { Component } from 'react';
import { Modal, Button, Select, Form } from 'antd';
const { Option } = Select;

export default class SelPhyModal extends Component {
	constructor(props) {
		super(props);

		this.state = {
			parent: this.props.parent
		};

		this.onStratChange = this.onStratChange.bind(this);
	}

	onStratChange(e) {
		this.state.parent.setState({ selPhyProc: { physicalProcess: e, node: this.state.parent.state.selPhyProc.node } });
	}

    render() {
        // check for window for test related purposes
        let phyprox = window.modelData && window.modelData.model && window.modelData.model.physicalProcess ? window.modelData.model.physicalProcess.map(phy => <Option key={phy.id}>{phy.name}</Option>) : "";
		return (
			<Modal
				title="Physical Process assignment"
				footer={[
					<Button key="phycancel" onClick={this.state.parent.closeSelPhyModal}>Cancel</Button>,
					<Button key="physelect" onClick={this.state.parent.saveSelPhy}>Go!</Button>
				]}
				visible={this.state.parent.state.selPhyModalOpen}
				onCancel={this.state.parent.closeSelPhyModal}
			>
				<Form>
					<Form.Item label="Assigned physical process">
                        <Select id="phyprox" onChange={this.onStratChange} value={(this.state.parent.state.selPhyProc &&  this.state.parent.state.selPhyProc.physicalProcess) ? this.state.parent.state.selPhyProc.physicalProcess : "none"}>
                            <Option key="none">None</Option>
							{phyprox}
							<Option key="createNew">Create new...</Option>
						</Select>
					</Form.Item>
				</Form>
			</Modal>
		);
	}
} 