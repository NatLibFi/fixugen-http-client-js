import {expect} from 'chai';
// Use native fetch - node-fetch does not work with undici
//import fetch from 'node-fetch';
import generateTests from '.';
import {READERS} from '@natlibfi/fixura';
import createDebugLogger from 'debug';

const debug = createDebugLogger('@natlibfi/fixugen-http-client:test');

generateTests({
  callback,
  path: [__dirname, '..', 'test-fixtures']
});

function callback({getFixtures, requests}) {

  const requestFixtures = getFixtures({
    components: [/^request[0-9]+\..*$/u],
    reader: READERS.TEXT
  });
  debug(`We have ${requestFixtures.length} requestFixtures`);

  const responseFixtures = getFixtures({
    components: [/^response[0-9]+\..*$/u],
    reader: READERS.TEXT
  });
  debug(`We have ${responseFixtures.length} responseFixtures`);

  return iterate(requests);

  async function iterate(requests, index = 0) {
    const [request] = requests;
    if (request) {
      debug(`Testing request ${index}`);
      const {method, url, queryPart = '', status, requestHeaders = {}, responseHeaders = {}} = request;

      const expectedResponsePayload = responseFixtures[index] || '';
      debug(`We have expextedResponsePayload: ${expectedResponsePayload}`);

      const requestPayload = requestFixtures[index] || undefined;
      const response = await fetch(`http://foo.bar${url}${queryPart}`, {method, headers: requestHeaders}, requestPayload);

      debug(`We have expected status: ${status}`);
      expect(response.status).to.equal(status);
      expect(formatResponseHeaders(response.headers)).to.eql(responseHeaders);
      expect(await response.text()).to.equal(expectedResponsePayload);

      return iterate(requests.slice(1));
    }

    function formatResponseHeaders(headers) {
      const iterator = headers.entries();
      return iterate();

      function iterate(results = {}) {
        const {value, done} = iterator.next();

        if (done) {
          return results;
        }

        const [name, content] = value;
        return iterate({...results, [name]: content});
      }
    }
  }
}
