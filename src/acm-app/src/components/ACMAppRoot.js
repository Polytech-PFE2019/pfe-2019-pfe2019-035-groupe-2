import React, { Component } from 'react';
import { Layout, notification, Steps, Button, message } from 'antd';
import TopMenu from './TopMenu';
import MainView from './MainView';
import LoadModal from './LoadModal';
import LoadFileModal from './LoadFileModal';
import EnvironmentModelModal from './EnvironmentModelModal';
import MonitorModal from './MonitorModal';
import StratSelectModal from './StratSelectModal';
import SelPhyModal from './SelPhyModal';
import CreatePhyModal from './CreatePhyModal';
import DeployConfigModal from './DeployConfigModal';

const { Header, Footer, Content } = Layout;
const { Step } = Steps;

export default class ACMAppRoot extends Component {
	constructor() {
		super();

		this.state = {
            loadModalOpen: false,
            loadFileModalOpen: false,
			envModalOpen: false,
			acmModalOpen: false,
            monitorModalOpen: false,
            deployConfigModalOpened: false,
			stratModalOpen: false,
			selPhyModalOpen: false,
            createPhyProcModalOpen: false,
            jsonEditorModalOpen: false,
            currentStep: 0,
			knownApps: [],
			envModel: "{\n\t\"physical_processes\":[], \n\t\"links\":[]\n}",
			ACMMenuInstance: null,
            strategiesForConflict: [],
            focusedItem: null
		};

		// bind all local methods to the current this
		this.showLoadModal = this.showLoadModal.bind(this);
        this.closeLoadModal = this.closeLoadModal.bind(this);

        this.showLoadFileModal = this.showLoadFileModal.bind(this);
        this.closeLoadFileModal = this.closeLoadFileModal.bind(this);

		this.showEnvModal = this.showEnvModal.bind(this);
		this.closeEnvModal = this.closeEnvModal.bind(this);

		this.openStratModal = this.openStratModal.bind(this);
		this.closeStratModal = this.closeStratModal.bind(this);

		this.openMonitorModal = this.openMonitorModal.bind(this);
		this.closeMonitorModal = this.closeMonitorModal.bind(this);
		this.saveMonitor = this.saveMonitor.bind(this); 

		this.openSelPhyModal = this.openSelPhyModal.bind(this);
		this.closeSelPhyModal = this.closeSelPhyModal.bind(this);
        this.saveSelPhy = this.saveSelPhy.bind(this);

        this.openCreatePhyProcModal = this.openCreatePhyProcModal.bind(this);
        this.closeCreatePhyProcModal = this.closeCreatePhyProcModal.bind(this);
        this.saveCreatePhyProc = this.saveCreatePhyProc.bind(this);
        
		this.selectApp = this.selectApp.bind(this);
        this.getEnvModel = this.getEnvModel.bind(this);

        this.openDeployConfigModal = this.openDeployConfigModal.bind(this);
        this.closeDeployConfigModal = this.closeDeployConfigModal.bind(this);
		this.deployOnline = this.deployOnline.bind(this);
        this.deployDownload = this.deployDownload.bind(this);

        this.loadFromFile = this.loadFromFile.bind(this);
        this.handleModelFileRead = this.handleModelFileRead.bind(this);
        this.handleEnvFileRead = this.handleEnvFileRead.bind(this);

        this.editRules = this.editRules.bind(this);
        this.solveConflictsDefault = this.solveConflictsDefault.bind(this);

        this.nextStep = this.nextStep.bind(this);
        this.previousStep = this.previousStep.bind(this);
        this.showHint = this.showHint.bind(this);

        this.focus = this.focus.bind(this);

		this.monitorStrategies = [
			{ value: "passthrough", text: "Pass-through" },
			{ value: "log", text: "log" }
		];

		// set a reference in window scope to be called by vanillajs/cytoscape
		window.ACMCallbacks = this;
	}

