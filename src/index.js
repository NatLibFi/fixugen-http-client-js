import nock from 'nock';
import {READERS} from '@natlibfi/fixura';
import generateTests from '@natlibfi/fixugen';

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

      return requests.forEach(({method, requestHeaders = {}, responseHeaders = {}, url, status}, index) => {
        nock('http://foo.bar', requestHeaders)[method](url, requestFixtures[index])
          .reply(status, responseFixtures[index], responseHeaders);
      });
    }
  }
};
