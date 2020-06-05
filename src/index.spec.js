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

import {expect} from 'chai';
import fetch from 'node-fetch';
import generateTests from '.';

generateTests({
  callback,
  path: [__dirname, '..', 'test-fixtures']
});

function callback({getFixture, requests}) {
  return iterate(requests);

  async function iterate(requests, index = 0) {
    const [request] = requests;

    if (request) {
      const {method, url, status, requestHeaders = {}, responseHeaders = {}} = request;

      const expectedResponsePayload = getFixture(`response${index}.txt`) || '';
      const requestPayload = getFixture(`request${index}.txt`);
      const response = await fetch(`http://foo.bar${url}`, {method, headers: requestHeaders}, requestPayload);

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
