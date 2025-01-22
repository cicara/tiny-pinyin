# tiny-pinyin

This is a lightweight Chinese character-to-pinyin library that I currently use in conjunction with slug.

Polyphonic characters and tones are not supported.

```shell
pnpm add @cicara/tiny-pinyin
```

```ts
import pinyin from "@cicara/tiny-pinyin";

pinyin.convertToPinyin("安装和使用", " "); // an zhuang he shi yong
```
