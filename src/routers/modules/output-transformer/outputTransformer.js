const outputTransformer = (outputList) => {
	// match until linebreak
	const a = outputList.match(/.*\s*/g);
	// remove all linebreaks
	const b = a.map((i) => i.replace(/(?:\r\n|\r|\n)/g, ""));

	// remove all consecutive whitespaces in strings
	const c = b.map((i) => i.replace(/\s+\s+/g, " "));

	const d = c;
	if (c[c.length - 1] === "") {
		d.pop();
	}
	const e = d.map((i) => {
		const replaced = i.replace("2.", "");
		return replaced.trim();
	});
	return e;
};

module.exports.outputTransformer = outputTransformer;
