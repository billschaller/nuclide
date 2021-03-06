'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {NuclideUri} from '../../commons-node/nuclideUri';
import typeof * as ArcanistBaseService from '../../nuclide-arcanist-base';

import {getArcanistBaseServiceByNuclideUri} from '../../nuclide-remote-connection';

export default async function aggregateFindDiagnostics(
  fileNames: Iterable<NuclideUri>,
  skip: Array<string>,
): Promise<Array<Object>> {
  const serviceToFileNames: Map<ArcanistBaseService, Array<NuclideUri>> = new Map();
  for (const file of fileNames) {
    const service = getArcanistBaseServiceByNuclideUri(file);
    let files = serviceToFileNames.get(service);
    if (files == null) {
      files = [];
      serviceToFileNames.set(service, files);
    }
    files.push(file);
  }

  const results: Array<Promise<Array<Object>>> = [];
  for (const [service, files] of serviceToFileNames) {
    results.push(service.findDiagnostics(files, skip));
  }

  return [].concat(...(await Promise.all(results)));
}
