import React, { Component } from 'react';
import { Tabs, Icon, Button, Table } from 'antd';

const TabPane = Tabs.TabPane;

export default class MainView extends Component {
    constructor(props) {
        super(props);

        this.state = {
            editor: null,
            parent: this.props.parent,
            activeKey: "graph",
            tableData: [],
            tableScrollSize: 100
        }

        this.handleChangeTab = this.handleChangeTab.bind(this);
        this.saveJSON = this.saveJSON.bind(this);

        this.state.parent.setState({ MainView: this });
    }

    saveJSON() {
        window.modelData.model = this.state.editor.get();
    }

    handleChangeTab(key) {
        this.setState({ activeKey: key });
        switch (key) {
            case "json":
                if (!this.state.editor) {
                    let container = document.getElementById("jsoneditor");
                    let options = {};
                    let editor = new window.JSONEditor(container, options);
                    editor.set(window.modelData.model);
                    this.setState({ editor: editor });
                } else {
                    this.state.editor.set(window.modelData.model);
                }
                break;
            case "graph":
                window.getModelRefresh();
                break;
            case "grid":
                if (window.cy) {
                    let parents = window.cy.elements("[?isACM]");
                    this.setState({
                        tableData: window.cy.elements("[?isParent][!isConflictParent]").map(cyparent => {
                            return {
                                key: cyparent.data("id"),
                                id: cyparent.data("id"),
                                name: cyparent.data("name"),
                                parent: cyparent.data("name").replace("/" + cyparent.data("id"), ""),
                                ACMData: this.processACMData(parents, cyparent),
                                action: cyparent.data("id")
                            };
                        })
                    });
                }
                break;
            default:
                break;
        }
    }

    processACMData(parents, cyparent) {
        let relevantacms = parents.filter(el => el.data("actualParent") === cyparent.data("id"));
        return {
            hasACM: relevantacms.length > 0 && relevantacms.reduce((ret, curr) => ret&=curr.data("isACM"), true),
            toConfigure: relevantacms.length > 0 && relevantacms.reduce((ret, curr) => ret &= curr.data("toConfigure"), true)
        };
    }

    updateDimensions = () => {
        this.setState({ tableScrollSize: { y: 0.96 * window.innerHeight - 212 } });
    };
    componentDidMount() {
        this.setState({ tableScrollSize: { y: 0.96 * window.innerHeight - 212 } });
        window.addEventListener('resize', this.updateDimensions);
    }
    componentWillUnmount() {
        window.removeEventListener('resize', this.updateDimensions);
    }

    render() {
        let tableCols = [
            { title: "ID", dataIndex: "id", key: "id" },
            { title: "Name", dataIndex: "name", key: "name" },
            { title: "Parent", dataIndex: "parent", key: "parent" },
            {
                title: "Conflict?",
                dataIndex: "ACMData",
                key: "ACMData",
                render: (ACMData) => {
                    let ret = [];
                    if (ACMData.hasACM) {
                        if (ACMData.toConfigure) {
                            ret.push(<Icon type="check-square" theme="twoTone" twoToneColor="#0F9F19" width={32}/>);
                        } else {
                            ret.push(<Icon type="warning" theme="twoTone" twoToneColor="#FF0000" width={32}/>);
                        }
                    } 
                    return ret;
                }
            },
            {
                title: "Action",
                dataIndex: "action",
                key: "action",
                render: (action) => {
                    return (<Button onClick={(e) => this.state.parent.focus(action)}><Icon type="select" /></Button>);
                }
            }
        ];
        return (
            <Tabs activeKey={this.state.activeKey} onChange={this.handleChangeTab} tabPosition='right' style={{ paddingTop: "10px" }}>
                <TabPane tab={<span><Icon type="share-alt" />Graph View</span>} key="graph">
                    <div id="cy" />
                    <div id="cy_nav" />
                    <div id="viewcontrols"><Button onClick={window.toggleVirtualLinks}>Toggle Comm Links</Button></div>
                </TabPane>
                <TabPane forceRender={true} tab={<span><Icon type="codepen" />JSON View</span>} key="json">
                    <div id="jsoneditorcontainer">
                        <div id="jsoneditorbuttoncontainer">
                            <Button type="primary" id="saveJSON" onClick={this.saveJSON}><Icon type="save" />Save</Button>
                        </div>
                        <div id="jsoneditor"></div>
                    </div>
                </TabPane>
                <TabPane forceRender={true} tab={<span><Icon type="database" />Grid View</span>} key="grid">
                    <div id="tablecontainer">
                        <Table id="tableview" dataSource={this.state.tableData} columns={tableCols} pagination={{ pageSize: 10 }} scroll={this.state.tableScrollSize} />;
                    </div>    
                </TabPane>
            </Tabs>
        );
    }
}