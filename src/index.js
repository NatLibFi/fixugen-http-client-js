import nock from 'nock';
import {READERS} from '@natlibfi/fixura';
import generateTests from '@natlibfi/fixugen';
import createDebugLogger from 'debug';

// eslint-disable-next-line no-unused-vars
const debug = createDebugLogger('@natlibfi/fixugen-http-client');

export default ({path, callback, recurse = true, fixura = {}, hooks = {}}) => {
  generateTests({
    path, recurse,
    callback: httpCallback,
    useMetadataFile: true,
    fixura: {
      ...fixura,
      failWhenNotFound: false
    },
    hooks: {
      ...hooks,
      before: () => nock.disableNetConnect(),
      after: () => nock.enableNetConnect(),
      afterEach: () => nock.cleanAll()
    }
  });

  function httpCallback({getFixtures, requests, ...options}) {

    generateNockMocks();
    return callback({...options, getFixtures, requests});

    function generateNockMocks() {
      const requestFixtures = getFixtures({
        components: [/^request[0-9]+\..*$/u],
        reader: READERS.TEXT
      });

      const responseFixtures = getFixtures({
        components: [/^response[0-9]+\..*$/u],
        reader: READERS.TEXT
      });

      return requests.forEach(({method, requestHeaders = {}, responseHeaders = {}, url, status, query = ''}, index) => {
        nock('http://foo.bar', requestHeaders)[method](`${url}${query}`, requestFixtures[index])
          .reply(status, responseFixtures[index], responseHeaders);
      });
    }
  }
};
