/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
/* tslint:disable */
// Copyright 2024 Google LLC

// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at

//     https://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import {useAtom} from 'jotai';
import {DetectTypeAtom, HoverEnteredAtom} from './atoms';
import {DetectTypes} from './Types';

const detectTypesOrder: DetectTypes[] = [
  '2D Bounding Boxes',
  'Segmentation Masks',
  'Points',
  '3D Bounding Boxes',
];

export function DetectTypeSelector() {
  const [detectType, setDetectType] = useAtom(DetectTypeAtom);
  const [, setHoverEntered] = useAtom(HoverEnteredAtom);
  return (
    <div className="flex flex-col flex-shrink-0">
      <div className="mb-3 uppercase">Give me:</div>
      <div className="flex flex-col gap-3">
        {detectTypesOrder.map((type) => (
          <button
            key={type}
            className="py-6 items-center bg-transparent text-center gap-3"
            style={{
              borderColor:
                detectType === type ? 'var(--accent-color)' : undefined,
              backgroundColor:
                detectType === type ? 'var(--border-color)' : undefined,
            }}
            onClick={() => {
              setHoverEntered(false);
              setDetectType(type);
            }}>
            {type}
          </button>
        ))}
      </div>
    </div>
  );
}