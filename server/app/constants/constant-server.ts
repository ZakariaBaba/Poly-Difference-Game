// Path
export const IMAGE_PATH = './assets/image/';
export const JSON_PATH = './assets/data.json';
export const CORRECT_SOUND_PATH = './app/sounds/correct-sound.mp3';
export const INCORRECT_SOUND_PATH = './app/sounds/incorrect-sound.mp3';
export const SERVER_PATH = 'http://localhost:3000/api/';
export const ORIGINAL_IMAGE_PATH_SERVER = '/image/original-image/';
export const MODIFIED_IMAGE_PATH_SERVER = '/image/modified-image/';
export const RELATIVE_PATH_TO_DIFFERENCES = './assets/differences/';
export const CONSTANT_PATH = './assets/gameConstant.json';

// Image extension
export const ORIGINAL_EXT = '_original.bmp';
export const MODIFIED_EXT = '_modified.bmp';

// File extension
export const JSON_EXT = '.json';

// Encoding
export const ENCODING = 'utf-8';
export const BASE64 = 'base64';
// Date - Time
export const LOCALE = 'it-IT';

// File
export const GITKEEP = '.gitkeep';

// Error message
export const FILE_GENERATION_ERROR = 'error while generating file';
export const JSON_WRITING_ERROR = 'error while writing in the json file';
export const FILE_NOT_FOUND = 'File not found';

// Header
export const CONTENT_TYPE = 'content-type';
export const AUDIO = 'audio/mpeg';
export const BMP_IMAGE = 'image/bmp';

// Lobby message
export const HOST_LEFT_MESSAGE = 'Le créateur a quitté la partie.';
export const REQUEST_REJECTED_MESSAGE = 'Votre demande de joindre la partie a été rejetée.';
export const GAME_DELETED_MESSAGE = 'Cette fiche a été supprimé. Veuillez choisir une autre fiche.';
export const LOBBY_FULL_MESSAGE = 'La partie est pleine';
export const LOBBY_ALREADY_CREATED_MESSAGE = 'La partie a déjà été créée';

// Game message
export const FORFEIT_MESSAGE = 'Votre adversaire a quitté la partie.';
export const WINNER_MESSAGE = 'Vous avez gagné!';
export const LOSER_MESSAGE = 'Vous avez perdu!';
export const CONGRATULATION_MESSAGE = 'Félicitations! La partie est terminée';
export const SAVING_SCORE_ERROR = "Une erreur est survenue lors de la sauvegarde du score. Votre temps n'a pas été enregistré";
export const CONTINUE_SOLO_MESSAGE = 'Votre adversaire a quitté la partie voulez-vous continuer en mode solo?';

// Error
export const GENERIC_REQUEST_ERROR = 'Quelque chose ne va pas avec votre requete';
export const BAD_IMAGE_ERROR = 'Mauvaise taille image ou mauvaise profondeur';

// Image parameters
export const IMAGE_WIDTH = 640;
export const IMAGE_HEIGHT = 480;
export const IMAGE_DEPTH = 24;

// Game select parameters
export const NUMBER_OF_GAMES_PER_PAGE = 4;

// Game parameters
export const NB_PLAYERS = 2;
export enum GameMessages {
    HintUsed = 'Indice utilisé',
    ErrorDifference = 'Erreur',
    DifferenceFound = 'Différence trouvée',
    PlayerLeft = 'a abandonné la partie',
}

// Score parameters
export const RANDOM_FACTOR = 1000;
export const SECONDS_IN_MINUTE = 60;
export const NUMBERS_THAT_ARE_SINGLE_DIGIT = 10;
export const NOT_IN_TOP_3 = -1;
export const RANDOM_NAME_API = 'https://randomuser.me/api/';

// Timer parameters
export const CLASSIC_TIMER_INITIAL_VALUE = 0;
export const TIMER_MAX_VALUE = 120;
export const ONE_SECONDS_IN_MS = 1000;
