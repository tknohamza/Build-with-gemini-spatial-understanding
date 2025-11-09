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

const typeLabels: Record<DetectTypes, string> = {
  '2D Bounding Boxes': '2D Bounding Boxes',
  'Segmentation Masks': 'Segmentation Masks',
  Points: 'Points',
  '3D Bounding Boxes': '3D Bounding Boxes',
};

export function DetectTypeSelector() {
  return (
    <div className="flex flex-col flex-shrink-0">
      <div className="mb-3 uppercase">Give me:</div>
      {/* FIX: Unroll map to avoid key prop issue with custom component. */}
      <div className="flex flex-col gap-3">
        <SelectOption
          label="2D Bounding Boxes"
          text={typeLabels['2D Bounding Boxes']}
        />
        <SelectOption
          label="Segmentation Masks"
          text={typeLabels['Segmentation Masks']}
        />
        <SelectOption label="Points" text={typeLabels['Points']} />
        <SelectOption
          label="3D Bounding Boxes"
          text={typeLabels['3D Bounding Boxes']}
        />
      </div>
    </div>
  );
}

function SelectOption({label, text}: {label: DetectTypes; text: string}) {
  const [detectType, setDetectType] = useAtom(DetectTypeAtom);
  const [, setHoverEntered] = useAtom(HoverEnteredAtom);
  // const resetState = useResetState();

  return (
    <button
      className="py-6 items-center bg-transparent text-center gap-3"
      style={{
        borderColor: detectType === label ? 'var(--accent-color)' : undefined,
        backgroundColor:
          detectType === label ? 'var(--border-color)' : undefined,
      }}
      onClick={() => {
        setHoverEntered(false);
        setDetectType(label);
      }}>
      {text}
    </button>
  );
}