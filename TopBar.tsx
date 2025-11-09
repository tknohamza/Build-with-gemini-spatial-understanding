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
import {
  BumpSessionAtom,
  DetectTypeAtom,
  HoverEnteredAtom,
  ImageSentAtom,
  ImageSrcAtom,
  IsUploadedImageAtom,
  RevealOnHoverModeAtom,
} from './atoms';
import {ExampleImages} from './ExampleImages';
import {useResetState} from './hooks';
import {ScreenshareButton} from './ScreenshareButton';

export function TopBar() {
  const resetState = useResetState();
  const [revealOnHover, setRevealOnHoverMode] = useAtom(RevealOnHoverModeAtom);
  const [detectType] = useAtom(DetectTypeAtom);
  const [, setHoverEntered] = useAtom(HoverEnteredAtom);
  const [, setImageSrc] = useAtom(ImageSrcAtom);
  const [, setIsUploadedImage] = useAtom(IsUploadedImageAtom);
  const [, setImageSent] = useAtom(ImageSentAtom);
  const [, setBumpSession] = useAtom(BumpSessionAtom);

  return (
    <div className="flex w-full items-center px-3 py-2 border-b justify-between gap-6">
      <div className="flex gap-3 items-center">
        <button
          onClick={() => {
            resetState();
          }}
          className="w-8 h-8 flex items-center justify-center rounded-full border border-[var(--border-color)] hover:border-[var(--accent-color)]"
          aria-label="Reset session"
          title="Reset session">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round">
            <path d="M21 2v6h-6" />
            <path d="M3 12a9 9 0 1 1 9 9 9.75 9.75 0 0 1-6.74-2.74L3 14" />
          </svg>
        </button>
        <label className="flex items-center button secondary whitespace-nowrap">
          <input
            className="hidden"
            type="file"
            accept=".jpg, .jpeg, .png, .webp"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                  resetState();
                  setImageSrc(e.target?.result as string);
                  setIsUploadedImage(true);
                  setImageSent(false);
                  setBumpSession((prev) => prev + 1);
                };
                reader.readAsDataURL(file);
              }
            }}
          />
          <div>Upload Image</div>
        </label>
        <ScreenshareButton />
        <ExampleImages />
      </div>
      <div className="flex gap-3 items-center">
        {detectType === '2D Bounding Boxes' ||
        detectType === 'Segmentation Masks' ? (
          <div>
            <label className="flex items-center gap-2 px-3 select-none whitespace-nowrap">
              <input
                type="checkbox"
                checked={revealOnHover}
                onChange={(e) => {
                  if (e.target.checked) {
                    setHoverEntered(false);
                  }
                  setRevealOnHoverMode(e.target.checked);
                }}
              />
              <div>Reveal on hover</div>
            </label>
          </div>
        ) : null}
      </div>
    </div>
  );
}