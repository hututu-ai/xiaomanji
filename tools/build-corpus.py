#!/usr/bin/env python3
# 从《诗词分类大全.xlsx》(9万首) 精选种子诗库 → src/data/poems.json
# 规则：很有名(生僻度=1) + 有白话意境 + 长度适合诗笺(6~130字) + 每作者≤18首 + 去重
# 用法： python3 tools/build-corpus.py /path/to/诗词分类大全.xlsx
import openpyxl, json, collections, re, os, sys

XLSX = sys.argv[1] if len(sys.argv) > 1 else os.path.expanduser('~/Desktop/诗词分类大全.xlsx')
OUT = os.path.join(os.path.dirname(__file__), '..', 'src', 'data', 'poems.json')

wb = openpyxl.load_workbook(XLSX, read_only=True, data_only=True)
ws = wb['诗词分类']; it = ws.iter_rows(values_only=True)
H = list(next(it)); idx = {n: i for i, n in enumerate(H)}
def g(r, n): v = r[idx[n]]; return v if v is not None else ''
def gl(r, n):
    v = g(r, n); return [x for x in str(v).replace('，', ',').split(',') if x] if v else []
def headline(full, mj):
    mj = str(mj).strip()
    if mj: return mj
    return (re.split(r'[。！？]', full)[0] or full)

seed = []; seen = set(); cap = collections.Counter()
for r in it:
    if g(r, '启用') != '是': continue
    full = str(g(r, '全文')).strip()
    if not full or not (6 <= len(full) <= 130): continue
    if g(r, '生僻度') != 1: continue
    if not g(r, '白话意境句 ⭐'): continue
    if full in seen: continue
    au = str(g(r, '作者'))
    if cap[au] >= 18: continue
    seen.add(full); cap[au] += 1
    seed.append({
        "id": g(r, 'id'), "mingju": headline(full, g(r, '名句 ⭐')), "full": full,
        "title": str(g(r, '题目')), "author": au, "dynasty": str(g(r, '朝代')),
        "form": str(g(r, '体裁')), "season": str(g(r, '季节')), "time": str(g(r, '时段')),
        "scene": gl(r, '场景'), "image": gl(r, '意象'), "mood": gl(r, '情绪 ⭐'),
        "aura": gl(r, '意境/气质 ⭐'), "theme": gl(r, '主题母题'),
        "abstract": g(r, '抽象友好') == '是', "gist": str(g(r, '白话意境句 ⭐')),
        "modern": gl(r, '适配现代画面'), "headliner": g(r, '作者是否头部') == '是',
    })

json.dump(seed, open(OUT, 'w', encoding='utf-8'), ensure_ascii=False)
print(f'种子库 {len(seed)} 首 → {OUT}  ({round(os.path.getsize(OUT)/1024)} KB)')
