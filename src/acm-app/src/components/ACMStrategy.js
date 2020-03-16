import React from 'react';
import Card, { CardBlock, CardTitle } from 'mineral-ui/Card';

const ACMStrategy = ({ value, onStratClick }) => (
		<Card onClick={event => onStratClick(event, value)}>
			<CardTitle>{value.name}</CardTitle>
			<CardBlock>{value.description}</CardBlock>
		</Card>
	
);
export default ACMStrategy;