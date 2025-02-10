/* eslint-disable @typescript-eslint/no-magic-numbers */

import { HintLevel } from '@app/interfaces/hints';

// Canvas
export const IMAGE_HEIGHT = 480;
export const IMAGE_WIDTH = 640;
export const BYTE_PER_PIXEL = 4;

// ConstantInit
export const PENALTY = 5;
export const TIME_WON = 5;
export const TOTAL_TIME = 90;
export const MIN_TOTAL_TIME = 30;
export const MAX_TIME_WON = 30;
export const MAX_PENALTY = 30;

// Timer
export const ONE_SECOND_IN_MS = 1000;
export const MINUTES_INDEX_POSITION = 14;
export const SECONDS_INDEX_POSITION = 19;

// Player name
export const NAME_MIN_LENGTH = 2;
export const NAME_MAX_LENGTH = 8;

// Game selection
export const MAX_NUMBER_CARDS_PER_PAGE = 4;

// Sound
export const CORRECT_SOUND_PATH = '/sound/correct';
export const INCORRECT_SOUND_PATH = '/sound/incorrect';

// Creation
export const AVAILABLE_RADIUS = [0, 3, 9, 15];
export const DEFAULT_RADIUS = 3;

// Tool: Pencil and Eraser
export const PENCIL_RADIUS = 5;
export const PENCIL_COLOR = '#000000';

// Chat-scroll
export const TIME_BEFORE_SCROLL = 10;

// Game page
export const GAME_DOES_NOT_EXIST = "Cette partie n'existe pas.";

// hints
export const EYE_MARGIN = 80;
export const EYE_RADIUS = 30;
export const PUPIL_RADIUS = 13;
export const HINTS = [HintLevel.Last, HintLevel.Second, HintLevel.First];

// Player left options
export enum PlayerLeftOptions {
    ContinueSolo,
    Leave,
}

// Path
export const GAME_PAGE_PATH = '/game';
export const HOME_PAGE_PATH = '/home';
export const ADMIN_PAGE_PATH = '/admin';
