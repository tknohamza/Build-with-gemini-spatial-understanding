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

export const colors = [
  'rgb(0, 0, 0)',
  'rgb(255, 255, 255)',
  'rgb(213, 40, 40)',
  'rgb(250, 123, 23)',
  'rgb(240, 186, 17)',
  'rgb(8, 161, 72)',
  'rgb(26, 115, 232)',
  'rgb(161, 66, 244)',
];

function hexToRgb(hex: string) {
  const r = parseInt(hex.substring(1, 3), 16);
  const g = parseInt(hex.substring(3, 5), 16);
  const b = parseInt(hex.substring(5, 7), 16);
  return [r, g, b];
}

export const segmentationColors = [
  '#E6194B',
  '#3C89D0',
  '#3CB44B',
  '#FFE119',
  '#911EB4',
  '#42D4F4',
  '#F58231',
  '#F032E6',
  '#BFEF45',
  '#469990',
];
export const segmentationColorsRgb = segmentationColors.map((c) => hexToRgb(c));

export const imageOptions: string[] = await Promise.all(
  [
    'origami.jpg',
    'pumpkins.jpg',
    'clock.jpg',
    'socks.jpg',
    'breakfast.jpg',
    'cat.jpg',
    'spill.jpg',
    'fruit.jpg',
    'baklava.jpg',
  ].map(async (i) =>
    URL.createObjectURL(
      await (
        await fetch(
          `https://www.gstatic.com/aistudio/starter-apps/bounding-box/${i}`,
        )
      ).blob(),
    ),
  ),
);

export const lineOptions = {
  size: 8,
  thinning: 0,
  smoothing: 0,
  streamline: 0,
  simulatePressure: false,
};

export const defaultPromptParts = {
  '2D Bounding Boxes': [
    'Show me the locations of ',
    'all objects',
    ' as a JSON list. Do not return masks. 25 items max.',
  ],
  'Segmentation Masks': [
    `Give me the segmentation masks for `,
    'all objects',
    `. Output a JSON list of segmentation masks where each entry has the 2d bounding box in the "box_2d" key, the segmentation mask in the "mask" key, and the text label in the "label" key. Use descriptive labels.`,
  ],
  '3D Bounding Boxes': [
    'Output in JSON. Detect the 3d bounding boxes of ',
    'all objects',
    ', output no more than 10 items. Return a list where each entry has the object name in "label" and its 3d bounding box in "box_3d".',
  ],
  Points: [
    'Point to ',
    'all objects',
    ' with no more than 10 items. The answer should follow the JSON format: [{"point": <point>, "label": <label1>}, ...]. The points are in [y, x] format normalized to 0-1000.',
  ],
};

export const defaultPrompts = {
  '2D Bounding Boxes': defaultPromptParts['2D Bounding Boxes'].join(' '),
  '3D Bounding Boxes': defaultPromptParts['3D Bounding Boxes'].join(' '),
  'Segmentation Masks': defaultPromptParts['Segmentation Masks'].join(''),
  Points: defaultPromptParts.Points.join(' '),
};

const safetyLevel = 'only_high';

export const safetySettings = new Map();

safetySettings.set('harassment', safetyLevel);
safetySettings.set('hate_speech', safetyLevel);
safetySettings.set('sexually_explicit', safetyLevel);
safetySettings.set('dangerous_content', safetyLevel);
safetySettings.set('civic_integrity', safetyLevel);