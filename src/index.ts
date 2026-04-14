import nock from 'nock';
import {READERS} from '@natlibfi/fixura';
import generateTests from '@natlibfi/fixugen';
import createDebugLogger from 'debug';

// eslint-disable-next-line no-unused-vars,@typescript-eslint/no-unused-vars
const debug = createDebugLogger('@natlibfi/fixugen-http-client');

interface timedHooks {
  before?: () => void,
  beforeEach?: () => void,
  after?: () => void,
  afterEach?: () => void
}

interface FixugenHttpClientOpts {
  // eslint-disable-next-line no-unused-vars
  callback: (callbackOpts) => void,
  path: string[],
  recurse?: boolean,
  fixura?: object,
  hooks?: timedHooks
}

export default ({
  path,
  callback,
  recurse = true,
  fixura = {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  hooks = {before: () => { }, beforeEach: () => { }, after: () => { }, afterEach: () => { }}
}: FixugenHttpClientOpts) => {
  generateTests({
    path, recurse,
    callback: httpCallback,
    useMetadataFile: true,
    fixura: {
      ...fixura,
      failWhenNotFound: false
    },
    hooks
  });

  async function httpCallback({getFixtures, requests, ...options}) {
    nock.disableNetConnect()
    generateNockMocks();
    await callback({...options, getFixtures, requests});
    nock.cleanAll();
    nock.enableNetConnect();
    return;

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
