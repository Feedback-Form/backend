/* eslint-disable no-restricted-globals */
const axios = require('axios');
const config = require('./config');

class OpenAI {
  constructor(apiKey) {
    this.apiKey = apiKey;
  }

  safeCast(number) {
    return isNaN(Number(number)) ? null : Number(number);
  }

  constructParameter(name, value) {
    return (typeof value === 'undefined' || value === null) ? null : { [name]: value };
  }

  sendRequest(opts) {
    const url = config.completionURL(opts.engine, opts.userId);
    const reqOpts = {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    };
    const data = {
      ...this.constructParameter('prompt', opts.prompt),
      ...this.constructParameter('stream', opts.stream),
      ...this.constructParameter('stop', opts.stop),
      ...this.constructParameter('max_tokens', this.safeCast(opts.maxTokens)),
      ...this.constructParameter('temperature', this.safeCast(opts.temperature)),
      ...this.constructParameter('top_p', this.safeCast(opts.topP)),
      ...this.constructParameter('presence_penalty', this.safeCast(opts.presencePenalty)),
      ...this.constructParameter('frequency_penalty', this.safeCast(opts.frequencyPenalty)),
      ...this.constructParameter('best_of', this.safeCast(opts.bestOf)),
      ...this.constructParameter('n', this.safeCast(opts.n)),
      ...this.constructParameter('logprobs', this.safeCast(opts.logprobs)),
      ...this.constructParameter('echo', opts.echo),

    };
    return axios.post(url, data, reqOpts);
  }

  complete(opts) {
    return this.sendRequest(opts);
  }

  search(opts) {
    const url = config.searchURL(opts.engine, opts.userId);
    const reqOpts = {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    };
    const data = {
      documents: opts.documents,
      query: opts.query,
    };
    return axios.post(url, data, reqOpts);
  }
}

module.exports = OpenAI;
