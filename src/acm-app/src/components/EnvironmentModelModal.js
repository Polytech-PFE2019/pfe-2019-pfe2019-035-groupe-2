import React, { Component } from 'react';
import { Modal, Input, Upload, Icon, Alert } from 'antd';
const InputGroup = Input.Group;
const { Dragger } = Upload;

export default class EnvironmentModelModal extends Component {
	constructor(props) {
		super(props);

		this.state = {
            parent: this.props.parent,
            disableUpload: false,
            alertFileVisible: false,
            fileList: []
        };

        this.selectEnvModel = this.selectEnvModel.bind(this);
    }

    selectEnvModel() {
        // check file existence
        if (this.state.fileList.length === 0) {
            this.setState({ alertFileVisible: true });
            return;
        }

        // actually load
        this.state.parent.getEnvModel(this.state.fileList[0]);

        // clear data
        this.setState({ fileList: [], disableUpload: false });
    }


    render() {
        const props = {
            name: 'file',
            multiple: false,
            beforeUpload: (file) => {
                this.setState({ disableUpload: true, alertFileVisible: false });
                this.state.fileList.push(file);
                // return false to not actually upload from the Dragger, instead we upload manually on select button
                return false;
            },
            onRemove: (f) => {
                this.setState({ fileList: this.state.fileList.filter(fi => fi === f), disableUpload: false });
                return true;
            }
        };

		return (
			<Modal
				title="Environment Model"
				visible={this.state.parent.state.envModalOpen}
                onCancel={this.state.parent.closeEnvModal}
                onOk={this.selectEnvModel}
			>
				<InputGroup compact>
                    <div id="sel-file-dragger">
                        <Dragger {...props} disabled={this.state.disableUpload} fileList={this.state.fileList}>
                            <p className="ant-upload-drag-icon">
                                <Icon type="inbox" />
                            </p>
                            <p className="ant-upload-text">Click to open dialog, or drag environment model to this area to load a model</p>
                        </Dragger>
                    </div>
                </InputGroup>
                {this.state.alertFileVisible ? (<div className="alert"><Alert message="Select a file" type="error" /></div>) : null}
			</Modal>
		);
	}
} 