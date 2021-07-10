const OpenAI = require("../openai");
const openai = new OpenAI(process.env.OPENAI_API_KEY);
const {outputTransformer} = require("../output-transformer/outputTransformer")


const classifyText = async (review, id) => {
    try {
        if (typeof review !== 'string' || typeof id !== 'string') {
            throw new Error(`"text must be a string."`)
        }

        const gptCommand =
			"Extract the core messages from the review and classify them into short tags.";
		const gptConfig = {
			engine: "curie-instruct-beta",
			prompt: `${gptCommand}\n\nReview:\n${review}\n\nTags:\n1.`,
			maxTokens: 40,
			temperature: 0.8,
			topP: 1,
			presencePenalty: 0,
			frequencyPenalty: 1,
			bestOf: 1,
			n: 1,
			stream: false,
			userId: id,
			stop: ["\n\n", "3."],
		};

		// config to evaluate the risk group of the given input
		const gptSafetyConfig = {
			engine: "content-filter-alpha-c4",
			prompt: `<|endoftext|>${review}\n--\nLabel:`,
			maxTokens: 1,
			temperature: 0,
			topP: 1,
			logProps: 10,
			presencePenalty: 0,
			frequencyPenalty: 0,
			userId: id,
		};

		// flag the input text for it's risk group
		const gptSafetyFlag = await openai.complete(gptSafetyConfig);

		// throws an Error if the input is flagged a 2
		if (gptSafetyFlag.data.choices[0].text === "2") {
			throw new Error("The Input is too risky!");
		}
		// complete the text according to the user's config.
		const gptOutput = await openai.complete(gptConfig);
		const output = gptOutput.data.choices[0].text;

        const formattedText = outputTransformer(output);
        return formattedText;



    } catch (err) {
        return err;
    }
}

module.exports.classifyText = classifyText; 