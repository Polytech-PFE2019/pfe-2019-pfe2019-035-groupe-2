import React from 'react';
import Grid from "mineral-ui/Grid";
import { GridItem } from 'mineral-ui/Grid';
import ACMStrategy from "./ACMStrategy";

const ACMStrategyList = ({ strats, onStratClick }) => (
	<Grid wrap>
		{strats.map((strat) => (
			<GridItem key={strat.id} span={3}>
				<ACMStrategy value={strat} onStratClick={onStratClick} />
			</GridItem>
		)
		)}
	</Grid>
);
export default ACMStrategyList;