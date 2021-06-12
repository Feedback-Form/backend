const defaultEngine = 'davinci';
/* const ENGINE_LIST = ['ada',
 'babbage', 'curie', 'davinci', 'davinci-instruct-beta', 'curie-instruct-beta', 'content-filter-alpha-c4'];

*/
module.exports = {
  completionURL: (engine, userId) => {
    const chosenEngine = !engine ? defaultEngine : engine;

    return `https://api.openai.com/v1/engines/${chosenEngine}/completions?user=${userId}`;
  },
  searchURL: (engine, userId) => {
    const chosenEngine = !engine ? defaultEngine : engine;

    return `https://api.openai.com/v1/engines/${chosenEngine}/search?user=${userId}`;
  },
};
