import React, { Component } from 'react';
import { Modal, Input, Button, Select } from 'antd';
const { Option } = Select;
const InputGroup = Input.Group;

export default class LoadModal extends Component {
	constructor(props) {
		super(props);

		this.state = {
			parent: this.props.parent,
            supportedAppTypes: [],
            path: ""
		};

		this.onPathChange = this.onPathChange.bind(this);
		this.selectApp = this.selectApp.bind(this);
		this.onTypeChange = this.onTypeChange.bind(this);
	}

    componentDidMount() {
        if (process.env.NODE_ENV === "test") {
            // don't fetch when testing, proxy isn't working
        } else {
            fetch("/acm-renderer/supported-app-types")
                .then(response => response.json())
                .then(data => this.setState({ supportedAppTypes: data }));
        }
	}

	onPathChange(e) {
        window.modelData.path = e.target.value;
        this.setState({ path: window.modelData.path });
	}

	onTypeChange(e) {
        window.modelData.type = e;
        if (!window.modelData.path) {
            window.modelData.path = "" + this.state.supportedAppTypes.find(s => s.value === e).defaultPath;
        }
        this.setState({ path: window.modelData.path });
	}

	selectApp() {
		this.state.parent.selectApp();
	}

	render() {
		const apptypes = this.state.supportedAppTypes.map(d => <Option key={d.value}>{d.text}</Option>);
		return (
			<Modal
                title="Select an application"
                footer={[
                    <Button key="loadcancel" onClick={this.state.parent.closeLoadModal}>Cancel</Button>,
                    <Button id="select-app-validate" key="loadselect" onClick={this.selectApp}>Select</Button>
                ]}
                visible={this.state.parent.state.loadModalOpen}
                onCancel={this.state.parent.closeLoadModal}
			>
				<InputGroup compact>
					<Select id="select-app-type" placeholder="Select..." onChange={this.onTypeChange} style={{ width: "25%" }}>
						{apptypes}
					</Select>
                    <Input id="select-app-path" onChange={this.onPathChange} value={this.state.path} style={{ width: '75%' }} autoFocus/>
				</InputGroup>
			</Modal>
		);
	}
} 