//import nock from 'nock';
import {Agent, MockAgent, setGlobalDispatcher} from 'undici';
import {READERS} from '@natlibfi/fixura';
import generateTests from '@natlibfi/fixugen';
import createDebugLogger from 'debug';

const debug = createDebugLogger('@natlibfi/fixugen-http-client');
const mockAgent = new MockAgent();

export default ({path, callback, recurse = true, fixura = {}, mocha = {}}) => {

  generateTests({
    path, recurse,
    callback: httpCallback,
    useMetadataFile: true,
    fixura: {
      ...fixura,
      failWhenNotFound: false
    },
    mocha: {
      ...mocha,
      before: () => {
        debug(`before`);
        setGlobalDispatcher(mockAgent);
        mockAgent.disableNetConnect();
      },
      after: async () => {
        debug(`after`);
        await mockAgent.close();
        setGlobalDispatcher(new Agent());
      },
      afterEach: () => {
        //;
      }
    }
  });

  function httpCallback({getFixtures, requests, ...options}) {

    generateUncidiMocks();
    debug(mockAgent.pendingInterceptors());
    return callback({...options, getFixtures, requests});

    function generateUncidiMocks() {
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

      const baseURL = 'http://foo.bar';
      const mockPool = mockAgent.get(baseURL);

      // url: URL of the request. This is only the location and parameters part of the actual URL. The base URL is always http://foo.bar. Must start with /
      return requests.forEach(({method = 'GET', requestHeaders = {}, responseHeaders = {}, url, status, query = null}, index) => {
        debug(`Adding intercept (${index}) for ${method} ${baseURL}${url} + ${JSON.stringify(query)}`);
        mockPool.intercept({method, path: url, query, body: requestFixtures[index], headers: requestHeaders})
          .defaultReplyHeaders(responseHeaders)
          .reply(status, responseFixtures[index]);
      });
    }
  }
};
