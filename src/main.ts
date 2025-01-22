import pinyin from "../lib";

async function main() {
  console.log(pinyin.convertToPinyin("安装和使用长", " "));
  console.log(pinyin.convertToPinyin("hello-world", " "));
}

main().catch((err) => console.error(err));
