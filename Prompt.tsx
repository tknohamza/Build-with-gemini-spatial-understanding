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

import {GoogleGenAI} from '@google/genai';
import {useAtom} from 'jotai';
import getStroke from 'perfect-freehand';
import {
  AccuracyAtom,
  BoundingBoxMasksAtom,
  BoundingBoxes2DAtom,
  BoundingBoxes3DAtom,
  DetectTypeAtom,
  HoverEnteredAtom,
  ImageSrcAtom,
  IsLoadingAtom,
  LinesAtom,
  ModelAtom,
  PointsAtom,
  PromptsAtom,
  ShareStream,
  VideoRefAtom,
} from './atoms';
import {lineOptions} from './consts';
import {DetectTypes} from './Types';
import {getSvgPathFromStroke, loadImage} from './utils';

const ai = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY});

export function Prompt() {
  const [accuracy, setAccuracy] = useAtom(AccuracyAtom);
  const [model, setModel] = useAtom(ModelAtom);
  const [, setBoundingBoxes2D] = useAtom(BoundingBoxes2DAtom);
  const [, setBoundingBoxes3D] = useAtom(BoundingBoxes3DAtom);
  const [, setBoundingBoxMasks] = useAtom(BoundingBoxMasksAtom);
  const [stream] = useAtom(ShareStream);
  const [detectType] = useAtom(DetectTypeAtom);
  const [, setPoints] = useAtom(PointsAtom);
  const [, setHoverEntered] = useAtom(HoverEnteredAtom);
  const [lines] = useAtom(LinesAtom);
  const [videoRef] = useAtom(VideoRefAtom);
  const [imageSrc] = useAtom(ImageSrcAtom);

  const [prompts] = useAtom(PromptsAtom);
  const [isLoading, setIsLoading] = useAtom(IsLoadingAtom);

  const is2d = detectType === '2D Bounding Boxes';

  const get2dPrompt = () =>
    `Detect all objects, with a maximum of 20 items. Output a json list where each entry has the 2d bounding box in "box_2d" and the text label in "label".`;

  const getSegmentationPrompt = () => {
    return prompts['Segmentation Masks'].join(' ');
  };

  async function handleSend() {
    setIsLoading(true);
    try {
      let activeDataURL;
      const maxSize = 640;
      const copyCanvas = document.createElement('canvas');
      const ctx = copyCanvas.getContext('2d')!;

      if (stream) {
        // screenshare
        const video = videoRef.current!;
        const scale = Math.min(
          maxSize / video.videoWidth,
          maxSize / video.videoHeight,
        );
        copyCanvas.width = video.videoWidth * scale;
        copyCanvas.height = video.videoHeight * scale;
        ctx.drawImage(
          video,
          0,
          0,
          video.videoWidth * scale,
          video.videoHeight * scale,
        );
      } else if (imageSrc) {
        const image = await loadImage(imageSrc);
        const scale = Math.min(maxSize / image.width, maxSize / image.height);
        copyCanvas.width = image.width * scale;
        copyCanvas.height = image.height * scale;
        console.log(copyCanvas);
        ctx.drawImage(image, 0, 0, image.width * scale, image.height * scale);
      }
      activeDataURL = copyCanvas.toDataURL('image/png');

      if (lines.length > 0) {
        for (const line of lines) {
          const p = new Path2D(
            getSvgPathFromStroke(
              getStroke(
                line[0].map(([x, y]) => [
                  x * copyCanvas.width,
                  y * copyCanvas.height,
                  0.5,
                ]),
                lineOptions,
              ),
            ),
          );
          ctx.fillStyle = line[1];
          ctx.fill(p);
        }
        activeDataURL = copyCanvas.toDataURL('image/png');
      }

      setHoverEntered(false);
      // Map accuracy (0-100) to temperature (2.0-0.0)
      const temperature = 2.0 - (accuracy / 100) * 2.0;

      const config: {
        temperature: number;
        thinkingConfig?: {thinkingBudget: number};
      } = {
        temperature,
      };

      const modelToUse =
        model === 'Gemini 2.5 Pro' ? 'gemini-2.5-pro' : 'gemini-2.5-flash';

      if (modelToUse === 'gemini-2.5-flash') {
        // Disable thinking for 2.5 Flash, as recommended for spatial
        // understanding tasks.
        config['thinkingConfig'] = {thinkingBudget: 0};
      }

      let textPromptToSend = '';
      if (is2d) {
        textPromptToSend = get2dPrompt();
      } else if (detectType === 'Segmentation Masks') {
        textPromptToSend = getSegmentationPrompt();
      } else {
        textPromptToSend = prompts[detectType].join(' ');
      }

      let response = (
        await ai.models.generateContent({
          model: modelToUse,
          contents: [
            {
              role: 'user',
              parts: [
                {
                  inlineData: {
                    data: activeDataURL.replace('data:image/png;base64,', ''),
                    mimeType: 'image/png',
                  },
                },
                {text: textPromptToSend},
              ],
            },
          ],
          config,
        })
      ).text;

      if (response.includes('```json')) {
        response = response.split('```json')[1].split('```')[0];
      }
      const parsedResponse = JSON.parse(response);
      if (detectType === '2D Bounding Boxes') {
        const formattedBoxes = parsedResponse.map(
          (box: {box_2d: [number, number, number, number]; label: string}) => {
            const [ymin, xmin, ymax, xmax] = box.box_2d;
            return {
              x: xmin / 1000,
              y: ymin / 1000,
              width: (xmax - xmin) / 1000,
              height: (ymax - ymin) / 1000,
              label: box.label,
            };
          },
        );
        setHoverEntered(false);
        setBoundingBoxes2D(formattedBoxes);
      } else if (detectType === 'Points') {
        const formattedPoints = parsedResponse.map(
          (point: {point: [number, number]; label: string}) => {
            return {
              point: {
                x: point.point[1] / 1000,
                y: point.point[0] / 1000,
              },
              label: point.label,
            };
          },
        );
        setPoints(formattedPoints);
      } else if (detectType === 'Segmentation Masks') {
        const formattedBoxes = parsedResponse.map(
          (box: {
            box_2d: [number, number, number, number];
            label: string;
            mask: ImageData;
          }) => {
            const [ymin, xmin, ymax, xmax] = box.box_2d;
            return {
              x: xmin / 1000,
              y: ymin / 1000,
              width: (xmax - xmin) / 1000,
              height: (ymax - ymin) / 1000,
              label: box.label,
              imageData: box.mask,
            };
          },
        );
        setHoverEntered(false);
        // sort largest to smallest
        const sortedBoxes = formattedBoxes.sort(
          (a: any, b: any) => b.width * b.height - a.width * a.height,
        );
        setBoundingBoxMasks(sortedBoxes);
      } else {
        const formattedBoxes = parsedResponse.map(
          (box: {
            box_3d: [
              number,
              number,
              number,
              number,
              number,
              number,
              number,
              number,
              number,
            ];
            label: string;
          }) => {
            const center = box.box_3d.slice(0, 3);
            const size = box.box_3d.slice(3, 6);
            const rpy = box.box_3d
              .slice(6)
              .map((x: number) => (x * Math.PI) / 180);
            return {
              center,
              size,
              rpy,
              label: box.label,
            };
          },
        );
        setBoundingBoxes3D(formattedBoxes);
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex grow flex-col gap-6">
      <div className="flex flex-col gap-2">
        <label htmlFor="model-select" className="uppercase">
          Analysis Model:
        </label>
        <select
          id="model-select"
          className="w-full bg-[var(--input-color)] rounded-3xl p-4 border border-[var(--border-color)]"
          value={model}
          onChange={(e) => setModel(e.target.value)}
          disabled={isLoading}>
          <option value="Gemini 2.5 Flash">Gemini 2.5 Flash</option>
          <option value="Gemini 2.5 Pro">Gemini 2.5 Pro</option>
        </select>
      </div>

      <div className="flex flex-col gap-2">
        <label className="flex items-center gap-2">
          Accuracy:
          <input
            className="w-full"
            type="range"
            min="0"
            max="100"
            step="1"
            value={accuracy}
            onChange={(e) => setAccuracy(Number(e.target.value))}
            disabled={isLoading}
          />
          {accuracy}%
        </label>
      </div>

      <div className="flex justify-between gap-3 mt-auto">
        <button
          className={`bg-[#3B68FF] px-12 !text-white !border-none flex items-center justify-center grow ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={handleSend}
          disabled={isLoading}>
          {isLoading ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Analyzing...
            </>
          ) : (
            'Analyze Image'
          )}
        </button>
      </div>
    </div>
  );
}