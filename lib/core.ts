"use strict";

import * as DICT from "./dict";

const FIRST_PINYIN_UNIHAN = "\u963F";
const LAST_PINYIN_UNIHAN = "\u9FFF";

let supported: boolean | null = null;
let COLLATOR: Intl.Collator;

function patchDict(patchers: any) {
  if (!patchers) {
    return;
  }
  if (typeof patchers === "function") {
    patchers = [patchers];
  }
  if (Array.isArray(patchers)) {
    patchers.forEach((p) => {
      typeof p === "function" && p(DICT);
    });
  }
}

function isSupported(force?: boolean) {
  if (!force && supported !== null) {
    return supported;
  }
  if (typeof Intl === "object" && Intl.Collator) {
    COLLATOR = new Intl.Collator(["zh-Hans-CN", "zh-CN"]);
    supported = Intl.Collator.supportedLocalesOf(["zh-CN"]).length === 1;
  } else {
    supported = false;
  }
  return supported;
}

export enum TokenType {
  LATIN = 1,
  PINYIN = 2,
  UNKNOWN = 3,
}
export type Token = {
  type: TokenType;
  source: string;
  target: string;
};

function genToken(ch: string) {
  // Access DICT here, give the chance to patch DICT.
  const UNIHANS = DICT.UNIHANS;
  const PINYINS = DICT.PINYINS;
  const EXCEPTIONS = DICT.EXCEPTIONS;
  const token: Token = {
    type: TokenType.UNKNOWN,
    source: ch,
    target: ch,
  };

  // First check EXCEPTIONS map, then search with UNIHANS table.
  if (ch in EXCEPTIONS) {
    token.type = TokenType.PINYIN;
    token.target = EXCEPTIONS[ch];
    return token;
  }

  let offset = -1;
  let cmp;
  if (ch.charCodeAt(0) < 256) {
    token.type = TokenType.LATIN;
    token.target = ch;
    return token;
  } else {
    cmp = COLLATOR.compare(ch, FIRST_PINYIN_UNIHAN);
    if (cmp < 0) {
      token.type = TokenType.UNKNOWN;
      token.target = ch;
      return token;
    } else if (cmp === 0) {
      token.type = TokenType.PINYIN;
      offset = 0;
    } else {
      cmp = COLLATOR.compare(ch, LAST_PINYIN_UNIHAN);
      if (cmp > 0) {
        token.type = TokenType.UNKNOWN;
        token.target = ch;
        return token;
      } else if (cmp === 0) {
        token.type = TokenType.PINYIN;
        offset = UNIHANS.length - 1;
      }
    }
  }

  token.type = TokenType.PINYIN;
  if (offset < 0) {
    let begin = 0;
    let end = UNIHANS.length - 1;
    while (begin <= end) {
      offset = ~~((begin + end) / 2);
      let unihan = UNIHANS[offset];
      cmp = COLLATOR.compare(ch, unihan);

      // Catch it.
      if (cmp === 0) {
        break;
      }
      // Search after offset.
      else if (cmp > 0) {
        begin = offset + 1;
      }
      // Search before the offset.
      else {
        end = offset - 1;
      }
    }
  }

  if (cmp < 0) {
    offset--;
  }

  token.target = PINYINS[offset];
  if (!token.target) {
    token.type = TokenType.UNKNOWN;
    token.target = token.source;
  }

  return token;
}

function parse(str: string): any[] {
  // if (typeof str !== "string") {
  //   throw new Error("argument should be string.");
  // }
  if (!isSupported()) {
    throw new Error("not support Intl or zh-CN language.");
  }
  return str.split("").map((v) => genToken(v));
}

function convertToPinyin(str: string, separator?: string, upperCase?: boolean) {
  return parse(str)
    .map((v) => {
      if (!upperCase && v.type === TokenType.PINYIN) {
        return v.target.toLowerCase();
      }
      return v.target;
    })
    .join(separator || "");
}

export { convertToPinyin, genToken, isSupported, parse, patchDict };
