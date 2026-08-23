import { VoiceCommand } from './types';

export class VoiceCommandParser {
  static parse(text: string): VoiceCommand {
    const t = text.toLowerCase().trim();

    if (t.match(/stop|ruko|shant|bas|roko/)) return 'STOP';
    if (t.match(/end conversation|bye|alvida|band karo/)) return 'END_SESSION';
    if (t.match(/speak slower|dheere bolo|dheeme bolo|dheeme/)) return 'SPEAK_SLOWER';
    if (t.match(/speak faster|jaldi bolo|tez bolo/)) return 'SPEAK_FASTER';
    if (t.match(/speak normal|normal/)) return 'SPEAK_NORMAL';
    if (t.match(/speak in hindi|hindi me bolo|hindi mein baat karo/)) return 'LANG_HINDI';
    if (t.match(/speak in gujarati|gujarati ma bolo|gujarati ma vaat karo/)) return 'LANG_GUJARATI';
    if (t.match(/speak in english|english me bolo/)) return 'LANG_ENGLISH';
    if (t.match(/repeat|dobara bolo|fir se bolo/)) return 'REPEAT';

    return null;
  }
}
