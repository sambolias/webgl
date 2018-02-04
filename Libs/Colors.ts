// Fluxions WebGL Library
// Copyright (c) 2017 - 2018 Jonathan Metzgar
// All Rights Reserved.
//
// MIT License
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.
//
/// <reference path="GTE.ts" />


namespace Colors {
    const DarkIntensity = 30;
    const LightIntensity = 210;
    const MediumIntensity = GTE.lerp(DarkIntensity, LightIntensity, 0.5);
    const GrayIntensity33 = GTE.lerp(DarkIntensity, LightIntensity, 0.66);
    const GrayIntensity66 = GTE.lerp(DarkIntensity, LightIntensity, 0.33);
    const Gr33Intensity = GTE.lerp(DarkIntensity, LightIntensity, 0.66);
    const Gr66Intensity = GTE.lerp(DarkIntensity, LightIntensity, 0.33);

    export const Black: number[] = [30, 30, 30, 255];
    export const White: number[] = [210, 210, 210, 255];
    export const Gray66: number[] = [150, 150, 150, 255];
    export const Gray33: number[] = [91, 91, 91, 255];
    export const Red: number[] = [210, 30, 30, 255];
    export const Orange: number[] = [210, 150, 30, 255];
    export const Yellow: number[] = [210, 210, 30, 255];
    export const Green: number[] = [30, 210, 30, 255];
    export const Cyan: number[] = [30, 210, 210, 255];
    export const Blue: number[] = [30, 30, 210, 255];
    export const Indigo: number[] = [91, 30, 210, 255];
    export const Violet: number[] = [150, 30, 150, 255];
    export const Magenta: number[] = [210, 30, 210, 255];
    // export const DarkGreen: number[] = [30, 91, 30, 255];
    export const Brown: number[] = [150, 91, 30, 255];
    export const SkyBlue: number[] = [30, 150, 210, 255];
    export const DarkRed: number[] = [120, 30, 30, 255];
    export const DarkCyan: number[] = [30, 120, 120, 255];
    export const DarkGreen: number[] = [30, 120, 30, 255];
    export const DarkMagenta: number[] = [120, 30, 120, 255];
    export const DarkBlue: number[] = [30, 30, 120, 255];
    export const DarkYellow: number[] = [120, 120, 30, 255];
    export const LightRed: number[] = [210, 120, 120, 255];
    export const LightCyan: number[] = [120, 210, 210, 255];
    export const LightGreen: number[] = [120, 210, 120, 255];
    export const LightMagenta: number[] = [210, 120, 210, 255];
    export const LightBlue: number[] = [120, 120, 210, 255];
    export const LightYellow: number[] = [210, 210, 120, 255];

    export const ArneOrange: number[] = [235, 137, 49, 255];
    export const ArneYellow: number[] = [247, 226, 107, 255];
    export const ArneDarkGreen: number[] = [47, 72, 78, 255];
    export const ArneGreen: number[] = [68, 137, 26, 255];
    export const ArneSlimeGreen: number[] = [163, 206, 39, 255];
    export const ArneNightBlue: number[] = [27, 38, 50, 255];
    export const ArneSeaBlue: number[] = [0, 87, 132, 255];
    export const ArneSkyBlue: number[] = [49, 162, 242, 255];
    export const ArneCloudBlue: number[] = [178, 220, 239, 255];
    export const ArneDarkBlue: number[] = [52, 42, 151, 255];
    export const ArneDarkGray: number[] = [101, 109, 113, 255];
    export const ArneLightGray: number[] = [204, 204, 204, 255];
    export const ArneDarkRed: number[] = [115, 41, 48, 255];
    export const ArneRose: number[] = [203, 67, 167, 255];
    export const ArneTaupe: number[] = [82, 79, 64, 255];
    export const ArneGold: number[] = [173, 157, 51, 255];
    export const ArneTangerine: number[] = [236, 71, 0, 255];
    export const ArneHoney: number[] = [250, 180, 11, 255];
    export const ArneMossyGreen: number[] = [17, 94, 51, 255];
    export const ArneDarkCyan: number[] = [20, 128, 126, 255];
    export const ArneCyan: number[] = [21, 194, 165, 255];
    export const ArneBlue: number[] = [34, 90, 246, 255];
    export const ArneIndigo: number[] = [153, 100, 249, 255];
    export const ArnePink: number[] = [247, 142, 214, 255];
    export const ArneSkin: number[] = [244, 185, 144, 255];
    export const ArneBlack: number[] = [30, 30, 30, 255];
}
