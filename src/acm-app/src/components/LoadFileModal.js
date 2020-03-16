import React, { Component } from 'react';
import { Modal, Input, Button, Select, Upload, Icon, Alert } from 'antd';
const { Option } = Select;
const { Dragger } = Upload;
const InputGroup = Input.Group;

export default class LoadFileModal extends Component {
    constructor(props) {
        super(props);

        this.state = {
            parent: this.props.parent,
            supportedAppTypes: [],
            disableUpload: false,
            fileList: [],
            alertVisible: false
        };

        this.selectApp = this.selectApp.bind(this);
        this.onTypeChange = this.onTypeChange.bind(this);
        this.closeLoadFileModal = this.closeLoadFileModal.bind(this);
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

    onTypeChange(e) {
        window.modelData.type = e;
        this.setState({ alertVisible: false });
    }

    selectApp() {
        // check type validity
        if (this.state.supportedAppTypes.findIndex(type => type.value === window.modelData.type) === -1) {
            this.setState({ alertVisible: true });
            return;
        } 

        // check file existence
        if (this.state.fileList.length === 0) {
            this.setState({ alertFileVisible: true });
            return;
        } 

        // actually load
        this.state.parent.loadFromFile(this.state.fileList[0]);

        // clear data
        this.setState({ fileList:[], disableUpload: false });
    }

    closeLoadFileModal() {
        this.setState({ fileList: [], disableUpload: false });
        this.state.parent.closeLoadFileModal();
    }

    render() {
        const props = {
            name: 'file',
            multiple: false,
            beforeUpload: (file) => {
                this.setState({ disableUpload: true, alertFileVisible:false });
                this.state.fileList.push(file);
                // return false to not actually upload from the Dragger, instead we upload manually on select button
                return false;
            },
            onRemove: (f) => {
                this.setState({ fileList: this.state.fileList.filter(fi => fi===f), disableUpload: false });
                return true;
            }
        };

        const apptypes = this.state.supportedAppTypes.map(d => <Option key={d.value}>{d.text}</Option>);
        return (
            <Modal
                title="Select format"
                footer={[
                    <Button key="loadcancel" onClick={this.closeLoadFileModal}>Cancel</Button>,
                    <Button id="select-app-validate" key="loadselect" onClick={this.selectApp}>Select</Button>
                ]}
                visible={this.state.parent.state.loadFileModalOpen}
                onCancel={this.state.parent.closeLoadFileModal}
            >
                <InputGroup compact>
                    <Select id="select-app-type" placeholder="Application type..." onChange={this.onTypeChange} style={{ width: "100%" }}>
                        {apptypes}
                    </Select>
                    <div id="sel-file-dragger">
                        <Dragger {...props} disabled={this.state.disableUpload} fileList={this.state.fileList}>
                            <p className="ant-upload-drag-icon">
                                <Icon type="inbox" />
                            </p>
                            <p className="ant-upload-text">Click to open dialog, or drag deployment model to this area to load a model</p>
                        </Dragger>
                    </div>
                    {this.state.alertVisible ? (<div className="alert"><Alert message="Select an application type" type="error"/></div>) : null}
                    {this.state.alertFileVisible ? (<div className="alert"><Alert message="Select a file" type="error" /></div>) : null}
                </InputGroup>
            </Modal>
        );
    }
}