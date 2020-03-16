import React, { Component } from 'react';
import { Menu, Icon } from "antd";
const { SubMenu } = Menu;

export default class TopMenu extends Component {
	constructor(props) {
		super(props);

		this.state = {
			modelLoaded: false,
			callbackHost: this.props.parent
		};

		this.props.parent.setState({ ACMMenuInstance: this });
	}

	render() {
        return (
			<Menu theme="light" mode="horizontal" style={{ lineHeight: '64px', padding: '10px 0 10 0' }} selectable={false}>
                <Menu.Item key="logo" disabled><img style={{ height: "64px" }} src="img/acm_logo_header.png" alt="logo enact" /></Menu.Item>
                <SubMenu title={<div><Icon type="file" />Deployment model</div>} disabled={this.state.callbackHost.state.currentStep !== 0}>
                    <Menu.Item key="load" onClick={this.state.callbackHost.showLoadModal}>Load Deployment Model from server</Menu.Item>
                    <Menu.Item key="loadfile" onClick={this.state.callbackHost.showLoadFileModal}>Load Deployment Model from file</Menu.Item>
                    <Menu.Item key="DeployDownload" onClick={this.state.callbackHost.deployDownload}>Save Deployment Model</Menu.Item>
                </SubMenu>
                <SubMenu title={<span><Icon type="apartment" />Environment model</span>} disabled={this.state.callbackHost.state.currentStep !== 1}>
                    <Menu.Item key="loadenv" onClick={this.state.callbackHost.showEnvModal}>Load Environment Model</Menu.Item>
                    <Menu.Item key="saveenv" onClick={this.state.callbackHost.exportEnvModel}>Save Environment Model</Menu.Item>
                </SubMenu>
                <SubMenu title={<span><Icon type="security-scan" />Manage Conflicts</span>} disabled={this.state.callbackHost.state.currentStep !== 2}>
                    <Menu.Item key="edtirtules" disabled={!this.state.modelLoaded} onClick={this.state.callbackHost.editRules}>Edit Rules</Menu.Item>
                    <Menu.Item key="find" disabled={!this.state.modelLoaded} onClick={this.state.callbackHost.findConflicts}>Find conflicts</Menu.Item>
                    <Menu.Item key="default-acms" onClick={this.state.callbackHost.solveConflictsDefault}>Solve conflicts using default ACM</Menu.Item>
                    <Menu.Item key="clear-acms" disabled={!this.state.modelLoaded} onClick={window.clearACMs}>Clear ACMs</Menu.Item>
                </SubMenu>
                <SubMenu title={<div><Icon type="cluster" />Deploy</div>} disabled={this.state.callbackHost.state.currentStep !== 4}>
                    <Menu.Item key="DeployOnline" onClick={this.state.callbackHost.openDeployConfigModal}>Deploy to target</Menu.Item>
                </SubMenu>
				<Menu.Item style={{ float: "right", height: "64px" }} key="logocnrs" disabled><img style={{ float: "right", height: "64px" }} src="img/cnrs.png" alt="logo cnrs" /></Menu.Item>
			</Menu>
		);
	}
}