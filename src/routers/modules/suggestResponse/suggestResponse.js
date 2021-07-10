const OpenAI = require("../openai");
const openai = new OpenAI(process.env.OPENAI_API_KEY);

const suggestResponse = async (
	question,
	rating,
	maxRating,
	productServiceDescription,
	userId
) => {
	try {
		if (
			typeof question !== "string" ||
			typeof productServiceDescription !== "string" ||
			typeof userId !== "string"
		) {
			throw new Error(
				`The question, product description & userId must be a string.`
			);
		}
		if (typeof rating !== "number" || typeof maxRating !== "number") {
			throw new Error(`The rating must be a number.`);
		}
		const gptCommand =
			"Create insightful feedback, from the customer's personal view, according to the service/product description and according to the customer's sentiment.";
		const gptConfig = {
			engine: "davinci-instruct-beta",
			prompt: `${gptCommand}\n\nservice/product description:\n${productServiceDescription}\n\nquestion to the customer:\n${question}\n\ncustomer's rating:\n${rating}/${maxRating}\n\nthe customer's feedback:\n`,
			maxTokens: 100,
			temperature: 0.7,
			topP: 1,
			presencePenalty: 0,
			frequencyPenalty: 1,
			bestOf: 1,
			n: 1,
			stream: false,
			userId,
			stop: ["\n\n"],
		};

		// config to evaluate the risk group of the given input
		const gptSafetyConfig = {
			engine: "content-filter-alpha-c4",
			prompt: `<|endoftext|>${question}${productServiceDescription}\n--\nLabel:`,
			maxTokens: 1,
			temperature: 0,
			topP: 1,
			logProps: 10,
			presencePenalty: 0,
			frequencyPenalty: 0,
			userId,
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

		return output;
	} catch (err) {
		return err;
	}
};

module.exports.suggestResponse = suggestResponse;
