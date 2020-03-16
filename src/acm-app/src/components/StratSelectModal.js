import React, { Component } from 'react';
import { Modal, Button, Card, Row, Col, Input, Icon, Select } from 'antd';
const { Option } = Select;

export default class StratSelectModal extends Component {
    constructor(props) {
        super(props);

        this.state = {
            parent: this.props.parent,
            mode: "metadata"
        };
    }

    render() {
        let strats = [];
        for (let stratidx = 0; stratidx < this.state.parent.state.strategiesForConflict.length; stratidx += 4) {
            let row = [];
            for (let stratrowidx = 0; stratrowidx < 4; stratrowidx++) {
                let strat = this.state.parent.state.strategiesForConflict[stratidx + stratrowidx];
                if (strat) {
                    row.push(<Col key={strat.id} span={6}><Card size="small" title={strat.name} hoverable onClick={() => this.state.parent.stratSelected(strat)}><Card.Meta title={strat.description} description={Object.entries(strat.metadata).map(b => b[0] + "=" + b[1]).join(" ")}/></Card></Col>);
                }
            }
            strats.push(<Row key={stratidx} gutter={16} style={{ marginBottom: 8 }}>{row}</Row>);
        }

        const modes = (
            <Select value={this.state.mode} onChange={e => this.setState({ mode: e })} style={{ width: "6vw" }}>
                <Option value="metadata">Metadata</Option>
                <Option value="sparql">SPARQL</Option>
            </Select>
        );

        return (
            <Modal
                title="Strategy Select"
                footer={[
                    <Button key="stratCancel" onClick={this.state.parent.closeStratModal}>Cancel</Button>
                ]}
                visible={this.state.parent.state.stratModalOpen}
                onCancel={this.state.parent.closeStratModal}
                width={"60vw"}
            >
                <div>
                    <div style={{ marginBottom: 15 }}>
                        <Input
                            placeholder="Filter expression"
                            prefix={<Icon type="filter" style={{ color: 'rgba(0,0,0,.25)' }} />}
                            value={this.state.filterExpression}
                            onChange={e => this.setState({ filterExpression: e.target.value })}
                            style={{ width: "46vw" }}
                            addonBefore={modes}
                            onPressEnter={e => this.state.parent.filterStrategies(this.state.mode, this.state.filterExpression)}/>
                        <Button onClick={e => this.state.parent.filterStrategies(this.state.mode, this.state.filterExpression)} icon="filter" style={{ width: "8vw" }}>Filter strategies</Button>
                    </div>
                    {strats}
                </div>
            </Modal>
        );
    }
}