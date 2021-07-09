const outputTransformer = (outputList) => {
	// match until linebreak
	const outputTextTransformedTwo = outputList.match(/.*\s*/g);
	// remove all linebreaks
	const outputTextTransformedThree = outputTextTransformedTwo.map((kr) =>
		kr.replace(/(?:\r\n|\r|\n)/g, "")
	);

	// remove all consecutive whitespaces in strings
	const outputTextTransformedFour = outputTextTransformedThree.map((kr) =>
		kr.replace(/\s+\s+/g, " ")
	);

	const outputTextFinal = outputTextTransformedFour;
	if (
		outputTextTransformedFour[outputTextTransformedFour.length - 1] === ""
	) {
		outputTextFinal.pop();
	}
	return outputTextFinal;
};

module.exports.outputTransformer = outputTransformer;