    // show AGG for rule edition
    editRules() {
        fetch('/acm-model-editor/editAGGRules', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ command: "agg" })
        }).then(response => response.json())
            .then(data => notification[data.type](data));
    }

	// load model dialog
	showLoadModal() {
		this.setState({ loadModalOpen: true });
	}

	closeLoadModal() {
		this.setState({ loadModalOpen: false });
    }

    showLoadFileModal() {
        this.setState({ loadFileModalOpen: true });
    }

    closeLoadFileModal() {
        this.setState({ loadFileModalOpen: false });
    }

	selectApp() {
		window.saveModelData();
        this.closeLoadModal();
        window.getModel(true);
        this.state.ACMMenuInstance.setState({ modelLoaded: true });
        this.state.MainView.setState({ activeKey: "graph" });
        this.setState({ focusedItem: null });
		//this.showEnvModal();
    }

    loadFromFile(file) {
        console.log(file);
        if (file) {
            this.fileReader = new FileReader();
            this.fileReader.onloadend = this.handleModelFileRead;
            this.fileReader.readAsText(file);
        }
    }

    handleModelFileRead() {
        var content = this.fileReader.result;
        window.getModelFromJSON(content, true);
        this.state.ACMMenuInstance.setState({ modelLoaded: true });
        this.state.MainView.setState({ activeKey: "graph" });
        this.setState({ focusedItem: null });
        this.closeLoadFileModal();
    }

    findConflicts() {
        window.processEnvModel();
		fetch('/acm-renderer/findConflicts', {
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(window.modelData)
		}).then(response => response.json())
            .then(response => { window.modelData.model = response; window.renderModel(response); });
    }

    solveConflictsDefault() {
        window.processEnvModel();
        fetch('/acm-model-editor/solveConflictsDefault', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(window.modelData.model)
        }).then(response => response.json())
            .then(response => { window.modelData.model = response; window.renderModel(response); });
    }

    showErrorNotification(error) {
        notification.error({
            message: error.operation,
            description: error.error,
            duration: 0
        });
    }

	// enviroment model dialog
	showEnvModal() {
		this.setState({ envModalOpen: true });
	}

	closeEnvModal() {
		this.setState({ envModalOpen: false });
    }

    getEnvModel(file) {
        if (file) {
            this.fileReader = new FileReader();
            this.fileReader.onloadend = this.handleEnvFileRead;
            this.fileReader.readAsText(file);
        }
    }

    handleEnvFileRead() {
        var content = this.fileReader.result;
        this.closeEnvModal();
        window.updateEnvModel(content);
    }

    exportEnvModel() {
        window.processEnvModel();
        window.download("acm_env_model.json", JSON.stringify(window.modelData.envModel));
    }

	// monitor config modal
	openMonitorModal(data, conflictData) {
		conflictData.model = conflictData.model.model;
		this.setState({ selectedConflict: conflictData });
		for (var cmpidx in conflictData.model.components) {
            if ("" + conflictData.model.components[cmpidx].id === "" + conflictData.id) {
                this.MonitorModalInstance.setMonitorConfig(conflictData.model.components[cmpidx].action);
			}
		}
		this.setState({ monitorModalOpen: true });
	}

	closeMonitorModal() {
		this.setState({ monitorModalOpen: false });
	}

    saveMonitor(monitorConfig) {
		fetch('/acm-renderer/instantiateMonitor', {
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				conflict: this.state.selectedConflict,
				model: window.modelData.model,
				monitorConfig: monitorConfig
			})
		}).then(response => response.json())
			.then(response => { if (response.success) window.modelData.model = response.success; window.renderModel(response.success); })
			.then(this.setState({ monitorModalOpen: false, monitorConfig: null }));
	}

	// strat modal
	openStratModal(data, conflictData) {
		// remove graph data by overwriting model
		conflictData.model = conflictData.model.model;
		this.setState({ selectedConflict: conflictData });
		this.setState({ strategiesForConflict: JSON.parse(data) });
		this.setState({ stratModalOpen: true });
    }

    // filter strats in modal
    filterStrategies(mode, filterExpression) {
        let body = {};
        body[mode] = filterExpression;
        fetch('/acm-database/queryStrategyDatabase', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        }).then(response => response.json())
            .then(response => {
                if (response.error) {
                    // there an error, don't change list and display error
                    notification.error({
                        message: 'Error executing filter request',
                        description:
                            'Possible cause:' + response.error,
                    });
                } else {
                    // save filtered list
                    this.setState({ strategiesForConflict: response });
                }
            })
    }

	closeStratModal() {
		this.setState({ stratModalOpen: false });
		this.setState({ selectedConflict: null });
	}

	stratSelected(value) {
		if (!value.configuration) {
			this.deployStrat(value);
		} else {
			this.setState({ selectedStrat: value });
			this.openConfigModal();
		}
	}

	deployStrat(value) {
		fetch('/acm-renderer/instantiateACM', {
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				strat_id: value.id,
				conflict: this.state.selectedConflict,
				configuration: this.state.selectedStrat
			})
		}).then(response => response.json())
			.then(response => { if (response.success) window.modelData.model = response.success; window.renderModel(response.success); })
			.then(this.closeStratModal());
	}

    // final deploy
    openDeployConfigModal() {
        this.setState({ deployConfigModalOpened: true });
    }

    closeDeployConfigModal() {
        this.setState({ deployConfigModalOpened: false });
    }

    deployOnline() {
        this.closeDeployConfigModal();
        // set the model url to the path
        // detects config changes
        window.modelData.model.models.url = window.modelData.path;
		fetch('/acm-renderer/deployOnline', {
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				model: window.modelData.model
			})
		}).then(data => data.json())
            .then(data => {
                this.showNotification(data);
            });
	}

    showNotification(data) {
        if (data.error) {
            notification.error({
                message: data.error,
                description: data.message
            });
        } else {
            notification.open({
                message: data.success,
                description: data.message
            });
        }
	}

	deployDownload() {
		fetch('/acm-renderer/deployDownload', {
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				model: window.modelData.model
			})
		}).then(data => data.json())
			.then(data => window.download("acm_model.json", JSON.stringify(data)));
	}

	// physical model related things
	openSelPhyModal(node) {
		this.setState({ selPhyModalOpen: true, selPhyProc: { node: node, physicalProcess: node.physicalProcess?node.physicalProcess[0].id:null } });
	}

	closeSelPhyModal() {
		this.setState({ selPhyModalOpen: false });
	}

	saveSelPhy() {
        if (this.state.selPhyProc.physicalProcess === "createNew") {
            // create new phyproc, bring up modal
            this.openCreatePhyProcModal();
        } else if (this.state.selPhyProc.physicalProcess === "none") {
            // delete phyproc link
            let selpp = this.state.selPhyProc;
            let phyproxid = selpp.node.physicalProcess[0].id;
            let srcnodeid = selpp.node.id;

            // check phyproc uses
            if (!window.modelData.envModel.links.filter(lnk => lnk.to_id === phyproxid && lnk.from_id !== srcnodeid).length) {
                // no uses, delete it
                console.log(window.modelData.model.physicalProcess.filter(pp => pp.id !== phyproxid));
                window.modelData.model.physicalProcess = window.modelData.model.physicalProcess.filter(pp => pp.id !== phyproxid);
            }

            delete selpp.node.physicalProcess;
            this.setState({ selPhyProc: null });
            window.updateEnvModel();
        } else {
            let selpp = this.state.selPhyProc;
            if (!selpp.node.physicalProcess) selpp.node.physicalProcess = [];
            selpp.node.physicalProcess.push(window.modelData.model.physicalProcess.find(pp => pp.id === selpp.physicalProcess));

            this.setState({ selPhyProc: null });
            window.updateEnvModel();
		}
		this.closeSelPhyModal();
	}

	// create neww phy dialog
	openCreatePhyProcModal() {
		this.setState({ createPhyProcModalOpen: true });
	}

	closeCreatePhyProcModal() {
		this.setState({ selPhyProc: null });
		this.setState({ createPhyProcModalOpen: false });
	}

	saveCreatePhyProc() {
		let pp = {
			elementType: "PhysicalProcess",
			id: window.generateNRID(),
			name: this.state.phyProcName,
			x: this.state.selPhyProc.node.x + 100,
			y: this.state.selPhyProc.node.y
		};
        window.modelData.model.physicalProcess.push(pp);
        if (!this.state.selPhyProc.node.physicalProcess) {
            // we need to do this pirouette so react doesn't complain about not using setState
            // but setState doesn't merge state past the first level
            let spp = this.state.selPhyProc;
            spp.node.physicalProcess = [];
        }
		this.state.selPhyProc.node.physicalProcess.push(pp);
        this.closeCreatePhyProcModal();

        window.updateEnvModel();
    } 

    // step management
    nextStep() {
        this.setState({ currentStep: this.state.currentStep + 1 });
        this.showHint(this.state.currentStep + 1);
    }

    previousStep() {
        this.setState({ currentStep: this.state.currentStep - 1 });
        this.showHint(this.state.currentStep - 1);
    }

    showHint(step) {
        if (step=== 3) {
            message.info('Click on an ACM or Monitor to configure it');
        }
    }

        // focusing
    focus(elementid) {
        this.state.MainView.setState({ activeKey: "graph" });
        let cy = window.cy;
        if (elementid === null) {
            cy.fit();
        } else if (elementid === undefined) {
            if (this.state.focusedItem !== null) {
                cy.fit(cy.elements("[id='" + this.state.focusedItem + "']"));
            } else {
                cy.fit();
            }
            return;
        } else {
            cy.fit(cy.elements("[id='" + elementid + "']"));
        }
        this.setState({ focusedItem: elementid });
    }

    componentDidMount() {
        if (process.env.NODE_ENV === "test") {
            // don't fetch when testing, proxy isn't working
        } else {
            fetch('/acm-database/queryDatabaseStatus', {
                method: 'GET',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json'
                }
            }).then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    notification.error({
                        message: 'ACM server offline',
                        description: 'ACM could not contact its server.',
                        duration: 0
                    });
                }
            })
                .then(data => {
                    if (data && !data.online) {
                        notification.error({
                            message: 'ACM Strategy database offline',
                            description: 'ACM could not contact the strategy database.',
                            duration: 0
                        });
                    }
                });
        }
    }

	render() {
		return (
            <Layout>
				<Header style={{ padding: '0px' }}>
                    <TopMenu parent={this} />
                </Header>
                <Layout>
                    <Header id="stepHeader">
                        <div id="stepMenu">
                            <Button id="prevStep" type="secondary" onClick={this.previousStep} disabled={this.state.currentStep < 1} >Back</Button>
                            <Steps current={this.state.currentStep} id="steps">
                                <Step title="Deployment model" />
                                <Step title="Environment model" />
                                <Step title="Conflict identification" />
                                <Step title="Conflict solving" />
                                <Step title="Deploy new model" />
                            </Steps>
                            <Button id="nextStep" type="primary" onClick={this.nextStep} disabled={this.state.currentStep > 3}>Next</Button>
                        </div>
                    </Header>
                    <Content>
                        <LoadModal parent={this}/>
                        <LoadFileModal parent={this} />
                        <DeployConfigModal parent={this} />
					    <EnvironmentModelModal parent={this} />
					    <MonitorModal parent={this} />
					    <StratSelectModal parent={this} />
					    <SelPhyModal parent={this} />
                        <CreatePhyModal parent={this} />
                        <MainView parent={this} />
                    </Content>
                </Layout>
                <Footer style={{ textAlign: 'center', height: "4vh", padding: "1vh" }}>ENACT &copy;2018-2019 Created by UNS - CNRS</Footer>
			</Layout>
		);
	}

}