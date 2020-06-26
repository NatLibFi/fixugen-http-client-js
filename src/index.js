/**
*
* @licstart  The following is the entire license notice for the JavaScript code in this file.
*
* Generate unit tests for HTTP clients with fixugen
*
* Copyright (C) 2020 University Of Helsinki (The National Library Of Finland)
*
* This file is part of fixugen-http-client-js
*
* fixugen-http-client-js program is free software: you can redistribute it and/or modify
* it under the terms of the GNU Affero General Public License as
* published by the Free Software Foundation, either version 3 of the
* License, or (at your option) any later version.
*
* fixugen-http-client-js is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU Affero General Public License for more details.
*
* You should have received a copy of the GNU Affero General Public License
* along with this program.  If not, see <http://www.gnu.org/licenses/>.
*
* @licend  The above is the entire license notice
* for the JavaScript code in this file.
*
*/

import nock from 'nock';
import {READERS} from '@natlibfi/fixura';
import generateTests from '@natlibfi/fixugen';

export default ({path, callback, fixura = {}, mocha = {}}) => {
  generateTests({
    path,
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
