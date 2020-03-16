import React, { Component } from 'react';
import { Modal, Button, Select, Form, Input } from 'antd';
const { Option } = Select;

export default class MonitorModal extends Component {
    constructor(props) {
        super(props);

        this.state = {
            parent: this.props.parent,
            monitorConfig: { action: null, mqttAddress: "mqtt://localhost:1883" }
        };

        this.onStratChange = this.onStratChange.bind(this);
        this.onMqttAddressChange = this.onMqttAddressChange.bind(this);
        this.saveMonitor = this.saveMonitor.bind(this);

        this.state.parent.MonitorModalInstance = this;
    }

    onStratChange(e) {
        this.setState({
            monitorConfig: {
                action: e,
                mqttAddress: this.state.monitorConfig.mqttAddress
            }
        });
    }

    onMqttAddressChange(e) {
        this.setState({
            monitorConfig: {
                action: this.state.monitorConfig.action,
                mqttAddress: e.target.value
            }
        });
    }

    // called by the parent to set a config on monitor edit
    setMonitorConfig(conf) {
        if (conf) {
            this.setState({ monitorConfig: conf });
        }
    }

    saveMonitor() {
        this.state.parent.saveMonitor(this.state.monitorConfig);
    }

    render() {
        const strats = this.state.parent.monitorStrategies.map(d => <Option key={d.value}>{d.text}</Option>);
        return (
            <Modal
                title="Monitor Configuration"
                footer={[
                    <Button key="moncancel" onClick={this.state.parent.closeMonitorModal}>Cancel</Button>,
                    <Button key="monselect" onClick={this.saveMonitor}>Go!</Button>
                ]}
                visible={this.state.parent.state.monitorModalOpen}
                onCancel={this.state.parent.closeMonitorModal}
            >
                <Form>
                    <Form.Item label="Action">
                        <Select id="mon-strat" onChange={this.onStratChange} defaultValue={this.state.monitorConfig.action} addonBefore="Action">
                            {strats}
                        </Select>
                    </Form.Item>
                    <Form.Item label="MQTT Broker Address">
                        <Input id="mon-mqtt" onChange={this.onMqttAddressChange} defaultValue={this.state.monitorConfig.mqttAddress} addonBefore="MQTT Address"/>
                    </Form.Item>
                </Form>
            </Modal>
        );
    }
}