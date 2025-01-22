declare function patchDict(patchers: any): void;
declare function isSupported(force?: boolean): boolean;
export declare enum TokenType {
    LATIN = 1,
    PINYIN = 2,
    UNKNOWN = 3
}
export type Token = {
    type: TokenType;
    source: string;
    target: string;
};
declare function genToken(ch: string): Token;
declare function parse(str: string): any[];
declare function convertToPinyin(str: string, separator?: string, upperCase?: boolean): string;
export { convertToPinyin, genToken, isSupported, parse, patchDict };
