"use client";

import { useState } from "react";
import { Lock, FileDigit, Copy, Eraser, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";


interface HashResult {
  md5: string;
  sha1: string;
  sha256: string;
  sha512: string;
}

export default function HashPage() {
  const [input, setInput] = useState("");
  const [results, setResults] = useState<HashResult | null>(null);
  const [loading, setLoading] = useState(false);

  // MD5 Implementation preserved from original
  const calculateMD5 = async (str: string): Promise<string> => {
    const md5 = (string: string) => {
      const rotateLeft = (x: number, n: number) => (x << n) | (x >>> (32 - n));
      const addUnsigned = (x: number, y: number) => {
        const x4 = x & 0x80000000;
        const y4 = y & 0x80000000;
        const x8 = x & 0x40000000;
        const y8 = y & 0x40000000;
        const result = (x & 0x3fffffff) + (y & 0x3fffffff);
        if (x8 & y8) return result ^ 0x80000000 ^ x4 ^ y4;
        if (x8 | y8) {
          if (result & 0x40000000) return result ^ 0xc0000000 ^ x4 ^ y4;
          else return result ^ 0x40000000 ^ x4 ^ y4;
        } else {
          return result ^ x4 ^ y4;
        }
      };

      const F = (x: number, y: number, z: number) => (x & y) | (~x & z);
      const G = (x: number, y: number, z: number) => (x & z) | (y & ~z);
      const H = (x: number, y: number, z: number) => x ^ y ^ z;
      const I = (x: number, y: number, z: number) => y ^ (x | ~z);

      const FF = (a: number, b: number, c: number, d: number, x: number, s: number, ac: number) =>
        addUnsigned(rotateLeft(addUnsigned(addUnsigned(a, F(b, c, d)), addUnsigned(x, ac)), s), b);
      const GG = (a: number, b: number, c: number, d: number, x: number, s: number, ac: number) =>
        addUnsigned(rotateLeft(addUnsigned(addUnsigned(a, G(b, c, d)), addUnsigned(x, ac)), s), b);
      const HH = (a: number, b: number, c: number, d: number, x: number, s: number, ac: number) =>
        addUnsigned(rotateLeft(addUnsigned(addUnsigned(a, H(b, c, d)), addUnsigned(x, ac)), s), b);
      const II = (a: number, b: number, c: number, d: number, x: number, s: number, ac: number) =>
        addUnsigned(rotateLeft(addUnsigned(addUnsigned(a, I(b, c, d)), addUnsigned(x, ac)), s), b);

      const convertToWordArray = (str: string) => {
        let lWordCount;
        const lMessageLength = str.length;
        const lNumberOfWords = (((lMessageLength + 8) - ((lMessageLength + 8) % 64)) / 64 + 1) * 16;
        const lWordArray = Array(lNumberOfWords - 1).fill(0);
        let lBytePosition = 0;
        let lByteCount = 0;
        while (lByteCount < lMessageLength) {
          lWordCount = (lByteCount - (lByteCount % 4)) / 4;
          lBytePosition = (lByteCount % 4) * 8;
          lWordArray[lWordCount] = lWordArray[lWordCount] | (str.charCodeAt(lByteCount) << lBytePosition);
          lByteCount++;
        }
        lWordCount = (lByteCount - (lByteCount % 4)) / 4;
        lBytePosition = (lByteCount % 4) * 8;
        lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80 << lBytePosition);
        lWordArray[lNumberOfWords - 2] = lMessageLength << 3;
        lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29;
        return lWordArray;
      };

      const wordToHex = (lValue: number) => {
        let result = "";
        for (let lCount = 0; lCount <= 3; lCount++) {
          const lByte = (lValue >>> (lCount * 8)) & 255;
          result += ("0" + lByte.toString(16)).slice(-2);
        }
        return result;
      };

      const utf8Encode = (str: string) => {
        return unescape(encodeURIComponent(str));
      };

      const x = convertToWordArray(utf8Encode(string));
      let a = 0x67452301, b = 0xefcdab89, c = 0x98badcfe, d = 0x10325476;

      for (let k = 0; k < x.length; k += 16) {
        const AA = a, BB = b, CC = c, DD = d;
        a = FF(a, b, c, d, x[k], 7, 0xd76aa478);
        d = FF(d, a, b, c, x[k + 1], 12, 0xe8c7b756);
        c = FF(c, d, a, b, x[k + 2], 17, 0x242070db);
        b = FF(b, c, d, a, x[k + 3], 22, 0xc1bdceee);
        a = FF(a, b, c, d, x[k + 4], 7, 0xf57c0faf);
        d = FF(d, a, b, c, x[k + 5], 12, 0x4787c62a);
        c = FF(c, d, a, b, x[k + 6], 17, 0xa8304613);
        b = FF(b, c, d, a, x[k + 7], 22, 0xfd469501);
        a = FF(a, b, c, d, x[k + 8], 7, 0x698098d8);
        d = FF(d, a, b, c, x[k + 9], 12, 0x8b44f7af);
        c = FF(c, d, a, b, x[k + 10], 17, 0xffff5bb1);
        b = FF(b, c, d, a, x[k + 11], 22, 0x895cd7be);
        a = FF(a, b, c, d, x[k + 12], 7, 0x6b901122);
        d = FF(d, a, b, c, x[k + 13], 12, 0xfd987193);
        c = FF(c, d, a, b, x[k + 14], 17, 0xa679438e);
        b = FF(b, c, d, a, x[k + 15], 22, 0x49b40821);
        a = GG(a, b, c, d, x[k + 1], 5, 0xf61e2562);
        d = GG(d, a, b, c, x[k + 6], 9, 0xc040b340);
        c = GG(c, d, a, b, x[k + 11], 14, 0x265e5a51);
        b = GG(b, c, d, a, x[k], 20, 0xe9b6c7aa);
        a = GG(a, b, c, d, x[k + 5], 5, 0xd62f105d);
        d = GG(d, a, b, c, x[k + 10], 9, 0x2441453);
        c = GG(c, d, a, b, x[k + 15], 14, 0xd8a1e681);
        b = GG(b, c, d, a, x[k + 4], 20, 0xe7d3fbc8);
        a = GG(a, b, c, d, x[k + 9], 5, 0x21e1cde6);
        d = GG(d, a, b, c, x[k + 14], 9, 0xc33707d6);
        c = GG(c, d, a, b, x[k + 3], 14, 0xf4d50d87);
        b = GG(b, c, d, a, x[k + 8], 20, 0x455a14ed);
        a = GG(a, b, c, d, x[k + 13], 5, 0xa9e3e905);
        d = GG(d, a, b, c, x[k + 2], 9, 0xfcefa3f8);
        c = GG(c, d, a, b, x[k + 7], 14, 0x676f02d9);
        b = GG(b, c, d, a, x[k + 12], 20, 0x8d2a4c8a);
        a = HH(a, b, c, d, x[k + 5], 4, 0xfffa3942);
        d = HH(d, a, b, c, x[k + 8], 11, 0x8771f681);
        c = HH(c, d, a, b, x[k + 11], 16, 0x6d9d6122);
        b = HH(b, c, d, a, x[k + 14], 23, 0xfde5380c);
        a = HH(a, b, c, d, x[k + 1], 4, 0xa4beea44);
        d = HH(d, a, b, c, x[k + 4], 11, 0x4bdecfa9);
        c = HH(c, d, a, b, x[k + 7], 16, 0xf6bb4b60);
        b = HH(b, c, d, a, x[k + 10], 23, 0xbebfbc70);
        a = HH(a, b, c, d, x[k + 13], 4, 0x289b7ec6);
        d = HH(d, a, b, c, x[k], 11, 0xeaa127fa);
        c = HH(c, d, a, b, x[k + 3], 16, 0xd4ef3085);
        b = HH(b, c, d, a, x[k + 6], 23, 0x4881d05);
        a = HH(a, b, c, d, x[k + 9], 4, 0xd9d4d039);
        d = HH(d, a, b, c, x[k + 12], 11, 0xe6db99e5);
        c = HH(c, d, a, b, x[k + 15], 16, 0x1fa27cf8);
        b = HH(b, c, d, a, x[k + 2], 23, 0xc4ac5665);
        a = II(a, b, c, d, x[k], 6, 0xf4292244);
        d = II(d, a, b, c, x[k + 7], 10, 0x432aff97);
        c = II(c, d, a, b, x[k + 14], 15, 0xab9423a7);
        b = II(b, c, d, a, x[k + 5], 21, 0xfc93a039);
        a = II(a, b, c, d, x[k + 12], 6, 0x655b59c3);
        d = II(d, a, b, c, x[k + 3], 10, 0x8f0ccc92);
        c = II(c, d, a, b, x[k + 10], 15, 0xffeff47d);
        b = II(b, c, d, a, x[k + 1], 21, 0x85845dd1);
        a = II(a, b, c, d, x[k + 8], 6, 0x6fa87e4f);
        d = II(d, a, b, c, x[k + 15], 10, 0xfe2ce6e0);
        c = II(c, d, a, b, x[k + 6], 15, 0xa3014314);
        b = II(b, c, d, a, x[k + 13], 21, 0x4e0811a1);
        a = II(a, b, c, d, x[k + 4], 6, 0xf7537e82);
        d = II(d, a, b, c, x[k + 11], 10, 0xbd3af235);
        c = II(c, d, a, b, x[k + 2], 15, 0x2ad7d2bb);
        b = II(b, c, d, a, x[k + 9], 21, 0xeb86d391);
        a = addUnsigned(a, AA);
        b = addUnsigned(b, BB);
        c = addUnsigned(c, CC);
        d = addUnsigned(d, DD);
      }
      return wordToHex(a) + wordToHex(b) + wordToHex(c) + wordToHex(d);
    };
    return md5(str);
  };

  const calculateHash = async () => {
    if (!input) {
      toast.warning("请输入要计算哈希的内容");
      return;
    }

    setLoading(true);
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(input);

      const [sha1, sha256, sha512] = await Promise.all([
        crypto.subtle.digest("SHA-1", data),
        crypto.subtle.digest("SHA-256", data),
        crypto.subtle.digest("SHA-512", data),
      ]);

      const md5Hash = await calculateMD5(input);

      const arrayBufferToHex = (buffer: ArrayBuffer): string => {
        return Array.from(new Uint8Array(buffer))
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("");
      };

      setResults({
        md5: md5Hash,
        sha1: arrayBufferToHex(sha1),
        sha256: arrayBufferToHex(sha256),
        sha512: arrayBufferToHex(sha512),
      });
      toast.success("计算完成");
    } catch {
      toast.error("计算失败");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, name: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${name} 已复制`);
    } catch {
      toast.error("复制失败");
    }
  };

  const clearAll = () => {
    setInput("");
    setResults(null);
  };

  const HashResultItem = ({ label, value }: { label: string; value: string }) => (
    <div className="rounded-lg bg-muted p-4 space-y-2">
      <div className="flex items-center justify-between">
        <span className="font-medium text-sm">{label}</span>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 gap-1"
          onClick={() => copyToClipboard(value, label)}
        >
          <Copy className="h-3 w-3" />
          <span className="text-xs">复制</span>
        </Button>
      </div>
      <code className="block break-all font-mono text-sm leading-relaxed bg-background/50 p-2 rounded border">
        {value}
      </code>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Page Header */}
      <div className="flex items-center space-x-4 border-b pb-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-red-500 to-rose-600 shadow-lg">
          <FileDigit className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Hash 计算</h1>
          <p className="text-muted-foreground">
            计算文本的 MD5、SHA1、SHA256、SHA512 哈希值
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <Card className="h-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-base font-medium">输入文本</CardTitle>
              <div className="flex gap-2">
                 <Button onClick={calculateHash} disabled={loading || !input} className="gap-2" size="sm">
                  <Zap className="h-4 w-4" />
                  {loading ? "计算中..." : "计算哈希"}
                </Button>
                <Button variant="ghost" size="icon" onClick={clearAll} className="h-8 w-8 text-destructive">
                  <Eraser className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 min-h-[400px]">
               <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="请输入要计算哈希值的文本..."
                className="h-full min-h-[300px] resize-none font-mono"
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="h-full flex flex-col">
             <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <Lock className="h-4 w-4" />
                哈希结果
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1">
              {results ? (
                <div className="space-y-3">
                  <HashResultItem label="MD5 (32位)" value={results.md5} />
                  <HashResultItem label="SHA1 (40位)" value={results.sha1} />
                  <HashResultItem label="SHA256 (64位)" value={results.sha256} />
                  <HashResultItem label="SHA512 (128位)" value={results.sha512} />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-muted-foreground">
                  <FileDigit className="h-16 w-16 mb-4 opacity-20" />
                  <p>输入文本后点击计算哈希</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <span className="text-xl">💡</span> 使用说明
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <ul className="list-disc pl-4 text-sm text-muted-foreground space-y-1">
                <li>MD5 产生 128 位（16 字节）哈希值，已不推荐用于安全场景</li>
                <li>SHA1 产生 160 位（20 字节）哈希值</li>
                <li>SHA256 产生 256 位（32 字节）哈希值，安全性较高</li>
              </ul>
            </div>
            <div className="space-y-2">
               <ul className="list-disc pl-4 text-sm text-muted-foreground space-y-1">
                <li>SHA512 产生 512 位（64 字节）哈希值，安全性最高</li>
                <li>哈希函数是单向的，无法从哈希值反推原文</li>
                <li>相同输入总是产生相同输出</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
