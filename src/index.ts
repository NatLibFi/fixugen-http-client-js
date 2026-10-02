import nock from 'nock';
import {READERS} from '@natlibfi/fixura';
import generateTests, {type CallbackArgs, type FixugenOpts} from '@natlibfi/fixugen';
//import createDebugLogger from 'debug';
//const debug = createDebugLogger('@natlibfi/fixugen-http-client');

// The fixura 5.x object-form d.ts omits the `filter` property, but the
// object form spreads every property at runtime, so a regex filter is
// applied to the files in the fixture directory.
interface GetFixturesOpts {
  components?: string[];
  reader?: number
};

export interface Request {
  method: string,
  url: string,
  query?: string,
  status: number,
  requestHeaders?: Record<string, string>,
  responseHeaders?: Record<string, string>
}

export interface FixugenHttpClientOpts extends FixugenOpts {
  useMetadataFile: true,
}

export default ({
  path,
  callback,
  recurse = true,
  fixura = {},
  hooks = {}
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

  async function httpCallback(callbackOpts: CallbackArgs) {
    nock.disableNetConnect()
    const {getFixtures, ...options} = callbackOpts;
    const requests = (options['requests'] ?? []) as Request[];
    generateNockMocks();
    await callback({...options, getFixtures, requests});
    nock.cleanAll();
    nock.enableNetConnect();
    return;

    function generateNockMocks() {
      const requestFixtures = getFixtures({
        filter: /^request[0-9]+\..*$/u,
        reader: READERS.TEXT
      } as GetFixturesOpts);

      const responseFixtures = getFixtures({
        filter: /^response[0-9]+\..*$/u,
        reader: READERS.TEXT
      } as GetFixturesOpts);

      return requests.forEach(({method, requestHeaders = {}, responseHeaders = {}, url, status, query = ''}, index) => {
        nock('http://foo.bar', requestHeaders as unknown as nock.Options)
          .intercept(`${url}${query}`, method, requestFixtures[index] as string | undefined)
          .reply(status, responseFixtures[index] as string | undefined, responseHeaders);
      });
    }
  }
};
